package com.mydoctor.controller;

import com.mydoctor.dto.request.ChatMessageRequest;
import com.mydoctor.dto.request.UpdatePatientProfileRequest;
import com.mydoctor.dto.response.ApiResponse;
import com.mydoctor.dto.response.ChatbotResponse;
import com.mydoctor.dto.response.DashboardResponse;
import com.mydoctor.dto.response.PatientProfileResponse;
import com.mydoctor.security.UserDetailsImpl;
import com.mydoctor.service.ChatbotService;
import com.mydoctor.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final ChatbotService chatbotService;

    /**
     * GET /api/patient/profile
     * PATIENT: view own profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched",
                        patientService.getProfile(currentUser.getId())));
    }

    /**
     * PUT /api/patient/profile
     * PATIENT: update own profile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody UpdatePatientProfileRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Profile updated",
                        patientService.updateProfile(currentUser.getId(), request)));
    }

    /**
     * GET /api/patient/dashboard
     * PATIENT: dashboard stats
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard fetched",
                        patientService.getDashboard(currentUser.getId())));
    }

    /**
     * POST /api/patient/chatbot/message
     * PATIENT: send message to Spring AI healthcare assistant for symptom triage & appointment reminders
     */
    @PostMapping("/chatbot/message")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<ChatbotResponse>> sendChatbotMessage(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("AI response generated",
                        chatbotService.processPatientMessage(currentUser.getId(), request)));
    }
}
