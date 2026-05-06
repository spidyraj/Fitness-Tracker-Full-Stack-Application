package com.fitnesstracker.monolith.nutrition.dto;

import com.fitnesstracker.monolith.nutrition.entity.NutritionEntity.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;

/**
 * Request DTO for logging nutrition entries.
 *
 * Field naming fix: uses 'fats' consistently (was 'fat' in request but 'fats' in response)
 * Added: weightGrams for auto-calculation support, servingSize for food database integration
 */
public record NutritionRequest(
        @NotBlank String foodName,
        MealType mealType,                          // optional, defaults to SNACK in service
        @NotNull @PositiveOrZero Integer calories,
        @PositiveOrZero Double protein,
        @PositiveOrZero Double carbs,
        @PositiveOrZero Double fats,                // Fixed: was 'fat', now consistent with NutritionResponse
        Double weightGrams,                          // New: weight in grams for auto-calculation
        String servingDescription,                   // New: "1 cup", "100g", etc.
        String cuisine,                              // New: "Italian", "Indian", etc.
        LocalDateTime logDate
) {
    /**
     * Calculates estimated calories from macronutrients.
     * Formula: (protein * 4) + (carbs * 4) + (fats * 9)
     */
    public int calculateCaloriesFromMacros() {
        double p = protein != null ? protein : 0;
        double c = carbs != null ? carbs : 0;
        double f = fats != null ? fats : 0;
        return (int) Math.round((p * 4) + (c * 4) + (f * 9));
    }
}
