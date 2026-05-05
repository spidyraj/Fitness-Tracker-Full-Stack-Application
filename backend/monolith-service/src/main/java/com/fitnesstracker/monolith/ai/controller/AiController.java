package com.fitnesstracker.monolith.ai.controller;

import com.fitnesstracker.monolith.ai.service.GroqService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class AiController {

    private final GroqService groqService;

    public AiController(GroqService groqService) {
        this.groqService = groqService;
    }

    public record ChatRequest(
            @NotBlank(message = "Prompt must not be blank")
            @Size(max = 1000, message = "Prompt must not exceed 1000 characters")
            String prompt
    ) {}

    public record ChatResponse(String response) {}

    /**
     * AI coaching endpoint — returns personalised fitness advice from Groq.
     *
     * Interview talking point: "Why not use reactive Mono return type?"
     * → This service runs on a Servlet (Tomcat) stack, not a reactive Netty server.
     *   Returning Mono from a Servlet controller causes Spring Security's auth context
     *   to be lost on the async thread boundary. We use .block() here intentionally
     *   to keep the security context on the current thread.
     *   In a fully reactive stack (WebFlux + Netty), you would return Mono<ResponseEntity>.
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody ChatRequest request) {

        String response = groqService.getFitnessAdviceSync(userId, request.prompt());
        return ResponseEntity.ok(new ChatResponse(response));
    }

    /**
     * Contextual coaching endpoint — injects user workout history into the prompt.
     * Produces more personalised advice than the basic /chat endpoint.
     */
    @PostMapping("/coach")
    public ResponseEntity<ChatResponse> coach(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CoachRequest request) {

        String contextualPrompt = groqService.buildContextualPrompt(
                request.prompt(),
                request.recentWorkoutCount(),
                request.avgWorkoutMinutes(),
                request.lastWorkoutType()
        );

        String response = groqService.getFitnessAdviceSync(userId, contextualPrompt);
        return ResponseEntity.ok(new ChatResponse(response));
    }

    public record CoachRequest(
            @NotBlank String prompt,
            int recentWorkoutCount,
            int avgWorkoutMinutes,
            String lastWorkoutType
    ) {}
}
