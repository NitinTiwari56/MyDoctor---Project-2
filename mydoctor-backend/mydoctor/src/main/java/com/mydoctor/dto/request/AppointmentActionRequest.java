package com.mydoctor.dto.request;

import lombok.Data;

@Data
public class AppointmentActionRequest {
    // Used by doctor to confirm/reject
    private String rejectionReason;
    // Used by doctor to add notes after appointment
    private String doctorNotes;
}
