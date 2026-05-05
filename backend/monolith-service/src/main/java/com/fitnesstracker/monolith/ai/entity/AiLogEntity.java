package com.fitnesstracker.monolith.ai.entity;

import java.time.LocalDateTime;

/**
 * AI Log Entity - MongoDB temporarily disabled for deployment stability.
 * Will be re-enabled when MongoDB is properly configured.
 */
public class AiLogEntity {

    private String id;
    private Long userId;
    private String prompt;
    private String response;
    private LocalDateTime createdAt;

    public AiLogEntity() {}

    public AiLogEntity(Long userId, String prompt, String response) {
        this.userId = userId;
        this.prompt = prompt;
        this.response = response;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public Long getUserId() { return userId; }
    public String getPrompt() { return prompt; }
    public String getResponse() { return response; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public void setResponse(String response) { this.response = response; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
