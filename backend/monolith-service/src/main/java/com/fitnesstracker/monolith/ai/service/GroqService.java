package com.fitnesstracker.monolith.ai.service;

import com.fitnesstracker.monolith.ai.dto.GroqRequest;
import com.fitnesstracker.monolith.ai.dto.GroqResponse;
import com.fitnesstracker.monolith.ai.entity.AiLogEntity;
import com.fitnesstracker.monolith.ai.repository.AiLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service for interacting with the Groq AI API.
 *
 * This service is always instantiated but gracefully handles missing/empty API keys
 * by returning a user-friendly message instead of throwing exceptions.
 *
 * To enable: set GROQ_API_KEY in your .env file.
 */
@Service
public class GroqService {

    private static final Logger log = LoggerFactory.getLogger(GroqService.class);

    private final WebClient webClient;
    private final String apiKey;
    private final String apiUrl;
    private final String model;
    private final boolean configured;

    public GroqService(
            WebClient.Builder webClientBuilder,
            @Value("${groq.api.key:}") String apiKey,
            @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}") String apiUrl,
            @Value("${groq.api.model:llama3-8b-8192}") String model
    ) {
        this.webClient = webClientBuilder.build();
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        this.configured = StringUtils.hasText(apiKey) && !apiKey.equals("your_groq_api_key_here");

        if (this.configured) {
            log.info("GroqService initialized with model: {}", model);
        } else {
            log.warn("GroqService: GROQ_API_KEY is not set. AI features will return placeholder responses. " +
                     "Set GROQ_API_KEY in your .env file to enable AI coaching.");
        }
    }

    /**
     * Returns whether the AI service is properly configured with a valid API key.
     */
    public boolean isConfigured() {
        return configured;
    }

    /**
     * Synchronous AI advice — blocks the calling thread.
     * Cached by userId + prompt hash to reduce API calls.
     */
    @Cacheable(value = "ai-responses", key = "#userId + ':' + #prompt.hashCode()")
    public String getFitnessAdviceSync(Long userId, String prompt) {
        if (!configured) {
            return buildNotConfiguredMessage();
        }
        String result = callGroqApi(userId, prompt).block(Duration.ofSeconds(15));
        return result != null ? result : "Sorry, I couldn't generate a response. Please try again.";
    }

    /**
     * Async version — returns a CompletableFuture for use in background processing.
     */
    @Async
    public CompletableFuture<String> getFitnessAdviceAsync(Long userId, String prompt) {
        if (!configured) {
            return CompletableFuture.completedFuture(buildNotConfiguredMessage());
        }
        return callGroqApi(userId, prompt).toFuture();
    }

    /**
     * Reactive version for use in reactive contexts.
     */
    public Mono<String> getFitnessAdvice(Long userId, String prompt) {
        if (!configured) {
            return Mono.just(buildNotConfiguredMessage());
        }
        return callGroqApi(userId, prompt);
    }

    // ─── Core Groq API call ───────────────────────────────────────────────────

    private Mono<String> callGroqApi(Long userId, String prompt) {
        GroqRequest requestPayload = new GroqRequest(
                model,
                List.of(
                        new GroqRequest.Message("system", buildSystemPrompt()),
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
                .timeout(Duration.ofSeconds(12))
                .flatMap(response -> {
                    if (response.choices() != null && !response.choices().isEmpty()) {
                        String aiResponse = response.choices().get(0).message().content();
                        log.debug("AI response generated for user {}", userId);
                        return Mono.just(aiResponse);
                    }
                    return Mono.just("I couldn't generate a response right now. Please try again.");
                })
                .onErrorResume(ex -> {
                    String errorType = ex.getClass().getSimpleName();
                    log.error("Groq API error for user {}: {} - {}", userId, errorType, ex.getMessage());

                    if (ex.getMessage() != null && ex.getMessage().contains("401")) {
                        return Mono.just("⚠️ Invalid API key. Please check your GROQ_API_KEY in the .env file.");
                    } else if (ex.getMessage() != null && ex.getMessage().contains("429")) {
                        return Mono.just("⏳ Rate limit reached. Please wait a moment and try again.");
                    } else if (errorType.contains("Timeout")) {
                        return Mono.just("⌛ The AI request timed out. Groq may be busy — please try again in a moment.");
                    } else if (ex.getMessage() != null && ex.getMessage().contains("Connection refused")) {
                        return Mono.just("🔌 Cannot reach the Groq API. Please check your internet connection.");
                    }
                    return Mono.just("🤖 FitCoach encountered an issue: " + ex.getMessage() +
                                     "\n\nPlease verify your GROQ_API_KEY is valid at https://console.groq.com");
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
     */
    public String buildContextualPrompt(String userPrompt, int recentWorkoutCount,
                                        int avgWorkoutMinutes, String lastWorkoutType) {
        return """
                User context:
                - Recent workouts (last 7 days): %d sessions
                - Average workout duration: %d minutes
                - Last workout type: %s
                
                User question: %s
                """.formatted(recentWorkoutCount, avgWorkoutMinutes,
                              lastWorkoutType != null ? lastWorkoutType : "Unknown",
                              userPrompt);
    }

    /**
     * Builds a prompt that includes user profile data for more personalised advice.
     */
    public String buildProfileAwarePrompt(String userPrompt, UserProfileContext profile) {
        StringBuilder sb = new StringBuilder("User profile:\n");
        if (profile.age() != null) sb.append("- Age: ").append(profile.age()).append("\n");
        if (profile.weightKg() != null) sb.append("- Weight: ").append(profile.weightKg()).append(" kg\n");
        if (profile.heightCm() != null) sb.append("- Height: ").append(profile.heightCm()).append(" cm\n");
        if (profile.fitnessGoal() != null) sb.append("- Goal: ").append(profile.fitnessGoal()).append("\n");
        if (profile.activityLevel() != null) sb.append("- Activity level: ").append(profile.activityLevel()).append("\n");
        if (profile.medicalNotes() != null) sb.append("- Notes: ").append(profile.medicalNotes()).append("\n");
        sb.append("\nUser question: ").append(userPrompt);
        return sb.toString();
    }

    private String buildNotConfiguredMessage() {
        return """
                🔧 **AI Coach Not Configured**
                
                The FitCoach AI requires a Groq API key to function.
                
                **To enable AI coaching:**
                1. Get a free API key at [console.groq.com](https://console.groq.com)
                2. Add `GROQ_API_KEY=gsk_your_key_here` to your `.env` file
                3. Restart the backend service
                
                The Groq free tier allows 14,400 requests/day — more than enough for personal use!
                """;
    }

    /**
     * Profile context record for AI-aware prompting.
     */
    public record UserProfileContext(
            Integer age,
            Double weightKg,
            Double heightCm,
            String fitnessGoal,
            String activityLevel,
            String medicalNotes,
            String dietaryRestrictions,
            Integer weeklyWorkoutTarget
    ) {}
}
