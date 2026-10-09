package com.mydoctor.dto.request;

import com.mydoctor.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserAdminRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Role is required")
    private Role role;

    // Doctor specific fields if role == DOCTOR
    private String specialization;
    private String qualifications;
    private String clinicAddress;
    private Integer consultationFeeClinic;
    private Integer consultationFeeHome;
    private String bio;
    private Double experienceYears;
    private Boolean acceptsHomeVisits;

    // Patient specific fields if role == PATIENT
    private String gender;
    private String bloodGroup;
    private String address;
}
