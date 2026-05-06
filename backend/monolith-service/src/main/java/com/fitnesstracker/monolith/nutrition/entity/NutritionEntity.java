package com.fitnesstracker.monolith.nutrition.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_logs")
public class NutritionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Long userId;

    @NotBlank
    @Column(nullable = false)
    private String mealName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealType mealType;

    @NotNull
    @Column(nullable = false)
    private Integer calories;

    @Column
    private Double proteinGrams;

    @Column
    private Double carbsGrams;

    @Column
    private Double fatGrams;

    @Column
    private Double weightGrams;

    @Column
    private String servingDescription;

    @Column
    private String cuisine;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime logDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column
    private LocalDateTime updatedAt;

    public enum MealType {
        BREAKFAST, LUNCH, DINNER, SNACK
    }

    public NutritionEntity() {}

    private NutritionEntity(Builder builder) {
        this.userId = builder.userId;
        this.mealName = builder.mealName;
        this.mealType = builder.mealType != null ? builder.mealType : MealType.SNACK;
        this.calories = builder.calories;
        this.proteinGrams = builder.proteinGrams;
        this.carbsGrams = builder.carbsGrams;
        this.fatGrams = builder.fatGrams;
        this.weightGrams = builder.weightGrams;
        this.servingDescription = builder.servingDescription;
        this.cuisine = builder.cuisine;
        this.logDate = builder.logDate != null ? builder.logDate : LocalDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long userId;
        private String mealName;
        private MealType mealType;
        private Integer calories;
        private Double proteinGrams, carbsGrams, fatGrams;
        private Double weightGrams;
        private String servingDescription;
        private String cuisine;
        private LocalDateTime logDate;

        public Builder userId(Long v) { this.userId = v; return this; }
        public Builder mealName(String v) { this.mealName = v; return this; }
        public Builder mealType(MealType v) { this.mealType = v; return this; }
        public Builder calories(Integer v) { this.calories = v; return this; }
        public Builder proteinGrams(Double v) { this.proteinGrams = v; return this; }
        public Builder carbsGrams(Double v) { this.carbsGrams = v; return this; }
        public Builder fatGrams(Double v) { this.fatGrams = v; return this; }
        public Builder weightGrams(Double v) { this.weightGrams = v; return this; }
        public Builder servingDescription(String v) { this.servingDescription = v; return this; }
        public Builder cuisine(String v) { this.cuisine = v; return this; }
        public Builder logDate(LocalDateTime v) { this.logDate = v; return this; }
        public NutritionEntity build() { return new NutritionEntity(this); }
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getMealName() { return mealName; }
    public MealType getMealType() { return mealType; }
    public Integer getCalories() { return calories; }
    public Double getProteinGrams() { return proteinGrams; }
    public Double getCarbsGrams() { return carbsGrams; }
    public Double getFatGrams() { return fatGrams; }
    public Double getWeightGrams() { return weightGrams; }
    public String getServingDescription() { return servingDescription; }
    public String getCuisine() { return cuisine; }
    public LocalDateTime getLogDate() { return logDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setMealName(String mealName) { this.mealName = mealName; }
    public void setMealType(MealType mealType) { this.mealType = mealType; }
    public void setCalories(Integer calories) { this.calories = calories; }
    public void setProteinGrams(Double proteinGrams) { this.proteinGrams = proteinGrams; }
    public void setCarbsGrams(Double carbsGrams) { this.carbsGrams = carbsGrams; }
    public void setFatGrams(Double fatGrams) { this.fatGrams = fatGrams; }
    public void setWeightGrams(Double weightGrams) { this.weightGrams = weightGrams; }
    public void setServingDescription(String servingDescription) { this.servingDescription = servingDescription; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
    public void setLogDate(LocalDateTime logDate) { this.logDate = logDate; }
}
