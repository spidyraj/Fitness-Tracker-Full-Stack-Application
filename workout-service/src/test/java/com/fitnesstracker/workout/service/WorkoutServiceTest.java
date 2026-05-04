package com.fitnesstracker.workout.service;

import com.fitnesstracker.workout.dto.WorkoutRequest;
import com.fitnesstracker.workout.dto.WorkoutResponse;
import com.fitnesstracker.workout.entity.WorkoutEntity;
import com.fitnesstracker.workout.entity.WorkoutEntity.WorkoutType;
import com.fitnesstracker.workout.repository.WorkoutRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WorkoutService Unit Tests")
class WorkoutServiceTest {

    @Mock
    private WorkoutRepository workoutRepository;

    @InjectMocks
    private WorkoutService workoutService;

    private WorkoutEntity testWorkout;

    @BeforeEach
    void setUp() {
        testWorkout = WorkoutEntity.builder()
                .userId(1L)
                .title("Morning Run")
                .description("Easy 5k run")
                .durationMinutes(30)
                .workoutDate(LocalDateTime.now())
                .type(WorkoutType.CARDIO)
                .build();
        // Simulate DB-assigned ID
        testWorkout.setId(1L);
    }

    @Test
    @DisplayName("Should create workout and return response")
    void shouldCreateWorkout() {
        WorkoutRequest request = new WorkoutRequest(
                "Morning Run", "Easy 5k run", 30, null, WorkoutType.CARDIO);

        when(workoutRepository.save(any(WorkoutEntity.class))).thenReturn(testWorkout);

        WorkoutResponse response = workoutService.createWorkout(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Morning Run");
        assertThat(response.type()).isEqualTo(WorkoutType.CARDIO);
        assertThat(response.durationMinutes()).isEqualTo(30);
        verify(workoutRepository, times(1)).save(any(WorkoutEntity.class));
    }

    @Test
    @DisplayName("Should return all workouts for a user")
    void shouldReturnAllUserWorkouts() {
        when(workoutRepository.findByUserId(1L)).thenReturn(List.of(testWorkout));

        List<WorkoutResponse> workouts = workoutService.getUserWorkouts(1L);

        assertThat(workouts).hasSize(1);
        assertThat(workouts.get(0).title()).isEqualTo("Morning Run");
        verify(workoutRepository, times(1)).findByUserId(1L);
    }

    @Test
    @DisplayName("Should return empty list when user has no workouts")
    void shouldReturnEmptyListWhenNoWorkouts() {
        when(workoutRepository.findByUserId(99L)).thenReturn(List.of());

        List<WorkoutResponse> workouts = workoutService.getUserWorkouts(99L);

        assertThat(workouts).isEmpty();
    }

    @Test
    @DisplayName("Should return workout by ID when it belongs to user")
    void shouldGetWorkoutById() {
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));

        WorkoutResponse response = workoutService.getWorkoutById(1L, 1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Morning Run");
    }

    @Test
    @DisplayName("Should throw exception when workout not found")
    void shouldThrowWhenWorkoutNotFound() {
        when(workoutRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workoutService.getWorkoutById(999L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("Should throw exception when user does not own the workout")
    void shouldThrowWhenUserDoesNotOwnWorkout() {
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));

        // userId 2L does not own testWorkout (which belongs to 1L)
        assertThatThrownBy(() -> workoutService.getWorkoutById(1L, 2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    @DisplayName("Should delete workout when it belongs to user")
    void shouldDeleteWorkout() {
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));
        doNothing().when(workoutRepository).delete(any(WorkoutEntity.class));

        workoutService.deleteWorkout(1L, 1L);

        verify(workoutRepository, times(1)).delete(testWorkout);
    }

    @Test
    @DisplayName("Should throw when deleting workout belonging to another user")
    void shouldThrowWhenDeletingAnotherUsersWorkout() {
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));

        assertThatThrownBy(() -> workoutService.deleteWorkout(1L, 2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Access denied");

        verify(workoutRepository, never()).delete(any());
    }
}
