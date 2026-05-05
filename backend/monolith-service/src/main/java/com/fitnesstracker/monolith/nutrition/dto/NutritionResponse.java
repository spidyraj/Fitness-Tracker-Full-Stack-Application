package com.fitnesstracker.monolith.nutrition.dto;

import com.fitnesstracker.monolith.nutrition.entity.NutritionEntity.MealType;

import java.time.LocalDateTime;

public record NutritionResponse(
        Long id,
        Long userId,
        String mealName,
        MealType mealType,
        Integer calories,
        Double proteinGrams,
        Double carbsGrams,
        Double fatGrams,
        LocalDateTime logDate,
        LocalDateTime createdAt
) {}
