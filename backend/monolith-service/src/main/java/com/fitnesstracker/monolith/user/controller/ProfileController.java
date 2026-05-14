package com.fitnesstracker.monolith.user.controller;

import com.fitnesstracker.monolith.user.dto.ProfileRequest;
import com.fitnesstracker.monolith.user.dto.ProfileResponse;
import com.fitnesstracker.monolith.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getUserProfile(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateUserProfile(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(userId, request));
    }

    /**
     * Returns calculated TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor equation.
     * Frontend uses this to show a daily calorie target in the Nutrition page.
     */
    @GetMapping("/tdee")
    public ResponseEntity<Map<String, Object>> getTdee(
            @RequestAttribute("userId") Long userId) {
        int tdee = userService.calculateTDEE(userId);
        ProfileResponse profile = userService.getUserProfile(userId);

        // Calculate macro split (40% carbs, 30% protein, 30% fat)
        int proteinCals = (int) (tdee * 0.30);
        int carbsCals   = (int) (tdee * 0.40);
        int fatCals     = (int) (tdee * 0.30);

        return ResponseEntity.ok(Map.of(
                "tdee", tdee,
                "proteinGrams",  (int) (proteinCals / 4.0),
                "carbsGrams",    (int) (carbsCals / 4.0),
                "fatGrams",      (int) (fatCals / 9.0),
                "fitnessGoal",   profile.fitnessGoal() != null ? profile.fitnessGoal() : "maintenance",
                "fitnessLevel",  profile.fitnessLevel() != null ? profile.fitnessLevel().name() : "BEGINNER"
        ));
    }
}
