package com.mydoctor.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentOrderResponse {

    private String orderId;

    private Integer amount; // in paise

    private String currency;

    private String keyId; // Razorpay public key for frontend

    private String doctorName;

    private String description;
}
