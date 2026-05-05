package com.fitnesstracker.monolith.nutrition.dto;

import com.fitnesstracker.monolith.nutrition.entity.NutritionEntity.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;

public record NutritionRequest(
        @NotBlank String mealName,
        @NotNull MealType mealType,
        @NotNull @PositiveOrZero Integer calories,
        @PositiveOrZero Double proteinGrams,
        @PositiveOrZero Double carbsGrams,
        @PositiveOrZero Double fatGrams,
        LocalDateTime logDate
) {}
