package com.fitnesstracker.monolith.workout.dto;

import com.fitnesstracker.monolith.workout.entity.WorkoutEntity.WorkoutType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record WorkoutRequest(
        @NotBlank String title,
        String description,
        @NotNull @Positive Integer durationMinutes,
        LocalDateTime workoutDate,
        @NotNull WorkoutType type
) {}
