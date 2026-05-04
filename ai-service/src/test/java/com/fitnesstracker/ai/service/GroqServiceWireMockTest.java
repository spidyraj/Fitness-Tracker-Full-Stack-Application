package com.fitnesstracker.ai.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * AI Service unit tests with WireMock to mock the Groq API.
 *
 * Interview talking point: "Why WireMock instead of @MockBean on WebClient?"
 * → WebClient is a fluent builder and is notoriously hard to mock with Mockito.
 *   WireMock intercepts at the HTTP level — it starts a real local server that
 *   the WebClient calls. This tests the actual HTTP request/response serialization,
 *   headers, and JSON deserialization paths — not just the Java logic.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GroqService WireMock Tests")
class GroqServiceWireMockTest {

    private static WireMockServer wireMockServer;

    @Mock
    private com.fitnesstracker.ai.repository.AiLogRepository aiLogRepository;

    private GroqService groqService;

    @BeforeAll
    static void startWireMock() {
        wireMockServer = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
        wireMockServer.start();
    }

    @AfterAll
    static void stopWireMock() {
        wireMockServer.stop();
    }

    @BeforeEach
    void setUp() {
        wireMockServer.resetAll();

        // Point GroqService at the WireMock server instead of real Groq
        groqService = new GroqService(
                WebClient.builder(),
                aiLogRepository,
                "test-api-key",
                "http://localhost:" + wireMockServer.port() + "/openai/v1/chat/completions",
                "llama3-8b-8192"
        );
    }

    @Test
    @DisplayName("Should return AI response when Groq API succeeds")
    void shouldReturnAiResponseOnSuccess() {
        // Arrange — stub Groq API to return a successful response
        wireMockServer.stubFor(post(urlEqualTo("/openai/v1/chat/completions"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody("""
                                {
                                  "choices": [
                                    {
                                      "message": {
                                        "role": "assistant",
                                        "content": "Great question! For post-run recovery, focus on protein and carbs."
                                      }
                                    }
                                  ]
                                }
                                """)));

        // Mock the MongoDB save to return a dummy log
        com.fitnesstracker.ai.entity.AiLogEntity mockLog =
                new com.fitnesstracker.ai.entity.AiLogEntity(1L, "test prompt", "test response");
        when(aiLogRepository.save(any())).thenReturn(Mono.just(mockLog));

        // Act
        String result = groqService.getFitnessAdvice(1L, "What should I eat after a 5k run?").block();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).contains("protein and carbs");

        // Verify WireMock received the request with the correct API key header
        wireMockServer.verify(postRequestedFor(urlEqualTo("/openai/v1/chat/completions"))
                .withHeader("Authorization", equalTo("Bearer test-api-key"))
                .withHeader("Content-Type", equalTo("application/json")));
    }

    @Test
    @DisplayName("Should return fallback message when Groq API returns 500")
    void shouldReturnFallbackOnGroqError() {
        // Arrange — stub Groq API to return a server error
        wireMockServer.stubFor(post(urlEqualTo("/openai/v1/chat/completions"))
                .willReturn(aResponse().withStatus(500)));

        // Act
        String result = groqService.getFitnessAdvice(1L, "What should I eat?").block();

        // Assert — graceful degradation, not an exception
        assertThat(result).isNotNull();
        assertThat(result).contains("temporarily unavailable");
    }

    @Test
    @DisplayName("Should return fallback message when Groq API times out")
    void shouldReturnFallbackOnTimeout() {
        // Arrange — stub with a long delay to simulate timeout
        wireMockServer.stubFor(post(urlEqualTo("/openai/v1/chat/completions"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withFixedDelay(30_000))); // 30s delay

        // Act — the onErrorResume should catch connection errors
        String result = groqService.getFitnessAdvice(1L, "Test timeout").block();

        // Assert — graceful degradation
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should build contextual prompt with user workout data")
    void shouldBuildContextualPrompt() {
        String prompt = groqService.buildContextualPrompt(
                "What should I do next?", 5, 45, "STRENGTH");

        assertThat(prompt).contains("5 sessions");
        assertThat(prompt).contains("45 minutes");
        assertThat(prompt).contains("STRENGTH");
        assertThat(prompt).contains("What should I do next?");
    }
}
