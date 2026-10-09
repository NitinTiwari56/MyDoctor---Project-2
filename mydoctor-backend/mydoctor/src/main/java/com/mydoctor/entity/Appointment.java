package com.mydoctor.entity;

import com.mydoctor.enums.AppointmentStatus;
import com.mydoctor.enums.AppointmentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorProfile doctor;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_slot_id")
    private TimeSlot timeSlot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentType appointmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(length = 1000)
    private String reasonForVisit;

    @Column(length = 1000)
    private String symptoms;

    // For home visit
    private String patientAddress;

    // Doctor's notes after appointment
    @Column(length = 2000)
    private String doctorNotes;

    // Rejection reason
    @Column(length = 500)
    private String rejectionReason;

    // Payment tracking
    private String razorpayOrderId;

    private String razorpayPaymentId;

    @Column(length = 20)
    private String paymentStatus; // CREATED, PAID, FAILED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
