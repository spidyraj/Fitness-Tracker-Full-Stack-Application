package com.fitnesstracker.monolith.user.service;

import com.fitnesstracker.monolith.user.dto.ProfileRequest;
import com.fitnesstracker.monolith.user.dto.ProfileResponse;
import com.fitnesstracker.monolith.user.entity.UserEntity;
import com.fitnesstracker.monolith.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getUserProfile(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateUserProfile(Long userId, ProfileRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update fields if provided
        if (request.age() != null) user.setAge(request.age());
        if (request.weightKg() != null) user.setWeightKg(request.weightKg());
        if (request.heightCm() != null) user.setHeightCm(request.heightCm());
        if (request.fitnessGoal() != null) user.setFitnessGoal(request.fitnessGoal());
        if (request.activityLevel() != null) user.setActivityLevel(request.activityLevel());

        UserEntity saved = userRepository.save(user);
        return mapToProfileResponse(saved);
    }

    private ProfileResponse mapToProfileResponse(UserEntity user) {
        return new ProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getAge(),
                user.getWeightKg(),
                user.getHeightCm(),
                user.getFitnessGoal(),
                user.getActivityLevel(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
