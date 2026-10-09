package com.mydoctor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {
    private String reply;
    private String recommendedSpecialty;
    private String symptomsIdentified;
    private List<String> identifiedSymptoms;
    private List<DoctorProfileResponse> recommendedDoctors;
    private List<AppointmentResponse> pendingAppointments;
    private List<String> quickSuggestions;
    private List<String> suggestionChips;
    private boolean isEmergency;
    private boolean emergencyAlert;
}
