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

        if (request.age() != null) user.setAge(request.age());
        if (request.weightKg() != null) user.setWeightKg(request.weightKg());
        if (request.heightCm() != null) user.setHeightCm(request.heightCm());
        if (request.fitnessGoal() != null) user.setFitnessGoal(request.fitnessGoal());
        if (request.activityLevel() != null) user.setActivityLevel(request.activityLevel());
        if (request.fitnessLevel() != null) user.setFitnessLevel(request.fitnessLevel());
        if (request.gender() != null) user.setGender(request.gender());
        if (request.targetCalories() != null) user.setTargetCalories(request.targetCalories());
        if (request.targetWeightKg() != null) user.setTargetWeightKg(request.targetWeightKg());

        return mapToProfileResponse(userRepository.save(user));
    }

    /**
     * Calculates TDEE (Total Daily Energy Expenditure) using the Mifflin-St Jeor equation.
     * Returns 2000 if profile data is incomplete.
     */
    public int calculateTDEE(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getWeightKg() == null || user.getHeightCm() == null || user.getAge() == null) {
            return 2000; // default
        }

        // Mifflin-St Jeor BMR
        double bmr;
        if (user.getGender() == UserEntity.Gender.FEMALE) {
            bmr = (10 * user.getWeightKg()) + (6.25 * user.getHeightCm()) - (5 * user.getAge()) - 161;
        } else {
            bmr = (10 * user.getWeightKg()) + (6.25 * user.getHeightCm()) - (5 * user.getAge()) + 5;
        }

        // Activity multiplier
        double multiplier = 1.2; // sedentary default
        if (user.getActivityLevel() != null) {
            multiplier = switch (user.getActivityLevel().toLowerCase()) {
                case "lightly_active", "light" -> 1.375;
                case "moderately_active", "moderate" -> 1.55;
                case "very_active" -> 1.725;
                case "extra_active" -> 1.9;
                default -> 1.2;
            };
        }

        return (int) Math.round(bmr * multiplier);
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
                user.getFitnessLevel(),
                user.getGender(),
                user.getTargetCalories(),
                user.getTargetWeightKg(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
