package com.fitnesstracker.monolith.nutrition.service;

import com.fitnesstracker.monolith.nutrition.dto.NutritionRequest;
import com.fitnesstracker.monolith.nutrition.dto.NutritionResponse;
import com.fitnesstracker.monolith.nutrition.entity.NutritionEntity;
import com.fitnesstracker.monolith.nutrition.repository.NutritionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NutritionService {

    private final NutritionRepository nutritionRepository;

    public NutritionService(NutritionRepository nutritionRepository) {
        this.nutritionRepository = nutritionRepository;
    }

    @Transactional
    public NutritionResponse logNutrition(Long userId, NutritionRequest request) {
        NutritionEntity entity = NutritionEntity.builder()
                .userId(userId)
                .mealName(request.foodName())
                .mealType(request.mealType() != null ? request.mealType() : NutritionEntity.MealType.SNACK)
                .calories(request.calories())
                .proteinGrams(request.protein())
                .carbsGrams(request.carbs())
                .fatGrams(request.fat())
                .logDate(request.logDate() != null ? request.logDate() : LocalDateTime.now())
                .build();

        NutritionEntity saved = nutritionRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<NutritionResponse> getUserNutritionLogs(Long userId) {
        return nutritionRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NutritionResponse getNutritionLogById(Long id, Long userId) {
        NutritionEntity entity = nutritionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nutrition log not found"));
                
        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        return mapToResponse(entity);
    }

    @Transactional
    public void deleteNutritionLog(Long id, Long userId) {
        NutritionEntity entity = nutritionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nutrition log not found"));
                
        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        nutritionRepository.delete(entity);
    }

    private NutritionResponse mapToResponse(NutritionEntity entity) {
        return new NutritionResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getMealName(),
                entity.getMealType(),
                entity.getCalories(),
                entity.getProteinGrams(),
                entity.getCarbsGrams(),
                entity.getFatGrams(),
                entity.getLogDate(),
                entity.getCreatedAt()
        );
    }
}
