package com.mydoctor.service;

import com.mydoctor.dto.request.UpdateDoctorProfileRequest;
import com.mydoctor.dto.response.DoctorProfileResponse;
import com.mydoctor.dto.response.DashboardResponse;

import java.util.List;

public interface DoctorService {
    DoctorProfileResponse getProfile(Long userId);
    DoctorProfileResponse updateProfile(Long userId, UpdateDoctorProfileRequest request);
    List<DoctorProfileResponse> getAllDoctors();
    List<DoctorProfileResponse> searchDoctors(String keyword);
    List<DoctorProfileResponse> getDoctorsBySpecialization(String specialization);
    DashboardResponse getDashboard(Long userId);
}
