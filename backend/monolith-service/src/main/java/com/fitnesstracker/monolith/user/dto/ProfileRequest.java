package com.fitnesstracker.monolith.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

/**
 * Request DTO for updating user profile information.
 */
public record ProfileRequest(
        @Min(1) @Max(120) Integer age,
        @Positive Double weightKg,
        @Positive Double heightCm,
        String fitnessGoal,
        String activityLevel
) {}
