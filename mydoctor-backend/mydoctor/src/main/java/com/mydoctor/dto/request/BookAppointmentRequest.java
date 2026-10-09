package com.mydoctor.dto.request;

import com.mydoctor.enums.AppointmentType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookAppointmentRequest {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    // Required for CLINIC_VISIT; null for HOME_VISIT
    private Long timeSlotId;

    @NotNull(message = "Appointment type is required")
    private AppointmentType appointmentType;

    private String reasonForVisit;

    private String symptoms;

    // Required for HOME_VISIT
    private String patientAddress;

    // Razorpay payment details
    private String razorpayOrderId;

    private String razorpayPaymentId;
}
