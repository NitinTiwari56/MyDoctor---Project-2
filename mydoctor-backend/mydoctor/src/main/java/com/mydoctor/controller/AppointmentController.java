package com.mydoctor.controller;

import com.mydoctor.dto.request.AppointmentActionRequest;
import com.mydoctor.dto.request.BookAppointmentRequest;
import com.mydoctor.dto.response.ApiResponse;
import com.mydoctor.dto.response.AppointmentResponse;
import com.mydoctor.security.UserDetailsImpl;
import com.mydoctor.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ── Shared ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/appointments/{id}
     * Both PATIENT and DOCTOR can view an appointment they're part of
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointment(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment fetched",
                        appointmentService.getAppointmentById(currentUser.getId(), id)));
    }

    // ── Patient Endpoints ──────────────────────────────────────────────────────

    /**
     * POST /api/appointments/book
     * PATIENT: book a clinic or home visit appointment
     */
    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully",
                        appointmentService.bookAppointment(currentUser.getId(), request)));
    }

    /**
     * PATCH /api/appointments/{id}/cancel
     * PATIENT: cancel an appointment
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment cancelled",
                        appointmentService.cancelAppointment(currentUser.getId(), id)));
    }

    /**
     * GET /api/appointments/my/patient
     * PATIENT: list all own appointments
     */
    @GetMapping("/my/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyPatientAppointments(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointments fetched",
                        appointmentService.getPatientAppointments(currentUser.getId())));
    }

    // ── Doctor Endpoints ───────────────────────────────────────────────────────

    /**
     * GET /api/appointments/my/doctor
     * DOCTOR: list all own appointments
     */
    @GetMapping("/my/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyDoctorAppointments(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointments fetched",
                        appointmentService.getDoctorAppointments(currentUser.getId())));
    }

    /**
     * GET /api/appointments/my/doctor/pending
     * DOCTOR: list pending appointment requests
     */
    @GetMapping("/my/doctor/pending")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getPendingAppointments(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(
                ApiResponse.success("Pending appointments",
                        appointmentService.getDoctorPendingAppointments(currentUser.getId())));
    }

    /**
     * PATCH /api/appointments/{id}/confirm
     * DOCTOR: confirm a pending appointment
     */
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment confirmed",
                        appointmentService.confirmAppointment(currentUser.getId(), id)));
    }

    /**
     * PATCH /api/appointments/{id}/reject
     * DOCTOR: reject a pending appointment
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rejectAppointment(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long id,
            @RequestBody(required = false) AppointmentActionRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment rejected",
                        appointmentService.rejectAppointment(currentUser.getId(), id,
                                request != null ? request : new AppointmentActionRequest())));
    }

    /**
     * PATCH /api/appointments/{id}/complete
     * DOCTOR: mark a confirmed appointment as completed and add notes
     */
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long id,
            @RequestBody(required = false) AppointmentActionRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment completed",
                        appointmentService.completeAppointment(currentUser.getId(), id, request)));
    }
}
