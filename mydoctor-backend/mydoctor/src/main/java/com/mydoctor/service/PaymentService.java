package com.mydoctor.service;

import com.mydoctor.dto.request.CreatePaymentOrderRequest;
import com.mydoctor.dto.request.VerifyPaymentRequest;
import com.mydoctor.dto.response.PaymentOrderResponse;

public interface PaymentService {

    /**
     * Create a Razorpay order based on doctor fees and appointment type.
     */
    PaymentOrderResponse createOrder(Long patientUserId, CreatePaymentOrderRequest request);

    /**
     * Verify payment signature from Razorpay and mark payment as PAID.
     * Returns true if verification succeeds.
     */
    boolean verifyPayment(VerifyPaymentRequest request);
}
