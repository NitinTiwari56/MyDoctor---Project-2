package com.mydoctor.controller;

import com.mydoctor.dto.request.CreatePaymentOrderRequest;
import com.mydoctor.dto.request.VerifyPaymentRequest;
import com.mydoctor.dto.response.ApiResponse;
import com.mydoctor.dto.response.PaymentOrderResponse;
import com.mydoctor.security.UserDetailsImpl;
import com.mydoctor.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/payments/create-order
     * Creates a Razorpay order for the given doctor & appointment type.
     * Returns the order details needed by Razorpay checkout.js on the frontend.
     */
    @PostMapping("/create-order")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createOrder(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody CreatePaymentOrderRequest request) {
        PaymentOrderResponse response = paymentService.createOrder(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Payment order created", response));
    }

    /**
     * POST /api/payments/verify
     * Verifies the Razorpay payment signature after checkout completes.
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Boolean>> verifyPayment(
            @RequestBody VerifyPaymentRequest request) {
        boolean verified = paymentService.verifyPayment(request);
        if (verified) {
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", true));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Payment verification failed"));
        }
    }
}
