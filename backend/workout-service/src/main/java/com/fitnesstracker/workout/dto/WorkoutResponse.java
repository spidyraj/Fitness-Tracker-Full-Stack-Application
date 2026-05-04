package com.fitnesstracker.workout.dto;

import com.fitnesstracker.workout.entity.WorkoutEntity.WorkoutType;

import java.time.LocalDateTime;

public record WorkoutResponse(
        Long id,
        Long userId,
        String title,
        String description,
        Integer durationMinutes,
        LocalDateTime workoutDate,
        WorkoutType type,
        LocalDateTime createdAt
) {}
