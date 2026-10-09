package com.mydoctor.dto.response;

import com.mydoctor.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;
    
    // Doctor profile details if role is DOCTOR
    private Long doctorProfileId;
    private String specialization;
    private String qualifications;
    private String clinicAddress;
    private Integer consultationFeeClinic;
    private Integer consultationFeeHome;
    private Double experienceYears;
    private boolean acceptsHomeVisits;
    private long appointmentCount;

    // Patient profile details if role is PATIENT
    private Long patientProfileId;
    private String gender;
    private String bloodGroup;
    private String address;
}
