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
        // Determine calories: use provided value, or calculate from macros if 0/null
        int calories = request.calories() != null ? request.calories() : 0;
        if (calories == 0 && hasMacros(request)) {
            calories = request.calculateCaloriesFromMacros();
        }

        NutritionEntity entity = NutritionEntity.builder()
                .userId(userId)
                .mealName(request.foodName())
                .mealType(request.mealType() != null ? request.mealType() : NutritionEntity.MealType.SNACK)
                .calories(calories)
                .proteinGrams(request.protein())
                .carbsGrams(request.carbs())
                .fatGrams(request.fats())          // Fixed: was request.fat()
                .weightGrams(request.weightGrams())
                .servingDescription(request.servingDescription())
                .cuisine(request.cuisine())
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

    @Transactional
    public NutritionResponse updateNutritionLog(Long id, Long userId, NutritionRequest request) {
        NutritionEntity entity = getOwnedEntity(id, userId);

        // Update fields
        entity.setMealName(request.foodName());
        if (request.mealType() != null) entity.setMealType(request.mealType());
        if (request.calories() != null) entity.setCalories(request.calories());
        entity.setProteinGrams(request.protein());
        entity.setCarbsGrams(request.carbs());
        entity.setFatGrams(request.fats());         // Fixed: was missing update
        entity.setWeightGrams(request.weightGrams());
        entity.setServingDescription(request.servingDescription());
        entity.setCuisine(request.cuisine());
        if (request.logDate() != null) entity.setLogDate(request.logDate());

        // Recalculate calories if 0 and macros present
        if ((entity.getCalories() == null || entity.getCalories() == 0) && hasMacros(request)) {
            entity.setCalories(request.calculateCaloriesFromMacros());
        }

        return mapToResponse(nutritionRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public NutritionResponse getNutritionLogById(Long id, Long userId) {
        return mapToResponse(getOwnedEntity(id, userId));
    }

    @Transactional
    public void deleteNutritionLog(Long id, Long userId) {
        nutritionRepository.delete(getOwnedEntity(id, userId));
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
                entity.getFatGrams(),      // Fixed: maps to 'fats' field in response
                entity.getWeightGrams(),
                entity.getServingDescription(),
                entity.getCuisine(),
                entity.getLogDate(),
                entity.getCreatedAt()
        );
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private NutritionEntity getOwnedEntity(Long id, Long userId) {
        NutritionEntity entity = nutritionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nutrition log not found"));
        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return entity;
    }

    private boolean hasMacros(NutritionRequest request) {
        return (request.protein() != null && request.protein() > 0) ||
               (request.carbs() != null && request.carbs() > 0) ||
               (request.fats() != null && request.fats() > 0);
    }
}
