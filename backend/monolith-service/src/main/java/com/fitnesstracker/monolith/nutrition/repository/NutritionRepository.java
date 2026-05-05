package com.fitnesstracker.monolith.nutrition.repository;

import com.fitnesstracker.monolith.nutrition.entity.NutritionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NutritionRepository extends JpaRepository<NutritionEntity, Long> {
    List<NutritionEntity> findByUserId(Long userId);
    List<NutritionEntity> findByUserIdAndLogDateBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
