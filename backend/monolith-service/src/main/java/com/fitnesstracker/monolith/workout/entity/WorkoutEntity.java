package com.fitnesstracker.monolith.workout.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workouts")
public class WorkoutEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Long userId; // References UserEntity ID from user-service

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @NotNull
    @Column(nullable = false)
    private Integer durationMinutes;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime workoutDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkoutType type;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column
    private LocalDateTime updatedAt;

    @Column
    private Integer caloriesBurned;

    /**
     * WorkoutType enum — IMPORTANT: these values must match the frontend dropdown options.
     */
    public enum WorkoutType {
        CARDIO,
        STRENGTH,
        FLEXIBILITY,
        HIIT,
        SPORTS,
        YOGA,
        OTHER
    }

    /**
     * MET (Metabolic Equivalent of Task) values per workout type.
     * Calorie formula: MET × weightKg × durationHours
     * Source: Compendium of Physical Activities.
     */
    public static int calculateCaloriesBurned(WorkoutType type, int durationMinutes, double weightKg) {
        double met = switch (type) {
            case CARDIO     -> 7.0;   // moderate running/cycling
            case HIIT       -> 10.0;  // high-intensity interval
            case STRENGTH   -> 5.0;   // weight training
            case SPORTS     -> 6.0;   // general sports
            case YOGA       -> 2.5;   // yoga/stretching
            case FLEXIBILITY -> 2.0;  // light flexibility
            case OTHER      -> 4.0;
        };
        double hours = durationMinutes / 60.0;
        return (int) Math.round(met * weightKg * hours);
    }

    // ─── Constructors ────────────────────────────────────────────────────────
    public WorkoutEntity() {}

    private WorkoutEntity(Builder builder) {
        this.userId = builder.userId;
        this.title = builder.title;
        this.description = builder.description;
        this.durationMinutes = builder.durationMinutes;
        this.workoutDate = builder.workoutDate != null ? builder.workoutDate : LocalDateTime.now();
        this.type = builder.type != null ? builder.type : WorkoutType.OTHER;
        this.caloriesBurned = builder.caloriesBurned;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long userId;
        private String title, description;
        private Integer durationMinutes;
        private LocalDateTime workoutDate;
        private WorkoutType type;
        private Integer caloriesBurned;

        public Builder userId(Long v) { this.userId = v; return this; }
        public Builder title(String v) { this.title = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder durationMinutes(Integer v) { this.durationMinutes = v; return this; }
        public Builder workoutDate(LocalDateTime v) { this.workoutDate = v; return this; }
        public Builder type(WorkoutType v) { this.type = v; return this; }
        public Builder caloriesBurned(Integer v) { this.caloriesBurned = v; return this; }
        public WorkoutEntity build() { return new WorkoutEntity(this); }
    }

    // ─── Getters & Setters ───────────────────────────────────────────────────
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public LocalDateTime getWorkoutDate() { return workoutDate; }
    public WorkoutType getType() { return type; }
    public Integer getCaloriesBurned() { return caloriesBurned; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public void setWorkoutDate(LocalDateTime workoutDate) { this.workoutDate = workoutDate; }
    public void setType(WorkoutType type) { this.type = type; }
    public void setCaloriesBurned(Integer caloriesBurned) { this.caloriesBurned = caloriesBurned; }
}
