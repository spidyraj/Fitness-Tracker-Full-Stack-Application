package com.fitnesstracker.ai.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ai_logs")
public class AiLogEntity {

    @Id
    private String id;
    
    private Long userId;
    private String prompt;
    private String response;
    
    @CreatedDate
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
