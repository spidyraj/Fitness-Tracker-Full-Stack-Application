package com.fitnesstracker.analytics.dto;

import java.time.LocalDateTime;

public record NutritionResponse(
        Long id,
        Long userId,
        String mealName,
        String mealType,
        Integer calories,
        Double proteinGrams,
        Double carbsGrams,
        Double fatGrams,
        LocalDateTime logDate
) {}
