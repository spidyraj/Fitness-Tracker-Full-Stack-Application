package com.fitnesstracker.workout.repository;

import com.fitnesstracker.workout.entity.WorkoutEntity;
import com.fitnesstracker.workout.entity.WorkoutEntity.WorkoutType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository layer tests using @DataJpaTest.
 *
 * Interview talking point: "Why @DataJpaTest instead of @SpringBootTest?"
 * → @DataJpaTest loads ONLY the JPA slice: entities, repositories, and an in-memory H2 DB.
 *   It skips web, security, and service layers — making tests 5–10x faster.
 *   It is a slice test, not a full integration test.
 *   Contrast: @SpringBootTest with Testcontainers tests the full stack with real PostgreSQL.
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("WorkoutRepository @DataJpaTest")
class WorkoutRepositoryTest {

    @Autowired
    private WorkoutRepository workoutRepository;

    private WorkoutEntity workout1;
    private WorkoutEntity workout2;

    @BeforeEach
    void setUp() {
        workoutRepository.deleteAll();

        workout1 = WorkoutEntity.builder()
                .userId(1L)
                .title("Morning Cardio")
                .durationMinutes(30)
                .workoutDate(LocalDateTime.now())
                .type(WorkoutType.CARDIO)
                .build();

        workout2 = WorkoutEntity.builder()
                .userId(1L)
                .title("Evening Strength")
                .durationMinutes(60)
                .workoutDate(LocalDateTime.now())
                .type(WorkoutType.STRENGTH)
                .build();

        workoutRepository.saveAll(List.of(workout1, workout2));
    }

    @Test
    @DisplayName("Should find all workouts for a given user")
    void shouldFindWorkoutsByUserId() {
        List<WorkoutEntity> result = workoutRepository.findByUserId(1L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(WorkoutEntity::getTitle)
                .containsExactlyInAnyOrder("Morning Cardio", "Evening Strength");
    }

    @Test
    @DisplayName("Should return empty list for user with no workouts")
    void shouldReturnEmptyForUserWithNoWorkouts() {
        List<WorkoutEntity> result = workoutRepository.findByUserId(99L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should persist and retrieve workout with auto-generated ID")
    void shouldPersistWorkoutWithId() {
        WorkoutEntity saved = workoutRepository.findByUserId(1L).get(0);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getId()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Should find workout by ID")
    void shouldFindById() {
        WorkoutEntity saved = workoutRepository.findByUserId(1L).get(0);

        Optional<WorkoutEntity> found = workoutRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo(saved.getTitle());
    }

    @Test
    @DisplayName("Should delete workout and no longer find it")
    void shouldDeleteWorkout() {
        WorkoutEntity saved = workoutRepository.findByUserId(1L).get(0);
        workoutRepository.delete(saved);

        Optional<WorkoutEntity> found = workoutRepository.findById(saved.getId());
        assertThat(found).isEmpty();

        List<WorkoutEntity> remaining = workoutRepository.findByUserId(1L);
        assertThat(remaining).hasSize(1);
    }

    @Test
    @DisplayName("Should not return workouts from another user")
    void shouldIsolateWorkoutsByUser() {
        // Another user's workout
        WorkoutEntity otherUserWorkout = WorkoutEntity.builder()
                .userId(2L)
                .title("User 2 Yoga")
                .durationMinutes(45)
                .workoutDate(LocalDateTime.now())
                .type(WorkoutType.FLEXIBILITY)
                .build();
        workoutRepository.save(otherUserWorkout);

        List<WorkoutEntity> user1Workouts = workoutRepository.findByUserId(1L);
        List<WorkoutEntity> user2Workouts = workoutRepository.findByUserId(2L);

        assertThat(user1Workouts).hasSize(2);
        assertThat(user2Workouts).hasSize(1);
        assertThat(user2Workouts.get(0).getTitle()).isEqualTo("User 2 Yoga");
    }
}
