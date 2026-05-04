package com.fitnesstracker.workout.controller;

import com.fitnesstracker.workout.config.AbstractIntegrationTest;
import com.fitnesstracker.workout.repository.WorkoutRepository;
import com.fitnesstracker.workout.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Workout Controller Integration Tests")
class WorkoutControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String validJwt;

    @BeforeEach
    void setUp() {
        workoutRepository.deleteAll();
        validJwt = jwtUtil.generateToken(1L, "test@example.com", "USER");
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(validJwt);
        return headers;
    }

    @Test
    @DisplayName("Should create a workout and retrieve it successfully")
    void shouldCreateAndRetrieveWorkout() {
        String requestBody = """
                {
                    "title": "Morning Cardio",
                    "type": "CARDIO",
                    "durationMinutes": 30,
                    "notes": "Morning run around the park"
                }
                """;

        HttpEntity<String> createRequest = new HttpEntity<>(requestBody, authHeaders());

        ResponseEntity<String> createResponse = restTemplate.postForEntity(
                "/api/workouts", createRequest, String.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody()).contains("Morning Cardio");
        assertThat(createResponse.getBody()).contains("CARDIO");

        // Retrieve workouts for user
        ResponseEntity<String> getResponse = restTemplate.exchange(
                "/api/workouts", HttpMethod.GET,
                new HttpEntity<>(authHeaders()), String.class);

        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody()).contains("Morning Cardio");
    }

    @Test
    @DisplayName("Should return 403 when no JWT token provided")
    void shouldReturn403WhenNoJwtProvided() {
        String requestBody = """
                {
                    "title": "Strength Training",
                    "type": "STRENGTH",
                    "durationMinutes": 45
                }
                """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/workouts", new HttpEntity<>(requestBody, headers), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Should return 400 when required fields are missing")
    void shouldReturn400WhenTitleMissing() {
        String requestBody = """
                {
                    "type": "CARDIO",
                    "durationMinutes": 30
                }
                """;

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/workouts", new HttpEntity<>(requestBody, authHeaders()), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should return empty list when user has no workouts")
    void shouldReturnEmptyListWhenNoWorkouts() {
        ResponseEntity<String> getResponse = restTemplate.exchange(
                "/api/workouts", HttpMethod.GET,
                new HttpEntity<>(authHeaders()), String.class);

        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody()).isEqualTo("[]");
    }
}
