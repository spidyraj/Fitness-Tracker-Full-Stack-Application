package com.fitnesstracker.monolith.user.dto;

import com.fitnesstracker.monolith.user.entity.UserEntity.FitnessLevel;
import com.fitnesstracker.monolith.user.entity.UserEntity.Gender;

import java.time.LocalDateTime;

/**
 * Response DTO for user profile information.
 */
public record ProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Integer age,
        Double weightKg,
        Double heightCm,
        String fitnessGoal,
        String activityLevel,
        FitnessLevel fitnessLevel,
        Gender gender,
        Integer targetCalories,
        Double targetWeightKg,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
