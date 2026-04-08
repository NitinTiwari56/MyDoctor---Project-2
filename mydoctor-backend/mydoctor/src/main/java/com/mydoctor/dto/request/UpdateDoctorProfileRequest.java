package com.mydoctor.dto.request;

import lombok.Data;

@Data
public class UpdateDoctorProfileRequest {
    private String fullName;
    private String phone;
    private String specialization;
    private String qualifications;
    private String clinicAddress;
    private Integer consultationFeeClinic;
    private Integer consultationFeeHome;
    private String bio;
    private Double experienceYears;
    private Boolean acceptsHomeVisits;
    private String profilePictureUrl;
}
