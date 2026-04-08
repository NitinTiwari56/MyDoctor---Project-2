package com.mydoctor.dto.response;

import com.mydoctor.enums.AppointmentStatus;
import com.mydoctor.enums.AppointmentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentResponse {
    private Long id;

    // Patient info
    private Long patientId;
    private String patientName;
    private String patientPhone;

    // Doctor info
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;

    // Slot info
    private Long timeSlotId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private AppointmentType appointmentType;
    private AppointmentStatus status;

    private String reasonForVisit;
    private String symptoms;
    private String patientAddress;
    private String doctorNotes;
    private String rejectionReason;

    private LocalDateTime createdAt;
}
