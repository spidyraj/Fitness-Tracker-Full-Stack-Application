package com.fitnesstracker.monolith.workout.controller;

import com.fitnesstracker.monolith.workout.dto.WorkoutRequest;
import com.fitnesstracker.monolith.workout.dto.WorkoutResponse;
import com.fitnesstracker.monolith.workout.service.WorkoutReminderService;
import com.fitnesstracker.monolith.workout.service.WorkoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class WorkoutController {

    private final WorkoutService workoutService;
    private final WorkoutReminderService reminderService;

    public WorkoutController(WorkoutService workoutService, WorkoutReminderService reminderService) {
        this.workoutService = workoutService;
        this.reminderService = reminderService;
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

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutResponse> updateWorkout(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody WorkoutRequest request) {
        return ResponseEntity.ok(workoutService.updateWorkout(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        workoutService.deleteWorkout(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ─── Reminder Endpoints ───────────────────────────────────────────────────

    /** Poll for pending reminder message. Returns null message if none pending. */
    @GetMapping("/reminders")
    public ResponseEntity<Map<String, Object>> getReminder(
            @RequestAttribute("userId") Long userId) {
        String message = reminderService.consumeReminder(userId);
        return ResponseEntity.ok(Map.of(
                "enabled", reminderService.isReminderEnabled(userId),
                "hasReminder", message != null,
                "message", message != null ? message : ""
        ));
    }

    /** Enable or disable workout reminders for the authenticated user. */
    @PostMapping("/reminders")
    public ResponseEntity<Map<String, Object>> setReminder(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Boolean> body) {
        boolean enabled = Boolean.TRUE.equals(body.get("enabled"));
        reminderService.setReminderEnabled(userId, enabled);
        return ResponseEntity.ok(Map.of("enabled", enabled, "message", enabled
                ? "Reminders enabled! We'll nudge you every 48h if you skip a workout."
                : "Reminders disabled."));
    }
}
