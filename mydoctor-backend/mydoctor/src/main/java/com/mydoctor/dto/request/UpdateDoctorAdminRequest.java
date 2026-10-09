package com.mydoctor.dto.request;

import lombok.Data;

@Data
public class UpdateDoctorAdminRequest {
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
    private Boolean acceptsHomeVisits;
    private Boolean active;
}
