package com.mydoctor.service.impl;

import com.mydoctor.dto.request.CreatePaymentOrderRequest;
import com.mydoctor.dto.request.VerifyPaymentRequest;
import com.mydoctor.dto.response.PaymentOrderResponse;
import com.mydoctor.entity.DoctorProfile;
import com.mydoctor.entity.Payment;
import com.mydoctor.enums.PaymentStatus;
import com.mydoctor.exception.BadRequestException;
import com.mydoctor.exception.ResourceNotFoundException;
import com.mydoctor.repository.DoctorProfileRepository;
import com.mydoctor.repository.PaymentRepository;
import com.mydoctor.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public PaymentOrderResponse createOrder(Long patientUserId, CreatePaymentOrderRequest request) {
        DoctorProfile doctor = doctorProfileRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + request.getDoctorId()));

        // Determine fee based on appointment type
        int feeInRupees;
        if ("HOME_VISIT".equals(request.getAppointmentType())) {
            if (!doctor.isAcceptsHomeVisits()) {
                throw new BadRequestException("This doctor does not accept home visits");
            }
            feeInRupees = doctor.getConsultationFeeHome();
        } else {
            feeInRupees = doctor.getConsultationFeeClinic();
        }

        if (feeInRupees <= 0) {
            throw new BadRequestException("Consultation fee is not configured for this doctor");
        }

        int amountInPaise = feeInRupees * 100;

        try {
            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "appt_" + System.currentTimeMillis());

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            // Save payment record
            Payment payment = Payment.builder()
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(amountInPaise)
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .build();
            paymentRepository.save(payment);

            String doctorName = "Dr. " + doctor.getUser().getFullName();

            return PaymentOrderResponse.builder()
                    .orderId(razorpayOrder.get("id"))
                    .amount(amountInPaise)
                    .currency("INR")
                    .keyId(razorpayKeyId)
                    .doctorName(doctorName)
                    .description("Consultation fee for " + doctorName + " (" + request.getAppointmentType().replace("_", " ").toLowerCase() + ")")
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage(), e);
            throw new BadRequestException("Payment order creation failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public boolean verifyPayment(VerifyPaymentRequest request) {
        try {
            // Verify signature using Razorpay utility
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

            Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + request.getRazorpayOrderId()));

            if (isValid) {
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
                payment.setStatus(PaymentStatus.PAID);
                paymentRepository.save(payment);
                return true;
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                return false;
            }

        } catch (RazorpayException e) {
            log.error("Razorpay payment verification failed: {}", e.getMessage(), e);
            throw new BadRequestException("Payment verification failed: " + e.getMessage());
        }
    }
}
