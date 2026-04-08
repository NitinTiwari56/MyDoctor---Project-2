package com.mydoctor.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorProfileResponse {
    private Long userId;
    private Long doctorProfileId;
    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private String qualifications;
    private String clinicAddress;
    private Integer consultationFeeClinic;
    private Integer consultationFeeHome;
    private String bio;
    private Double experienceYears;
    private boolean acceptsHomeVisits;
    private String profilePictureUrl;
}
