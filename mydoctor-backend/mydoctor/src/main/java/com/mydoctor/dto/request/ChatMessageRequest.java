package com.mydoctor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ChatMessageRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private List<ChatHistoryItem> history;

    @Data
    public static class ChatHistoryItem {
        private String role; // "user" or "assistant"
        private String content;
    }
}
