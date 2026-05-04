package com.fitnesstracker.analytics.controller;

import com.fitnesstracker.analytics.dto.DailySummary;
import com.fitnesstracker.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DailySummary> getDailySummary(
            @RequestAttribute("userId") Long userId,
            @RequestHeader("Authorization") String authHeader) {
        
        // Remove "Bearer " prefix if present
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        
        return ResponseEntity.ok(analyticsService.getDailySummary(userId, token));
    }
}
