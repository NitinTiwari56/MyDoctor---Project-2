package com.mydoctor.service;

import com.mydoctor.dto.request.UpdatePatientProfileRequest;
import com.mydoctor.dto.response.DashboardResponse;
import com.mydoctor.dto.response.PatientProfileResponse;

public interface PatientService {
    PatientProfileResponse getProfile(Long userId);
    PatientProfileResponse updateProfile(Long userId, UpdatePatientProfileRequest request);
    DashboardResponse getDashboard(Long userId);
}
