package com.fitnesstracker.monolith.user.dto;

import com.fitnesstracker.monolith.user.entity.UserEntity.FitnessLevel;
import com.fitnesstracker.monolith.user.entity.UserEntity.Gender;
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
        String activityLevel,
        FitnessLevel fitnessLevel,
        Gender gender,
        Integer targetCalories,
        Double targetWeightKg
) {}
