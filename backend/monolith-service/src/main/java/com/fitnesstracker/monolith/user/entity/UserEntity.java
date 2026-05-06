package com.fitnesstracker.monolith.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        })
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(nullable = false)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(nullable = false)
    private String lastName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(min = 8)
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column
    private Integer age;

    @Column
    private Double weightKg;

    @Column
    private Double heightCm;

    @Column
    private String fitnessGoal;

    @Column
    private String activityLevel;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column
    private LocalDateTime updatedAt;

    public enum Role {
        USER, ADMIN
    }

    // ─── Constructors ────────────────────────────────────────────────────────
    public UserEntity() {}

    private UserEntity(Builder builder) {
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.email = builder.email;
        this.password = builder.password;
        this.role = builder.role != null ? builder.role : Role.USER;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String firstName, lastName, email, password;
        private Role role;
        public Builder firstName(String v) { this.firstName = v; return this; }
        public Builder lastName(String v)  { this.lastName  = v; return this; }
        public Builder email(String v)     { this.email     = v; return this; }
        public Builder password(String v)  { this.password  = v; return this; }
        public Builder role(Role v)        { this.role      = v; return this; }
        public UserEntity build()          { return new UserEntity(this); }
    }

    // ─── Getters & Setters ───────────────────────────────────────────────────
    public Long getId()             { return id; }
    public String getFirstName()    { return firstName; }
    public String getLastName()     { return lastName; }
    public String getEmail()        { return email; }
    public String getPassword()     { return password; }
    public Role getRole()           { return role; }
    public Integer getAge()         { return age; }
    public Double getWeightKg()     { return weightKg; }
    public Double getHeightCm()     { return heightCm; }
    public String getFitnessGoal()  { return fitnessGoal; }
    public String getActivityLevel() { return activityLevel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id)              { this.id = id; }
    public void setFirstName(String v)      { this.firstName = v; }
    public void setLastName(String v)       { this.lastName = v; }
    public void setEmail(String v)          { this.email = v; }
    public void setPassword(String v)       { this.password = v; }
    public void setRole(Role v)             { this.role = v; }
    public void setAge(Integer v)           { this.age = v; }
    public void setWeightKg(Double v)       { this.weightKg = v; }
    public void setHeightCm(Double v)       { this.heightCm = v; }
    public void setFitnessGoal(String v)    { this.fitnessGoal = v; }
    public void setActivityLevel(String v)  { this.activityLevel = v; }
}
