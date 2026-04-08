package com.mydoctor.controller;

import com.mydoctor.dto.request.UpdateDoctorProfileRequest;
import com.mydoctor.dto.response.ApiResponse;
import com.mydoctor.dto.response.DashboardResponse;
import com.mydoctor.dto.response.DoctorProfileResponse;
import com.mydoctor.security.UserDetailsImpl;
import com.mydoctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // ── Public Endpoints ───────────────────────────────────────────────────────

    /**
     * GET /api/doctors/list
     * Public: get all doctors
     */
    @GetMapping("/api/doctors/list")
    public ResponseEntity<ApiResponse<List<DoctorProfileResponse>>> getAllDoctors() {
        return ResponseEntity.ok(
                ApiResponse.success("Doctors fetched", doctorService.getAllDoctors()));
    }

    /**
     * GET /api/doctors/search?keyword=...
     * Public: search doctors by name or specialization
     */
    @GetMapping("/api/doctors/search")
    public ResponseEntity<ApiResponse<List<DoctorProfileResponse>>> searchDoctors(
            @RequestParam String keyword) {
        return ResponseEntity.ok(
                ApiResponse.success("Search results", doctorService.searchDoctors(keyword)));
    }

    /**
     * GET /api/doctors/specialization?name=...
     * Public: filter by specialization
     */
    @GetMapping("/api/doctors/specialization")
    public ResponseEntity<ApiResponse<List<DoctorProfileResponse>>> getBySpecialization(
            @RequestParam String name) {
        return ResponseEntity.ok(
                ApiResponse.success("Doctors by specialization",
                        doctorService.getDoctorsBySpecialization(name)));
    }

    // ── Doctor Private Endpoints ───────────────────────────────────────────────

    /**
     * GET /api/doctor/profile
     * DOCTOR: view own profile
     */
    @GetMapping("/api/doctor/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched",
                        doctorService.getProfile(currentUser.getId())));
    }

    /**
     * PUT /api/doctor/profile
     * DOCTOR: update own profile
     */
    @PutMapping("/api/doctor/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody UpdateDoctorProfileRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Profile updated",
                        doctorService.updateProfile(currentUser.getId(), request)));
    }

    /**
     * GET /api/doctor/dashboard
     * DOCTOR: dashboard stats
     */
    @GetMapping("/api/doctor/dashboard")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard fetched",
                        doctorService.getDashboard(currentUser.getId())));
    }
}
