package com.fitnesstracker.analytics.dto;

import java.time.LocalDateTime;

public record WorkoutResponse(
        Long id,
        Long userId,
        String title,
        Integer durationMinutes,
        String type,
        LocalDateTime workoutDate
) {}
