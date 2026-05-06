package com.fitnesstracker.monolith.user.dto;

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
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
