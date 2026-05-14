package com.fitnesstracker.monolith.workout.service;

import com.fitnesstracker.monolith.user.entity.UserEntity;
import com.fitnesstracker.monolith.user.repository.UserRepository;
import com.fitnesstracker.monolith.workout.dto.WorkoutRequest;
import com.fitnesstracker.monolith.workout.dto.WorkoutResponse;
import com.fitnesstracker.monolith.workout.entity.WorkoutEntity;
import com.fitnesstracker.monolith.workout.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkoutService {

    private static final double DEFAULT_WEIGHT_KG = 70.0;

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;

    public WorkoutService(WorkoutRepository workoutRepository, UserRepository userRepository) {
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WorkoutResponse createWorkout(Long userId, WorkoutRequest request) {
        double weightKg = getUserWeight(userId);

        int calories = WorkoutEntity.calculateCaloriesBurned(
                request.type(),
                request.durationMinutes(),
                weightKg
        );

        WorkoutEntity entity = WorkoutEntity.builder()
                .userId(userId)
                .title(request.title())
                .description(request.description())
                .durationMinutes(request.durationMinutes())
                .workoutDate(request.workoutDate() != null ? request.workoutDate() : LocalDateTime.now())
                .type(request.type())
                .caloriesBurned(calories)
                .build();

        return mapToResponse(workoutRepository.save(entity));
    }

    @Transactional
    public WorkoutResponse updateWorkout(Long id, Long userId, WorkoutRequest request) {
        WorkoutEntity entity = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        double weightKg = getUserWeight(userId);
        int calories = WorkoutEntity.calculateCaloriesBurned(
                request.type(),
                request.durationMinutes(),
                weightKg
        );

        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setDurationMinutes(request.durationMinutes());
        entity.setType(request.type());
        entity.setCaloriesBurned(calories);
        if (request.workoutDate() != null) entity.setWorkoutDate(request.workoutDate());

        return mapToResponse(workoutRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<WorkoutResponse> getUserWorkouts(Long userId) {
        return workoutRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkoutResponse getWorkoutById(Long id, Long userId) {
        WorkoutEntity entity = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToResponse(entity);
    }

    @Transactional
    public void deleteWorkout(Long id, Long userId) {
        WorkoutEntity entity = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        workoutRepository.delete(entity);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private double getUserWeight(Long userId) {
        return userRepository.findById(userId)
                .map(UserEntity::getWeightKg)
                .filter(w -> w != null && w > 0)
                .orElse(DEFAULT_WEIGHT_KG);
    }

    private WorkoutResponse mapToResponse(WorkoutEntity entity) {
        return new WorkoutResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getDurationMinutes(),
                entity.getWorkoutDate(),
                entity.getType(),
                entity.getCaloriesBurned(),
                entity.getCreatedAt()
        );
    }
}
