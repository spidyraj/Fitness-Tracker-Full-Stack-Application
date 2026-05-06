package com.fitnesstracker.monolith.nutrition.service;

import com.fitnesstracker.monolith.nutrition.entity.FoodEntity;
import com.fitnesstracker.monolith.nutrition.repository.FoodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FoodService {

    private final FoodRepository foodRepository;

    public FoodService(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    @Transactional(readOnly = true)
    public List<FoodEntity> searchFoods(String query, String cuisine) {
        if (query != null && !query.trim().isEmpty()) {
            if (cuisine != null && !cuisine.trim().isEmpty()) {
                return foodRepository.findByCuisineAndName(cuisine, query);
            }
            return foodRepository.searchFoods(query);
        }
        
        if (cuisine != null && !cuisine.trim().isEmpty()) {
            return foodRepository.findByCuisineAndName(cuisine, null);
        }
        
        return foodRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<String> getAllCuisines() {
        return foodRepository.findAllCuisines();
    }

    @Transactional
    public FoodEntity createFood(FoodEntity food) {
        return foodRepository.save(food);
    }

    @Transactional(readOnly = true)
    public FoodEntity getFoodById(Long id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found"));
    }

    @Transactional
    public FoodEntity updateFood(Long id, FoodEntity foodDetails) {
        FoodEntity food = getFoodById(id);
        
        food.setName(foodDetails.getName());
        food.setCalories(foodDetails.getCalories());
        food.setProtein(foodDetails.getProtein());
        food.setCarbs(foodDetails.getCarbs());
        food.setFats(foodDetails.getFats());
        food.setCuisine(foodDetails.getCuisine());
        food.setServingSize(foodDetails.getServingSize());
        food.setBrand(foodDetails.getBrand());
        food.setBarcode(foodDetails.getBarcode());
        
        return foodRepository.save(food);
    }

    @Transactional
    public void deleteFood(Long id) {
        FoodEntity food = getFoodById(id);
        foodRepository.delete(food);
    }

    @Transactional
    public void initializeDefaultFoods() {
        if (foodRepository.count() == 0) {
            List<FoodEntity> defaultFoods = List.of(
                FoodEntity.builder()
                    .name("Chicken Breast")
                    .calories(165)
                    .protein(31.0)
                    .carbs(0.0)
                    .fats(3.6)
                    .cuisine("American")
                    .servingSize("100g")
                    .build(),
                FoodEntity.builder()
                    .name("Brown Rice")
                    .calories(111)
                    .protein(2.6)
                    .carbs(23.0)
                    .fats(0.9)
                    .cuisine("Asian")
                    .servingSize("100g")
                    .build(),
                FoodEntity.builder()
                    .name("Avocado")
                    .calories(160)
                    .protein(2.0)
                    .carbs(9.0)
                    .fats(15.0)
                    .cuisine("Mexican")
                    .servingSize("100g")
                    .build(),
                FoodEntity.builder()
                    .name("Greek Yogurt")
                    .calories(59)
                    .protein(10.0)
                    .carbs(3.6)
                    .fats(0.4)
                    .cuisine("Greek")
                    .servingSize("100g")
                    .build(),
                FoodEntity.builder()
                    .name("Salmon")
                    .calories(208)
                    .protein(20.0)
                    .carbs(0.0)
                    .fats(13.0)
                    .cuisine("Japanese")
                    .servingSize("100g")
                    .build(),
                FoodEntity.builder()
                    .name("Quinoa")
                    .calories(120)
                    .protein(4.4)
                    .carbs(21.0)
                    .fats(1.9)
                    .cuisine("South American")
                    .servingSize("100g")
                    .build(),
                FoodEntity.builder()
                    .name("Eggs")
                    .calories(155)
                    .protein(13.0)
                    .carbs(1.1)
                    .fats(11.0)
                    .cuisine("American")
                    .servingSize("100g")
                    .build(),
                FoodEntity.builder()
                    .name("Sweet Potato")
                    .calories(86)
                    .protein(1.6)
                    .carbs(20.0)
                    .fats(0.1)
                    .cuisine("American")
                    .servingSize("100g")
                    .build()
            );
            
            foodRepository.saveAll(defaultFoods);
        }
    }
}
