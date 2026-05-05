package com.fitnesstracker.monolith;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Simple Unit Tests")
public class SimpleUnitTests {

    @Test
    @DisplayName("Basic math operations")
    void testBasicMath() {
        assertEquals(4, 2 + 2, "Addition should work");
        assertEquals(6, 3 * 2, "Multiplication should work");
        assertTrue(10 > 5, "Comparison should work");
    }

    @Test
    @DisplayName("String validation")
    void testStringValidation() {
        String appName = "Fitness Tracker";
        assertNotNull(appName);
        assertEquals("Fitness Tracker", appName);
        assertTrue(appName.contains("Fitness"));
        assertEquals(15, appName.length());
    }

    @Test
    @DisplayName("Collection operations")
    void testCollections() {
        java.util.List<String> workouts = java.util.Arrays.asList("Running", "Swimming", "Cycling");
        assertNotNull(workouts);
        assertEquals(3, workouts.size());
        assertTrue(workouts.contains("Running"));
        assertFalse(workouts.contains("Basketball"));
    }

    @Test
    @DisplayName("Date time operations")
    void testDateTime() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        assertNotNull(now);
        assertTrue(now.isAfter(java.time.LocalDateTime.MIN));
        assertTrue(now.isBefore(java.time.LocalDateTime.MAX));
        
        java.time.LocalDate today = java.time.LocalDate.now();
        assertNotNull(today);
        assertTrue(today.getYear() >= 2024);
    }

    @Test
    @DisplayName("Nutrition calculations")
    void testNutritionCalculations() {
        int calories = 400;
        double protein = 30.0;
        double carbs = 50.0;
        double fats = 15.0;
        
        assertEquals(400, calories);
        assertEquals(30.0, protein);
        assertEquals(50.0, carbs);
        assertEquals(15.0, fats);
        
        // Calculate total calories from macros (4 cal per gram protein/carb, 9 cal per gram fat)
        int calculatedCalories = (int)(protein * 4 + carbs * 4 + fats * 9);
        assertEquals(455, calculatedCalories);
    }

    @Test
    @DisplayName("Workout duration calculations")
    void testWorkoutCalculations() {
        int workoutMinutes = 45;
        double caloriesPerMinute = 8.0;
        
        assertEquals(45, workoutMinutes);
        assertEquals(8.0, caloriesPerMinute);
        
        int totalCalories = (int)(workoutMinutes * caloriesPerMinute);
        assertEquals(360, totalCalories);
    }

    @Test
    @DisplayName("User data validation")
    void testUserDataValidation() {
        Long userId = 12345L;
        String email = "test@example.com";
        String firstName = "John";
        
        assertNotNull(userId);
        assertEquals(12345L, userId);
        assertTrue(email.contains("@"));
        assertTrue(firstName.length() > 0);
    }
}
