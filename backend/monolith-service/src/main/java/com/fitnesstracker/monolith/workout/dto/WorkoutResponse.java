package com.fitnesstracker.monolith.workout.dto;

import com.fitnesstracker.monolith.workout.entity.WorkoutEntity.WorkoutType;

import java.time.LocalDateTime;

public record WorkoutResponse(
        Long id,
        Long userId,
        String title,
        String description,
        Integer durationMinutes,
        LocalDateTime workoutDate,
        WorkoutType type,
        Integer caloriesBurned,
        LocalDateTime createdAt
) {}
