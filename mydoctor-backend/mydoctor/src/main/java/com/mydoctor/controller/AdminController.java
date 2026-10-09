package com.mydoctor.controller;

import com.mydoctor.dto.request.CreateUserAdminRequest;
import com.mydoctor.dto.request.UpdateAppointmentStatusAdminRequest;
import com.mydoctor.dto.request.UpdateDoctorAdminRequest;
import com.mydoctor.dto.request.UpdateUserAdminRequest;
import com.mydoctor.dto.response.AdminStatsResponse;
import com.mydoctor.dto.response.AdminUserResponse;
import com.mydoctor.dto.response.ApiResponse;
import com.mydoctor.dto.response.AppointmentResponse;
import com.mydoctor.dto.response.DoctorProfileResponse;
import com.mydoctor.dto.response.PaymentResponse;
import com.mydoctor.enums.AppointmentStatus;
import com.mydoctor.enums.AppointmentType;
import com.mydoctor.enums.Role;
import com.mydoctor.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ── Platform Stats & Analytics ─────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getPlatformStats() {
        return ResponseEntity.ok(
                ApiResponse.success("Platform statistics retrieved successfully", adminService.getPlatformStats()));
    }

    // ── User Management ────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", adminService.getAllUsers(role, active, search)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(
            @Valid @RequestBody CreateUserAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", adminService.createUser(request)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserAdminRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("User updated successfully", adminService.updateUser(id, request)));
    }

    @PatchMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User status updated successfully", adminService.toggleUserStatus(id)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    // ── Doctor Management ──────────────────────────────────────────────────────

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorProfileResponse>>> getAllDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialization) {
        return ResponseEntity.ok(
                ApiResponse.success("Doctors retrieved successfully", adminService.getAllDoctors(search, specialization)));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateDoctorProfile(
            @PathVariable Long id,
            @RequestBody UpdateDoctorAdminRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Doctor profile updated successfully", adminService.updateDoctorProfile(id, request)));
    }

    @PatchMapping("/doctors/{id}/toggle-status")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> toggleDoctorStatus(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Doctor status updated successfully", adminService.toggleDoctorStatus(id)));
    }

    @PatchMapping("/doctors/{id}/verification")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> verifyDoctor(
            @PathVariable Long id,
            @Valid @RequestBody com.mydoctor.dto.request.DoctorVerificationRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Doctor verification status updated successfully", adminService.verifyDoctor(id, request)));
    }

    // ── Appointment Management ─────────────────────────────────────────────────

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) AppointmentType type,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointments retrieved successfully", adminService.getAllAppointments(status, type, search)));
    }

    @PatchMapping("/appointments/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAppointmentStatusAdminRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment status updated successfully", adminService.updateAppointmentStatus(id, request)));
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        adminService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully", null));
    }

    // ── Financial Overview / Payments ──────────────────────────────────────────

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        return ResponseEntity.ok(
                ApiResponse.success("Payments retrieved successfully", adminService.getAllPayments()));
    }
}
