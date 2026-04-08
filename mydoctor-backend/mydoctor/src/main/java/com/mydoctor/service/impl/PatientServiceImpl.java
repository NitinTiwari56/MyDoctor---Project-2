package com.mydoctor.service.impl;

import com.mydoctor.dto.request.UpdatePatientProfileRequest;
import com.mydoctor.dto.response.DashboardResponse;
import com.mydoctor.dto.response.PatientProfileResponse;
import com.mydoctor.entity.PatientProfile;
import com.mydoctor.entity.User;
import com.mydoctor.enums.AppointmentStatus;
import com.mydoctor.exception.ResourceNotFoundException;
import com.mydoctor.repository.AppointmentRepository;
import com.mydoctor.repository.PatientProfileRepository;
import com.mydoctor.repository.UserRepository;
import com.mydoctor.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public PatientProfileResponse getProfile(Long userId) {
        PatientProfile profile = getPatientProfileByUserId(userId);
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public PatientProfileResponse updateProfile(Long userId, UpdatePatientProfileRequest request) {
        PatientProfile profile = getPatientProfileByUserId(userId);
        User user = profile.getUser();

        if (request.getFullName() != null)               user.setFullName(request.getFullName());
        if (request.getPhone() != null)                  user.setPhone(request.getPhone());
        userRepository.save(user);

        if (request.getDateOfBirth() != null)            profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null)                 profile.setGender(request.getGender());
        if (request.getBloodGroup() != null)             profile.setBloodGroup(request.getBloodGroup());
        if (request.getAddress() != null)                profile.setAddress(request.getAddress());
        if (request.getEmergencyContactName() != null)   profile.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null)  profile.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getMedicalHistory() != null)         profile.setMedicalHistory(request.getMedicalHistory());
        if (request.getAllergies() != null)               profile.setAllergies(request.getAllergies());

        return mapToResponse(patientProfileRepository.save(profile));
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {
        PatientProfile profile = getPatientProfileByUserId(userId);

        long confirmed  = appointmentRepository.countByPatientAndStatus(profile, AppointmentStatus.CONFIRMED);
        long pending    = appointmentRepository.countByPatientAndStatus(profile, AppointmentStatus.PENDING);
        long completed  = appointmentRepository.countByPatientAndStatus(profile, AppointmentStatus.COMPLETED);
        long cancelled  = appointmentRepository.countByPatientAndStatus(profile, AppointmentStatus.CANCELLED);
        long upcoming   = confirmed + pending;

        return DashboardResponse.builder()
                .fullName(profile.getUser().getFullName())
                .role("PATIENT")
                .upcomingAppointments(upcoming)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .build();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private PatientProfile getPatientProfileByUserId(Long userId) {
        return patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found for user id: " + userId));
    }

    public PatientProfileResponse mapToResponse(PatientProfile p) {
        return PatientProfileResponse.builder()
                .userId(p.getUser().getId())
                .patientProfileId(p.getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .phone(p.getUser().getPhone())
                .dateOfBirth(p.getDateOfBirth())
                .gender(p.getGender())
                .bloodGroup(p.getBloodGroup())
                .address(p.getAddress())
                .emergencyContactName(p.getEmergencyContactName())
                .emergencyContactPhone(p.getEmergencyContactPhone())
                .medicalHistory(p.getMedicalHistory())
                .allergies(p.getAllergies())
                .build();
    }
}
