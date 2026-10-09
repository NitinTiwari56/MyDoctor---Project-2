package com.mydoctor.dto.response;

import com.mydoctor.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {

    private Long id;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private Integer amount; // in paise (INR * 100)

    private String currency;

    private PaymentStatus status;

    // Appointment info (if linked)
    private Long appointmentId;
    private String patientName;
    private String doctorName;
    private String appointmentType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
