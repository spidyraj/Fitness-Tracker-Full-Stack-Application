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
                .map(n -> new NutritionResponse(n.id(), n.userId(), n.foodName(), n.mealType().name(), n.calories(), n.protein(), n.carbs(), n.fats(), n.logDate()))
                .collect(Collectors.toList());

        // Aggregate
        int totalWorkouts = workouts.size();
        int totalDurationMinutes = workouts.stream().mapToInt(WorkoutResponse::durationMinutes).sum();

        // Calculate estimated calories burned based on workout type and duration
        int totalCaloriesBurned = workouts.stream()
                .mapToInt(workout -> {
                    int minutes = workout.durationMinutes() != null ? workout.durationMinutes() : 0;
                    return switch (workout.type().toUpperCase()) {
                        case "CARDIO" -> minutes * 10;  // ~10 cal/min for cardio
                        case "STRENGTH" -> minutes * 6;  // ~6 cal/min for strength
                        case "HIITS" -> minutes * 12;    // ~12 cal/min for HIIT
                        case "FLEXIBILITY" -> minutes * 3; // ~3 cal/min for flexibility
                        default -> minutes * 5;          // ~5 cal/min for other
                    };
                })
                .sum();

        int totalCalories = 0;
        double totalProtein = 0.0;
        double totalCarbs = 0.0;
        double totalFat = 0.0;

        for (NutritionResponse log : nutritionLogs) {
            totalCalories += log.calories() != null ? log.calories() : 0;
            totalProtein += log.protein() != null ? log.protein() : 0.0;
            totalCarbs += log.carbs() != null ? log.carbs() : 0.0;
            totalFat += log.fats() != null ? log.fats() : 0.0;
        }

        return new DailySummary(
                userId,
                totalWorkouts,
                totalDurationMinutes,
                totalCaloriesBurned,
                totalCalories,
                totalProtein,
                totalCarbs,
                totalFat,
                workouts,
                nutritionLogs
        );
    }
}
