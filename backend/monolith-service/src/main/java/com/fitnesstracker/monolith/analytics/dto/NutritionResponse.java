package com.fitnesstracker.monolith.analytics.dto;

import java.time.LocalDateTime;

public record NutritionResponse(
        Long id,
        Long userId,
        String foodName,
        String mealType,
        Integer calories,
        Double protein,
        Double carbs,
        Double fats,
        LocalDateTime logDate
) {}
