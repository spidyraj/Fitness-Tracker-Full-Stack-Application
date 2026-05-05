package com.fitnesstracker.monolith.user.service;

import com.fitnesstracker.monolith.user.dto.AuthResponse;
import com.fitnesstracker.monolith.user.dto.LoginRequest;
import com.fitnesstracker.monolith.user.dto.RegisterRequest;
import com.fitnesstracker.monolith.user.entity.UserEntity;
import com.fitnesstracker.monolith.exception.EmailAlreadyExistsException;
import com.fitnesstracker.monolith.user.repository.UserRepository;
import com.fitnesstracker.monolith.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        UserEntity user = UserEntity.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(UserEntity.Role.USER)
                .build();

        UserEntity saved = userRepository.save(user);
        log.info("New user registered: {}", saved.getEmail());

        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name());
        return AuthResponse.of(token, saved.getId(), saved.getEmail(), saved.getFirstName(), saved.getRole().name());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return AuthResponse.of(token, user.getId(), user.getEmail(), user.getFirstName(), user.getRole().name());
    }
}
