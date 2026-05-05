package com.fitnesstracker.monolith.workout.service;

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

    private final WorkoutRepository workoutRepository;

    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    @Transactional
    public WorkoutResponse createWorkout(Long userId, WorkoutRequest request) {
        WorkoutEntity entity = WorkoutEntity.builder()
                .userId(userId)
                .title(request.title())
                .description(request.description())
                .durationMinutes(request.durationMinutes())
                .workoutDate(request.workoutDate() != null ? request.workoutDate() : LocalDateTime.now())
                .type(request.type())
                .build();

        WorkoutEntity saved = workoutRepository.save(entity);
        return mapToResponse(saved);
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

    private WorkoutResponse mapToResponse(WorkoutEntity entity) {
        return new WorkoutResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getDurationMinutes(),
                entity.getWorkoutDate(),
                entity.getType(),
                entity.getCreatedAt()
        );
    }
}
