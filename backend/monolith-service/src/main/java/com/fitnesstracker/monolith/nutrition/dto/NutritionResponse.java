package com.fitnesstracker.monolith.nutrition.dto;

import com.fitnesstracker.monolith.nutrition.entity.NutritionEntity.MealType;

import java.time.LocalDateTime;

public record NutritionResponse(
        Long id,
        Long userId,
        String foodName,
        MealType mealType,
        Integer calories,
        Double protein,
        Double carbs,
        Double fats,
        Double weightGrams,
        String servingDescription,
        String cuisine,
        LocalDateTime logDate,
        LocalDateTime createdAt
) {}
