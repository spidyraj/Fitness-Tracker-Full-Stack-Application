package com.fitnesstracker.monolith.nutrition.controller;

import com.fitnesstracker.monolith.nutrition.entity.FoodEntity;
import com.fitnesstracker.monolith.nutrition.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @GetMapping
    public ResponseEntity<List<FoodEntity>> searchFoods(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String cuisine) {
        List<FoodEntity> foods = foodService.searchFoods(search, cuisine);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/cuisines")
    public ResponseEntity<List<String>> getAllCuisines() {
        return ResponseEntity.ok(foodService.getAllCuisines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodEntity> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @PostMapping
    public ResponseEntity<FoodEntity> createFood(@Valid @RequestBody FoodEntity food) {
        return ResponseEntity.ok(foodService.createFood(food));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodEntity> updateFood(
            @PathVariable Long id,
            @Valid @RequestBody FoodEntity foodDetails) {
        return ResponseEntity.ok(foodService.updateFood(id, foodDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/initialize")
    public ResponseEntity<String> initializeDefaultFoods() {
        foodService.initializeDefaultFoods();
        return ResponseEntity.ok("Default foods initialized successfully");
    }
}
