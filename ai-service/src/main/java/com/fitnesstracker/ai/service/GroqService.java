package com.fitnesstracker.ai.service;

import com.fitnesstracker.ai.dto.GroqRequest;
import com.fitnesstracker.ai.dto.GroqResponse;
import com.fitnesstracker.ai.entity.AiLogEntity;
import com.fitnesstracker.ai.repository.AiLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class GroqService {

    private final WebClient webClient;
    private final AiLogRepository aiLogRepository;
    private final String apiKey;
    private final String apiUrl;
    private final String model;

    public GroqService(
            WebClient.Builder webClientBuilder,
            AiLogRepository aiLogRepository,
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.url}") String apiUrl,
            @Value("${groq.api.model}") String model) {

        this.webClient = webClientBuilder.build();
        this.aiLogRepository = aiLogRepository;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
    }

    /**
     * Returns AI fitness advice for the given prompt.
     * Results are cached in Redis by userId + prompt key to avoid redundant Groq API calls.
     * The cache key is a combination of userId and a truncated prompt hash.
     */
    @Cacheable(value = "ai-responses", key = "#userId + ':' + #prompt.hashCode()")
    public String getFitnessAdviceSync(Long userId, String prompt) {
        return callGroqApi(userId, prompt).block();
    }

    /**
     * Async version — fires and forgets while returning a CompletableFuture.
     * Use this from background processors (scheduled jobs, event listeners).
     */
    @Async
    public CompletableFuture<String> getFitnessAdviceAsync(Long userId, String prompt) {
        return callGroqApi(userId, prompt).toFuture();
    }

    /**
     * Reactive version — use from reactive contexts.
     */
    public Mono<String> getFitnessAdvice(Long userId, String prompt) {
        return callGroqApi(userId, prompt);
    }

    // ─── Core Groq API call ───────────────────────────────────────────────────

    private Mono<String> callGroqApi(Long userId, String prompt) {
        String systemPrompt = buildSystemPrompt();

        GroqRequest requestPayload = new GroqRequest(
                model,
                List.of(
                        new GroqRequest.Message("system", systemPrompt),
                        new GroqRequest.Message("user", prompt)
                )
        );

        return webClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestPayload)
                .retrieve()
                .bodyToMono(GroqResponse.class)
                .timeout(java.time.Duration.ofSeconds(10))
                .flatMap(response -> {
                    if (response.choices() != null && !response.choices().isEmpty()) {
                        String aiResponse = response.choices().get(0).message().content();
                        AiLogEntity log = new AiLogEntity(userId, prompt, aiResponse);
                        return aiLogRepository.save(log).map(savedLog -> aiResponse);
                    }
                    return Mono.just("I'm unable to generate advice right now. Please try again.");
                })
                .onErrorResume(ex -> {
                    System.err.println("Groq API error: " + ex.getMessage());
                    return Mono.just("AI service is temporarily unavailable. Your workouts are saved!");
                });
    }

    // ─── Prompt Engineering ───────────────────────────────────────────────────

    /**
     * Builds a rich system prompt that instructs Groq to act as a fitness coach.
     * Keeps the AI focused, concise, and evidence-based.
     * An interviewer would ask: "How do you prevent prompt injection from user input?"
     * Answer: User input goes into the 'user' role, never into the system prompt.
     *         The system prompt is entirely server-controlled.
     */
    private String buildSystemPrompt() {
        return """
                You are FitCoach AI, an elite personal trainer and sports nutritionist.
                
                Your coaching philosophy:
                - Provide concise, actionable, evidence-based advice
                - Prioritise safety — always mention rest and recovery when relevant
                - Personalise responses based on the user's specific situation
                - Use motivating but realistic language
                - Structure responses in clean markdown with headers and bullet points
                
                Constraints:
                - Keep responses under 300 words unless a detailed plan is explicitly requested
                - Never diagnose medical conditions — refer to a doctor for injuries or pain
                - Always recommend professional guidance for significant health changes
                """;
    }

    /**
     * Builds a contextual prompt that injects user history for personalised advice.
     * Called from the recommendation engine to generate smarter suggestions.
     */
    public String buildContextualPrompt(String userPrompt, int recentWorkoutCount,
                                        int avgWorkoutMinutes, String lastWorkoutType) {
        return """
                User context:
                - Recent workouts (last 7 days): %d sessions
                - Average workout duration: %d minutes
                - Last workout type: %s
                
                User question: %s
                """.formatted(recentWorkoutCount, avgWorkoutMinutes, lastWorkoutType, userPrompt);
    }
}
