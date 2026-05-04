package com.fitnesstracker.ai.dto;

import java.util.List;

public record GroqResponse(
        String id,
        List<Choice> choices
) {
    public record Choice(
            int index,
            Message message
    ) {}

    public record Message(
            String role,
            String content
    ) {}
}
