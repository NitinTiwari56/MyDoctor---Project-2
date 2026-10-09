package com.mydoctor.service;

import com.mydoctor.dto.request.CreateUserAdminRequest;
import com.mydoctor.dto.request.UpdateAppointmentStatusAdminRequest;
import com.mydoctor.dto.request.UpdateDoctorAdminRequest;
import com.mydoctor.dto.request.UpdateUserAdminRequest;
import com.mydoctor.dto.response.AdminStatsResponse;
import com.mydoctor.dto.response.AdminUserResponse;
import com.mydoctor.dto.response.AppointmentResponse;
import com.mydoctor.dto.response.DoctorProfileResponse;
import com.mydoctor.dto.response.PaymentResponse;
import com.mydoctor.enums.AppointmentStatus;
import com.mydoctor.enums.AppointmentType;
import com.mydoctor.enums.Role;

import java.util.List;

public interface AdminService {

    AdminStatsResponse getPlatformStats();

    List<AdminUserResponse> getAllUsers(Role role, Boolean active, String search);

    AdminUserResponse toggleUserStatus(Long userId);

    AdminUserResponse updateUser(Long userId, UpdateUserAdminRequest request);

    AdminUserResponse createUser(CreateUserAdminRequest request);

    void deleteUser(Long userId);

    List<DoctorProfileResponse> getAllDoctors(String search, String specialization);

    DoctorProfileResponse updateDoctorProfile(Long doctorId, UpdateDoctorAdminRequest request);

    DoctorProfileResponse toggleDoctorStatus(Long doctorId);

    DoctorProfileResponse verifyDoctor(Long doctorId, com.mydoctor.dto.request.DoctorVerificationRequest request);

    List<AppointmentResponse> getAllAppointments(AppointmentStatus status, AppointmentType type, String search);

    AppointmentResponse updateAppointmentStatus(Long appointmentId, UpdateAppointmentStatusAdminRequest request);

    void deleteAppointment(Long appointmentId);

    List<PaymentResponse> getAllPayments();
}
