package com.fitnesstracker.monolith.analytics.service;

import com.fitnesstracker.monolith.analytics.dto.DailySummary;
import com.fitnesstracker.monolith.analytics.dto.NutritionResponse;
import com.fitnesstracker.monolith.analytics.dto.WorkoutResponse;
import com.fitnesstracker.monolith.workout.service.WorkoutService;
import com.fitnesstracker.monolith.nutrition.service.NutritionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final WorkoutService workoutService;
    private final NutritionService nutritionService;

    public AnalyticsService(WorkoutService workoutService, NutritionService nutritionService) {
        this.workoutService = workoutService;
        this.nutritionService = nutritionService;
    }

    public DailySummary getDailySummary(Long userId, String token) {
        
        // Fetch workouts directly from service
        List<com.fitnesstracker.monolith.workout.dto.WorkoutResponse> workoutsRaw = workoutService.getUserWorkouts(userId);
        
        // Map to internal Analytics DTO (WorkoutResponse)
        List<WorkoutResponse> workouts = workoutsRaw.stream()
                .map(w -> new WorkoutResponse(w.id(), w.userId(), w.title(), w.durationMinutes(), w.type().name(), w.workoutDate()))
                .collect(Collectors.toList());

        // Fetch nutrition logs directly from service
        List<com.fitnesstracker.monolith.nutrition.dto.NutritionResponse> nutritionRaw = nutritionService.getUserNutritionLogs(userId);
        
        // Map to internal Analytics DTO (NutritionResponse)
        List<NutritionResponse> nutritionLogs = nutritionRaw.stream()
                .map(n -> new NutritionResponse(n.id(), n.userId(), n.mealName(), n.mealType().name(), n.calories(), n.proteinGrams(), n.carbsGrams(), n.fatGrams(), n.logDate()))
                .collect(Collectors.toList());

        // Aggregate
        int totalWorkouts = workouts.size();
        int totalWorkoutMinutes = workouts.stream().mapToInt(WorkoutResponse::durationMinutes).sum();

        int totalCalories = 0;
        double totalProtein = 0.0;
        double totalCarbs = 0.0;
        double totalFat = 0.0;

        for (NutritionResponse log : nutritionLogs) {
            totalCalories += log.calories() != null ? log.calories() : 0;
            totalProtein += log.proteinGrams() != null ? log.proteinGrams() : 0.0;
            totalCarbs += log.carbsGrams() != null ? log.carbsGrams() : 0.0;
            totalFat += log.fatGrams() != null ? log.fatGrams() : 0.0;
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
