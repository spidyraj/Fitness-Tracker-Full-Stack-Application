package com.fitnesstracker.monolith.ai.dto;

import java.util.List;

public record GroqRequest(
        String model,
        List<Message> messages
) {
    public record Message(
            String role,
            String content
    ) {}
}
