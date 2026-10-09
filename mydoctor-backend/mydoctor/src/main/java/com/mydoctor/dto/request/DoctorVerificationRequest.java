package com.mydoctor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorVerificationRequest {
    @NotBlank(message = "Status is required (APPROVED or REJECTED)")
    private String status; // APPROVED or REJECTED

    private String reason;
}
