package com.fitnesstracker.monolith.user.controller;

import com.fitnesstracker.monolith.user.dto.ProfileRequest;
import com.fitnesstracker.monolith.user.dto.ProfileResponse;
import com.fitnesstracker.monolith.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
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
}
