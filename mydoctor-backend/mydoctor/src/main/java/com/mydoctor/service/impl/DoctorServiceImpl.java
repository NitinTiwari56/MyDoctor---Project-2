package com.mydoctor.service.impl;

import com.mydoctor.dto.request.UpdateDoctorProfileRequest;
import com.mydoctor.dto.response.DashboardResponse;
import com.mydoctor.dto.response.DoctorProfileResponse;
import com.mydoctor.entity.DoctorProfile;
import com.mydoctor.entity.User;
import com.mydoctor.enums.AppointmentStatus;
import com.mydoctor.exception.ResourceNotFoundException;
import com.mydoctor.repository.AppointmentRepository;
import com.mydoctor.repository.DoctorProfileRepository;
import com.mydoctor.repository.UserRepository;
import com.mydoctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfile(Long userId) {
        DoctorProfile profile = getDoctorProfileByUserId(userId);
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public DoctorProfileResponse updateProfile(Long userId, UpdateDoctorProfileRequest request) {
        DoctorProfile profile = getDoctorProfileByUserId(userId);
        User user = profile.getUser();

        if (request.getFullName() != null)          user.setFullName(request.getFullName());
        if (request.getPhone() != null)             user.setPhone(request.getPhone());
        userRepository.save(user);

        if (request.getSpecialization() != null)    profile.setSpecialization(request.getSpecialization());
        if (request.getQualifications() != null)    profile.setQualifications(request.getQualifications());
        if (request.getClinicAddress() != null)     profile.setClinicAddress(request.getClinicAddress());
        if (request.getConsultationFeeClinic() != null) profile.setConsultationFeeClinic(request.getConsultationFeeClinic());
        if (request.getConsultationFeeHome() != null)   profile.setConsultationFeeHome(request.getConsultationFeeHome());
        if (request.getBio() != null)               profile.setBio(request.getBio());
        if (request.getExperienceYears() != null)   profile.setExperienceYears(request.getExperienceYears());
        if (request.getAcceptsHomeVisits() != null) profile.setAcceptsHomeVisits(request.getAcceptsHomeVisits());
        if (request.getProfilePictureUrl() != null) profile.setProfilePictureUrl(request.getProfilePictureUrl());

        return mapToResponse(doctorProfileRepository.save(profile));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> getAllDoctors() {
        return doctorProfileRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> searchDoctors(String keyword) {
        return doctorProfileRepository.searchDoctors(keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> getDoctorsBySpecialization(String specialization) {
        return doctorProfileRepository.findBySpecializationContainingIgnoreCase(specialization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {
        DoctorProfile profile = getDoctorProfileByUserId(userId);

        long total     = appointmentRepository.countByDoctorAndStatus(profile, AppointmentStatus.PENDING)
                       + appointmentRepository.countByDoctorAndStatus(profile, AppointmentStatus.CONFIRMED)
                       + appointmentRepository.countByDoctorAndStatus(profile, AppointmentStatus.COMPLETED)
                       + appointmentRepository.countByDoctorAndStatus(profile, AppointmentStatus.REJECTED)
                       + appointmentRepository.countByDoctorAndStatus(profile, AppointmentStatus.CANCELLED);
        long pending   = appointmentRepository.countByDoctorAndStatus(profile, AppointmentStatus.PENDING);
        long confirmed = appointmentRepository.countByDoctorAndStatus(profile, AppointmentStatus.CONFIRMED);
        long completed = appointmentRepository.countByDoctorAndStatus(profile, AppointmentStatus.COMPLETED);

        return DashboardResponse.builder()
                .fullName(profile.getUser().getFullName())
                .role("DOCTOR")
                .totalAppointments(total)
                .pendingAppointments(pending)
                .confirmedAppointments(confirmed)
                .completedAppointments(completed)
                .build();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private DoctorProfile getDoctorProfileByUserId(Long userId) {
        return doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found for user id: " + userId));
    }

    public DoctorProfileResponse mapToResponse(DoctorProfile p) {
        return DoctorProfileResponse.builder()
                .userId(p.getUser().getId())
                .doctorProfileId(p.getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .phone(p.getUser().getPhone())
                .specialization(p.getSpecialization())
                .qualifications(p.getQualifications())
                .clinicAddress(p.getClinicAddress())
                .consultationFeeClinic(p.getConsultationFeeClinic())
                .consultationFeeHome(p.getConsultationFeeHome())
                .bio(p.getBio())
                .experienceYears(p.getExperienceYears())
                .acceptsHomeVisits(p.isAcceptsHomeVisits())
                .profilePictureUrl(p.getProfilePictureUrl())
                .build();
    }
}
