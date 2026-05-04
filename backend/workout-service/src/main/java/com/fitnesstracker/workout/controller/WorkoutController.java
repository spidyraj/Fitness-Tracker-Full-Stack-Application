package com.fitnesstracker.workout.controller;

import com.fitnesstracker.workout.dto.WorkoutRequest;
import com.fitnesstracker.workout.dto.WorkoutResponse;
import com.fitnesstracker.workout.service.WorkoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody WorkoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutService.createWorkout(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> getUserWorkouts(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(workoutService.getUserWorkouts(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutResponse> getWorkoutById(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(workoutService.getWorkoutById(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        workoutService.deleteWorkout(id, userId);
        return ResponseEntity.noContent().build();
    }
}
