package com.fitnesstracker.user.dto;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String email,
        String firstName,
        String role
) {
    public static AuthResponse of(String token, Long userId, String email, String firstName, String role) {
        return new AuthResponse(token, "Bearer", userId, email, firstName, role);
    }
}
