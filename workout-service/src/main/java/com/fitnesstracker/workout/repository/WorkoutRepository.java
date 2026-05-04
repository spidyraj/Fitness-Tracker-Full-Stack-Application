package com.fitnesstracker.workout.repository;

import com.fitnesstracker.workout.entity.WorkoutEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<WorkoutEntity, Long> {
    List<WorkoutEntity> findByUserId(Long userId);
}
