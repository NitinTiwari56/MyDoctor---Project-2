package com.mydoctor.service.impl;

import com.mydoctor.dto.request.LoginRequest;
import com.mydoctor.dto.request.RegisterRequest;
import com.mydoctor.dto.response.AuthResponse;
import com.mydoctor.entity.DoctorProfile;
import com.mydoctor.entity.PatientProfile;
import com.mydoctor.entity.User;
import com.mydoctor.enums.Role;
import com.mydoctor.exception.BadRequestException;
import com.mydoctor.repository.DoctorProfileRepository;
import com.mydoctor.repository.PatientProfileRepository;
import com.mydoctor.repository.UserRepository;
import com.mydoctor.security.JwtUtils;
import com.mydoctor.security.UserDetailsImpl;
import com.mydoctor.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .active(true)
                .build();

        user = userRepository.save(user);

        if (request.getRole() == Role.DOCTOR) {
            DoctorProfile doctorProfile = DoctorProfile.builder()
                    .user(user)
                    .specialization(request.getSpecialization() != null ? request.getSpecialization() : "General")
                    .qualifications(request.getQualifications())
                    .clinicAddress(request.getClinicAddress())
                    .consultationFeeClinic(request.getConsultationFeeClinic() != null ? request.getConsultationFeeClinic() : 0)
                    .consultationFeeHome(request.getConsultationFeeHome() != null ? request.getConsultationFeeHome() : 0)
                    .bio(request.getBio())
                    .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0.0)
                    .acceptsHomeVisits(request.getAcceptsHomeVisits() != null && request.getAcceptsHomeVisits())
                    .build();
            doctorProfileRepository.save(doctorProfile);
        } else {
            PatientProfile patientProfile = PatientProfile.builder()
                    .user(user)
                    .build();
            patientProfileRepository.save(patientProfile);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .userId(userDetails.getId())
                .fullName(userDetails.getFullName())
                .email(userDetails.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .userId(userDetails.getId())
                .fullName(userDetails.getFullName())
                .email(userDetails.getUsername())
                .role(user.getRole())
                .build();
    }
}
