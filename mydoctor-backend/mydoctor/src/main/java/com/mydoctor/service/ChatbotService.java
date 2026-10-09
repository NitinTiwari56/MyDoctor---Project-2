package com.mydoctor.service;

import com.mydoctor.dto.request.ChatMessageRequest;
import com.mydoctor.dto.response.ChatbotResponse;

public interface ChatbotService {
    ChatbotResponse processPatientMessage(Long patientUserId, ChatMessageRequest request);
}
