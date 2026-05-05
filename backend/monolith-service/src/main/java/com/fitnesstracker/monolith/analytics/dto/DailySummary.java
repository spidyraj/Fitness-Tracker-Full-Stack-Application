package com.fitnesstracker.monolith.analytics.dto;

import java.util.List;

public record DailySummary(
        Long userId,
        Integer totalWorkouts,
        Integer totalDurationMinutes,
        Integer totalCaloriesBurned,
        Integer totalCaloriesConsumed,
        Double totalProteinGrams,
        Double totalCarbsGrams,
        Double totalFatGrams,
        List<WorkoutResponse> workouts,
        List<NutritionResponse> nutritionLogs
) {}
