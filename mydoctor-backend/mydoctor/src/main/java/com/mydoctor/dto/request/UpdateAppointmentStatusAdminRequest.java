package com.mydoctor.dto.request;

import com.mydoctor.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAppointmentStatusAdminRequest {
    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    private String doctorNotes;

    private String rejectionReason;
}
