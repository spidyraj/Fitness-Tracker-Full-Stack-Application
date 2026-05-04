package com.fitnesstracker.ai.dto;

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
