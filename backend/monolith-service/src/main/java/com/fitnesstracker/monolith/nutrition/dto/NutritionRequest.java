package com.fitnesstracker.monolith.nutrition.dto;

import com.fitnesstracker.monolith.nutrition.entity.NutritionEntity.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;

public record NutritionRequest(
        @NotBlank String foodName,           // was mealName — now matches entity setter
        MealType mealType,                   // no longer @NotNull; defaults in service
        @NotNull @PositiveOrZero Integer calories,
        @PositiveOrZero Double protein,
        @PositiveOrZero Double carbs,
        @PositiveOrZero Double fat,
        LocalDateTime logDate
) {}
