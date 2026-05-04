package com.fitnesstracker.analytics.service;

import com.fitnesstracker.analytics.dto.DailySummary;
import com.fitnesstracker.analytics.dto.NutritionResponse;
import com.fitnesstracker.analytics.dto.WorkoutResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class AnalyticsService {

    private final WebClient webClient;
    private final String workoutServiceUrl;
    private final String nutritionServiceUrl;

    public AnalyticsService(
            WebClient.Builder webClientBuilder,
            @Value("${services.workout.url}") String workoutServiceUrl,
            @Value("${services.nutrition.url}") String nutritionServiceUrl) {
        this.webClient = webClientBuilder.build();
        this.workoutServiceUrl = workoutServiceUrl;
        this.nutritionServiceUrl = nutritionServiceUrl;
    }

    public DailySummary getDailySummary(Long userId, String token) {
        
        // Fetch workouts
        List<WorkoutResponse> workouts = webClient.get()
                .uri(workoutServiceUrl + "/api/workouts")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<WorkoutResponse>>() {})
                .block();

        // Fetch nutrition logs
        List<NutritionResponse> nutritionLogs = webClient.get()
                .uri(nutritionServiceUrl + "/api/nutrition")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<NutritionResponse>>() {})
                .block();

        // Aggregate
        int totalWorkouts = workouts != null ? workouts.size() : 0;
        int totalWorkoutMinutes = workouts != null ? workouts.stream().mapToInt(WorkoutResponse::durationMinutes).sum() : 0;

        int totalCalories = 0;
        double totalProtein = 0.0;
        double totalCarbs = 0.0;
        double totalFat = 0.0;

        if (nutritionLogs != null) {
            for (NutritionResponse log : nutritionLogs) {
                totalCalories += log.calories() != null ? log.calories() : 0;
                totalProtein += log.proteinGrams() != null ? log.proteinGrams() : 0.0;
                totalCarbs += log.carbsGrams() != null ? log.carbsGrams() : 0.0;
                totalFat += log.fatGrams() != null ? log.fatGrams() : 0.0;
            }
        }

        return new DailySummary(
                userId,
                totalWorkouts,
                totalWorkoutMinutes,
                totalCalories,
                totalProtein,
                totalCarbs,
                totalFat,
                workouts,
                nutritionLogs
        );
    }
}
