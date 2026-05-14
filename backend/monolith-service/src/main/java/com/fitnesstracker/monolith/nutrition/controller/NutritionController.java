package com.fitnesstracker.monolith.nutrition.controller;

import com.fitnesstracker.monolith.nutrition.dto.NutritionRequest;
import com.fitnesstracker.monolith.nutrition.dto.NutritionResponse;
import com.fitnesstracker.monolith.nutrition.service.NutritionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nutrition")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class NutritionController {

    private final NutritionService nutritionService;

    public NutritionController(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @PostMapping
    public ResponseEntity<NutritionResponse> logNutrition(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody NutritionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nutritionService.logNutrition(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<NutritionResponse>> getUserNutritionLogs(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(nutritionService.getUserNutritionLogs(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NutritionResponse> getNutritionLogById(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(nutritionService.getNutritionLogById(id, userId));
    }

    // ─── FIX: PUT endpoint was missing — the service had updateNutritionLog() but no controller route ───
    @PutMapping("/{id}")
    public ResponseEntity<NutritionResponse> updateNutritionLog(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody NutritionRequest request) {
        return ResponseEntity.ok(nutritionService.updateNutritionLog(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNutritionLog(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        nutritionService.deleteNutritionLog(id, userId);
        return ResponseEntity.noContent().build();
    }
}
