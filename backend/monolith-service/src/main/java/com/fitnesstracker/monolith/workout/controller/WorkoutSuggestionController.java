package com.fitnesstracker.monolith.workout.controller;

import com.fitnesstracker.monolith.user.entity.UserEntity.FitnessLevel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Returns structured workout plans based on the user's fitness level.
 * Plans include exercise name, sets, reps, rest time, and estimated calories burned.
 */
@RestController
@RequestMapping("/api/workouts/suggestions")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class WorkoutSuggestionController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSuggestions(
            @RequestParam(defaultValue = "BEGINNER") String level) {

        FitnessLevel fitnessLevel;
        try {
            fitnessLevel = FitnessLevel.valueOf(level.toUpperCase());
        } catch (IllegalArgumentException e) {
            fitnessLevel = FitnessLevel.BEGINNER;
        }

        return ResponseEntity.ok(buildPlan(fitnessLevel));
    }

    private Map<String, Object> buildPlan(FitnessLevel level) {
        return switch (level) {
            case BEGINNER -> Map.of(
                "level", "BEGINNER",
                "description", "Perfect for those just starting out. Focus on form and consistency.",
                "weeklyGoal", 3,
                "plans", List.of(
                    Map.of("day", "Monday", "type", "STRENGTH", "title", "Full Body Strength",
                        "duration", 30, "exercises", List.of(
                            Map.of("name", "Bodyweight Squats", "sets", 3, "reps", "12", "rest", "60s", "tip", "Keep chest up, knees over toes"),
                            Map.of("name", "Knee Push-ups", "sets", 3, "reps", "10", "rest", "60s", "tip", "Core tight throughout"),
                            Map.of("name", "Glute Bridges", "sets", 3, "reps", "15", "rest", "60s", "tip", "Squeeze glutes at top"),
                            Map.of("name", "Plank", "sets", 3, "reps", "20s hold", "rest", "60s", "tip", "Neutral spine, breathe steadily"),
                            Map.of("name", "Standing Calf Raises", "sets", 3, "reps", "15", "rest", "45s", "tip", "Full range of motion")
                        )),
                    Map.of("day", "Wednesday", "type", "CARDIO", "title", "Light Cardio",
                        "duration", 25, "exercises", List.of(
                            Map.of("name", "Brisk Walk / Slow Jog", "sets", 1, "reps", "20 min", "rest", "N/A", "tip", "Maintain conversational pace"),
                            Map.of("name", "Jumping Jacks", "sets", 3, "reps", "20", "rest", "30s", "tip", "Land softly"),
                            Map.of("name", "High Knees", "sets", 3, "reps", "30s", "rest", "30s", "tip", "Drive knees up to waist height")
                        )),
                    Map.of("day", "Friday", "type", "FLEXIBILITY", "title", "Stretch & Recovery",
                        "duration", 20, "exercises", List.of(
                            Map.of("name", "Hamstring Stretch", "sets", 2, "reps", "30s each side", "rest", "15s", "tip", "Don't bounce"),
                            Map.of("name", "Hip Flexor Stretch", "sets", 2, "reps", "30s each side", "rest", "15s", "tip", "Sink hips forward"),
                            Map.of("name", "Child's Pose", "sets", 2, "reps", "45s", "rest", "15s", "tip", "Breathe deeply"),
                            Map.of("name", "Shoulder Cross Stretch", "sets", 2, "reps", "20s each", "rest", "15s", "tip", "Keep arm parallel to ground")
                        ))
                )
            );

            case INTERMEDIATE -> Map.of(
                "level", "INTERMEDIATE",
                "description", "Build on your base. Progressive overload and varied training.",
                "weeklyGoal", 4,
                "plans", List.of(
                    Map.of("day", "Monday", "type", "STRENGTH", "title", "Upper Body Push",
                        "duration", 45, "exercises", List.of(
                            Map.of("name", "Push-ups", "sets", 4, "reps", "15", "rest", "60s", "tip", "Full chest to floor"),
                            Map.of("name", "Dumbbell Shoulder Press", "sets", 3, "reps", "12", "rest", "75s", "tip", "Control the descent"),
                            Map.of("name", "Tricep Dips", "sets", 3, "reps", "12", "rest", "60s", "tip", "Keep elbows tucked"),
                            Map.of("name", "Lateral Raises", "sets", 3, "reps", "15", "rest", "60s", "tip", "Slight bend in elbow"),
                            Map.of("name", "Diamond Push-ups", "sets", 3, "reps", "10", "rest", "75s", "tip", "Hands close together")
                        )),
                    Map.of("day", "Tuesday", "type", "CARDIO", "title", "Interval Running",
                        "duration", 35, "exercises", List.of(
                            Map.of("name", "Warm-up jog", "sets", 1, "reps", "5 min", "rest", "N/A", "tip", "Easy pace"),
                            Map.of("name", "Sprint intervals (1:2 ratio)", "sets", 8, "reps", "30s sprint / 60s walk", "rest", "N/A", "tip", "Maximum effort on sprint"),
                            Map.of("name", "Cool-down walk", "sets", 1, "reps", "5 min", "rest", "N/A", "tip", "Gradually lower heart rate")
                        )),
                    Map.of("day", "Thursday", "type", "STRENGTH", "title", "Lower Body Power",
                        "duration", 45, "exercises", List.of(
                            Map.of("name", "Goblet Squats", "sets", 4, "reps", "12", "rest", "75s", "tip", "Heels planted, chest tall"),
                            Map.of("name", "Romanian Deadlifts", "sets", 3, "reps", "12", "rest", "90s", "tip", "Hinge at hips, slight knee bend"),
                            Map.of("name", "Walking Lunges", "sets", 3, "reps", "12 each leg", "rest", "60s", "tip", "Long stride, 90-degree angles"),
                            Map.of("name", "Step-ups", "sets", 3, "reps", "12 each leg", "rest", "60s", "tip", "Drive through heel"),
                            Map.of("name", "Calf Raises (weighted)", "sets", 4, "reps", "20", "rest", "45s", "tip", "Full range, pause at top")
                        )),
                    Map.of("day", "Saturday", "type", "HIIT", "title", "HIIT Circuit",
                        "duration", 30, "exercises", List.of(
                            Map.of("name", "Burpees", "sets", 4, "reps", "10", "rest", "20s", "tip", "Explosive jump at top"),
                            Map.of("name", "Mountain Climbers", "sets", 4, "reps", "40s", "rest", "20s", "tip", "Keep hips level"),
                            Map.of("name", "Jump Squats", "sets", 4, "reps", "12", "rest", "20s", "tip", "Land softly"),
                            Map.of("name", "Plank to Downward Dog", "sets", 4, "reps", "10", "rest", "20s", "tip", "Smooth transition")
                        ))
                )
            );

            case ADVANCED -> Map.of(
                "level", "ADVANCED",
                "description", "High performance training. Periodized and progressive.",
                "weeklyGoal", 5,
                "plans", List.of(
                    Map.of("day", "Monday", "type", "STRENGTH", "title", "Chest & Triceps (Hypertrophy)",
                        "duration", 60, "exercises", List.of(
                            Map.of("name", "Bench Press (Barbell)", "sets", 4, "reps", "8-10", "rest", "90s", "tip", "Arch back naturally, retract scapula"),
                            Map.of("name", "Incline Dumbbell Press", "sets", 3, "reps", "10-12", "rest", "75s", "tip", "Controlled negative"),
                            Map.of("name", "Cable Flyes", "sets", 3, "reps", "12-15", "rest", "60s", "tip", "Squeeze at peak contraction"),
                            Map.of("name", "Close-Grip Bench Press", "sets", 3, "reps", "10", "rest", "75s", "tip", "Elbows close to body"),
                            Map.of("name", "Overhead Tricep Extension", "sets", 3, "reps", "12", "rest", "60s", "tip", "Stabilize upper arm"),
                            Map.of("name", "Tricep Pushdowns (Cable)", "sets", 3, "reps", "15", "rest", "45s", "tip", "Full extension at bottom")
                        )),
                    Map.of("day", "Tuesday", "type", "HIIT", "title", "Metabolic Conditioning",
                        "duration", 45, "exercises", List.of(
                            Map.of("name", "Box Jumps", "sets", 5, "reps", "8", "rest", "30s", "tip", "Land quietly, full hip extension"),
                            Map.of("name", "Kettlebell Swings", "sets", 5, "reps", "15", "rest", "30s", "tip", "Hip hinge — not a squat"),
                            Map.of("name", "Battle Ropes", "sets", 5, "reps", "30s", "rest", "30s", "tip", "Alternate arms, stay low"),
                            Map.of("name", "Sled Push", "sets", 4, "reps", "20m", "rest", "60s", "tip", "Drive from hips"),
                            Map.of("name", "Assault Bike Sprint", "sets", 4, "reps", "20s max effort", "rest", "40s", "tip", "Arms and legs together")
                        )),
                    Map.of("day", "Wednesday", "type", "STRENGTH", "title", "Back & Biceps",
                        "duration", 60, "exercises", List.of(
                            Map.of("name", "Deadlifts", "sets", 4, "reps", "5-6", "rest", "120s", "tip", "Neutral spine, bar over mid-foot"),
                            Map.of("name", "Weighted Pull-ups", "sets", 4, "reps", "8", "rest", "90s", "tip", "Dead hang start, full extension"),
                            Map.of("name", "Barbell Rows", "sets", 3, "reps", "10", "rest", "75s", "tip", "Row to lower chest"),
                            Map.of("name", "Face Pulls", "sets", 3, "reps", "15", "rest", "60s", "tip", "External rotation at end"),
                            Map.of("name", "Barbell Curls", "sets", 3, "reps", "10-12", "rest", "60s", "tip", "No swinging"),
                            Map.of("name", "Hammer Curls", "sets", 3, "reps", "12 each", "rest", "45s", "tip", "Full supination")
                        )),
                    Map.of("day", "Friday", "type", "STRENGTH", "title", "Legs (Power + Volume)",
                        "duration", 65, "exercises", List.of(
                            Map.of("name", "Back Squats", "sets", 5, "reps", "5", "rest", "120s", "tip", "Break parallel, brace core"),
                            Map.of("name", "Hack Squats", "sets", 3, "reps", "12", "rest", "90s", "tip", "High foot placement for quads"),
                            Map.of("name", "Romanian Deadlifts", "sets", 4, "reps", "10", "rest", "90s", "tip", "Feel stretch in hamstrings"),
                            Map.of("name", "Leg Press", "sets", 4, "reps", "15", "rest", "75s", "tip", "Don't lock knees at top"),
                            Map.of("name", "Leg Curl Machine", "sets", 4, "reps", "12", "rest", "60s", "tip", "Controlled negative"),
                            Map.of("name", "Standing Calf Raises", "sets", 5, "reps", "20", "rest", "30s", "tip", "Full stretch at bottom")
                        )),
                    Map.of("day", "Saturday", "type", "CARDIO", "title", "Zone 2 Cardio + Core",
                        "duration", 45, "exercises", List.of(
                            Map.of("name", "Steady State Run/Bike", "sets", 1, "reps", "30 min at 65% max HR", "rest", "N/A", "tip", "Conversational pace throughout"),
                            Map.of("name", "Dragon Flags", "sets", 3, "reps", "8", "rest", "60s", "tip", "Slow and controlled"),
                            Map.of("name", "Ab Wheel Rollout", "sets", 3, "reps", "10", "rest", "60s", "tip", "Keep hips from sagging"),
                            Map.of("name", "Hanging Leg Raises", "sets", 3, "reps", "12", "rest", "60s", "tip", "No swinging")
                        ))
                )
            );
        };
    }
}
