package com.mydoctor.dto.request;

import lombok.Data;

@Data
public class CreatePaymentOrderRequest {

    private Long doctorId;

    private String appointmentType; // "CLINIC_VISIT" or "HOME_VISIT"
}
