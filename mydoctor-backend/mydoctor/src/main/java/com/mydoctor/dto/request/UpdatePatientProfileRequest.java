package com.mydoctor.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdatePatientProfileRequest {
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String medicalHistory;
    private String allergies;
}
