package com.fitnesstracker.monolith.workout.service;

import com.fitnesstracker.monolith.workout.repository.WorkoutRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Workout reminder service.
 *
 * Tracks per-user reminder preferences in memory (no DB needed).
 * The scheduled job checks every morning if any active users haven't worked out
 * in 2+ days and flags them — the frontend polls GET /api/workouts/reminders.
 *
 * In production, this would be extended with push notifications or email.
 */
@Service
public class WorkoutReminderService {

    private static final Logger log = LoggerFactory.getLogger(WorkoutReminderService.class);

    private final WorkoutRepository workoutRepository;

    // userId -> reminder enabled flag
    private final Map<Long, Boolean> reminderPrefs = new ConcurrentHashMap<>();
    // userId -> last reminder message
    private final Map<Long, String> pendingReminders = new ConcurrentHashMap<>();

    public WorkoutReminderService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    /**
     * Enable or disable reminders for a user.
     */
    public void setReminderEnabled(Long userId, boolean enabled) {
        reminderPrefs.put(userId, enabled);
        log.info("Workout reminders {} for user {}", enabled ? "ENABLED" : "DISABLED", userId);
    }

    /**
     * Returns true if reminders are enabled for the user.
     */
    public boolean isReminderEnabled(Long userId) {
        return reminderPrefs.getOrDefault(userId, false);
    }

    /**
     * Gets and clears any pending reminder for a user.
     * Returns null if no reminder is pending.
     */
    public String consumeReminder(Long userId) {
        return pendingReminders.remove(userId);
    }

    /**
     * Checks every day at 7:00 AM IST (1:30 AM UTC) if any user with reminders enabled
     * hasn't logged a workout in 48+ hours.
     */
    @Scheduled(cron = "0 30 1 * * *") // 7:00 AM IST = 1:30 AM UTC
    public void checkWorkoutReminders() {
        log.info("Running daily workout reminder check...");

        LocalDateTime twoDaysAgo = LocalDateTime.now().minusHours(48);

        reminderPrefs.forEach((userId, enabled) -> {
            if (!enabled) return;

            boolean hasRecentWorkout = workoutRepository.findByUserId(userId).stream()
                    .anyMatch(w -> w.getWorkoutDate() != null && w.getWorkoutDate().isAfter(twoDaysAgo));

            if (!hasRecentWorkout) {
                String[] motivationalMessages = {
                    "💪 Hey! It's been a while since your last workout. Time to get moving!",
                    "🏃 Your body is ready for a workout today. Let's go!",
                    "🔥 Consistency is key! Log a workout and keep your streak going.",
                    "🎯 Don't break the chain! A quick 20-minute session counts.",
                    "⚡ Your future self will thank you. Time to train!"
                };
                String message = motivationalMessages[(int) (Math.random() * motivationalMessages.length)];
                pendingReminders.put(userId, message);
                log.debug("Reminder queued for user {}: {}", userId, message);
            }
        });
    }
}
