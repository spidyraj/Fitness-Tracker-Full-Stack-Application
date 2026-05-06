package com.fitnesstracker.monolith.nutrition.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "foods")
public class FoodEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer calories;

    @Column(nullable = false)
    private Double protein;

    @Column(nullable = false)
    private Double carbs;

    @Column(nullable = false)
    private Double fats;

    @Column
    private String cuisine;

    @Column
    private String servingSize;

    @Column
    private String brand;

    @Column
    private String barcode;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ─── Constructors ────────────────────────────────────────────────────────
    public FoodEntity() {}

    private FoodEntity(Builder builder) {
        this.name = builder.name;
        this.calories = builder.calories;
        this.protein = builder.protein;
        this.carbs = builder.carbs;
        this.fats = builder.fats;
        this.cuisine = builder.cuisine;
        this.servingSize = builder.servingSize;
        this.brand = builder.brand;
        this.barcode = builder.barcode;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name, cuisine, servingSize, brand, barcode;
        private Integer calories;
        private Double protein, carbs, fats;
        
        public Builder name(String v) { this.name = v; return this; }
        public Builder calories(Integer v) { this.calories = v; return this; }
        public Builder protein(Double v) { this.protein = v; return this; }
        public Builder carbs(Double v) { this.carbs = v; return this; }
        public Builder fats(Double v) { this.fats = v; return this; }
        public Builder cuisine(String v) { this.cuisine = v; return this; }
        public Builder servingSize(String v) { this.servingSize = v; return this; }
        public Builder brand(String v) { this.brand = v; return this; }
        public Builder barcode(String v) { this.barcode = v; return this; }
        public FoodEntity build() { return new FoodEntity(this); }
    }

    // ─── Getters & Setters ───────────────────────────────────────────────────
    public Long getId() { return id; }
    public String getName() { return name; }
    public Integer getCalories() { return calories; }
    public Double getProtein() { return protein; }
    public Double getCarbs() { return carbs; }
    public Double getFats() { return fats; }
    public String getCuisine() { return cuisine; }
    public String getServingSize() { return servingSize; }
    public String getBrand() { return brand; }
    public String getBarcode() { return barcode; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCalories(Integer calories) { this.calories = calories; }
    public void setProtein(Double protein) { this.protein = protein; }
    public void setCarbs(Double carbs) { this.carbs = carbs; }
    public void setFats(Double fats) { this.fats = fats; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
    public void setServingSize(String servingSize) { this.servingSize = servingSize; }
    public void setBrand(String brand) { this.brand = brand; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
}
