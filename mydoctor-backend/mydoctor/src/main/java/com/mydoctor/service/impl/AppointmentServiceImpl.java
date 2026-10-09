package com.mydoctor.service.impl;

import com.mydoctor.dto.request.AppointmentActionRequest;
import com.mydoctor.dto.request.BookAppointmentRequest;
import com.mydoctor.dto.response.AppointmentResponse;
import com.mydoctor.entity.*;
import com.mydoctor.enums.AppointmentStatus;
import com.mydoctor.enums.AppointmentType;
import com.mydoctor.enums.SlotStatus;
import com.mydoctor.exception.BadRequestException;
import com.mydoctor.exception.ResourceNotFoundException;
import com.mydoctor.exception.UnauthorizedException;
import com.mydoctor.repository.*;
import com.mydoctor.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final TimeSlotRepository timeSlotRepository;

    // ── Patient Actions ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AppointmentResponse bookAppointment(Long patientUserId, BookAppointmentRequest request) {
        PatientProfile patient = getPatientByUserId(patientUserId);
        DoctorProfile doctor   = getDoctorById(request.getDoctorId());

        TimeSlot slot = null;

        if (request.getAppointmentType() == AppointmentType.CLINIC_VISIT) {
            if (request.getTimeSlotId() == null) {
                throw new BadRequestException("Time slot ID is required for clinic visits");
            }
            slot = timeSlotRepository.findById(request.getTimeSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));

            if (!slot.getDoctor().getId().equals(doctor.getId())) {
                throw new BadRequestException("Time slot does not belong to this doctor");
            }
            if (slot.getStatus() != SlotStatus.AVAILABLE) {
                throw new BadRequestException("This slot is no longer available");
            }
            // Mark slot as booked
            slot.setStatus(SlotStatus.BOOKED);
            timeSlotRepository.save(slot);
        } else {
            // HOME_VISIT
            if (!doctor.isAcceptsHomeVisits()) {
                throw new BadRequestException("This doctor does not accept home visits");
            }
            if (request.getPatientAddress() == null || request.getPatientAddress().isBlank()) {
                throw new BadRequestException("Patient address is required for home visits");
            }
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .timeSlot(slot)
                .appointmentType(request.getAppointmentType())
                .status(AppointmentStatus.PENDING)
                .reasonForVisit(request.getReasonForVisit())
                .symptoms(request.getSymptoms())
                .patientAddress(request.getPatientAddress())
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .paymentStatus(request.getRazorpayPaymentId() != null ? "PAID" : "PENDING")
                .build();

        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(Long patientUserId, Long appointmentId) {
        PatientProfile patient = getPatientByUserId(patientUserId);
        Appointment appointment = getAppointmentById(appointmentId);

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new UnauthorizedException("You can only cancel your own appointments");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        // Free the slot if applicable
        if (appointment.getTimeSlot() != null) {
            TimeSlot slot = appointment.getTimeSlot();
            slot.setStatus(SlotStatus.AVAILABLE);
            timeSlotRepository.save(slot);
        }

        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(Long patientUserId) {
        PatientProfile patient = getPatientByUserId(patientUserId);
        return appointmentRepository.findByPatientOrderByCreatedAtDesc(patient)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Doctor Actions ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AppointmentResponse confirmAppointment(Long doctorUserId, Long appointmentId) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        Appointment appointment = getAppointmentById(appointmentId);
        ensureAppointmentBelongsToDoctor(appointment, doctor);

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BadRequestException("Only PENDING appointments can be confirmed");
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public AppointmentResponse rejectAppointment(Long doctorUserId, Long appointmentId,
                                                  AppointmentActionRequest request) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        Appointment appointment = getAppointmentById(appointmentId);
        ensureAppointmentBelongsToDoctor(appointment, doctor);

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BadRequestException("Only PENDING appointments can be rejected");
        }
        appointment.setStatus(AppointmentStatus.REJECTED);
        appointment.setRejectionReason(request.getRejectionReason());

        // Free the slot
        if (appointment.getTimeSlot() != null) {
            TimeSlot slot = appointment.getTimeSlot();
            slot.setStatus(SlotStatus.AVAILABLE);
            timeSlotRepository.save(slot);
        }

        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public AppointmentResponse completeAppointment(Long doctorUserId, Long appointmentId,
                                                    AppointmentActionRequest request) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        Appointment appointment = getAppointmentById(appointmentId);
        ensureAppointmentBelongsToDoctor(appointment, doctor);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BadRequestException("Only CONFIRMED appointments can be marked as completed");
        }
        appointment.setStatus(AppointmentStatus.COMPLETED);
        if (request != null && request.getDoctorNotes() != null) {
            appointment.setDoctorNotes(request.getDoctorNotes());
        }
        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(Long doctorUserId) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        return appointmentRepository.findByDoctorOrderByCreatedAtDesc(doctor)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorPendingAppointments(Long doctorUserId) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        return appointmentRepository.findPendingAppointmentsByDoctor(doctor)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long userId, Long appointmentId) {
        Appointment appointment = getAppointmentById(appointmentId);

        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor  = appointment.getDoctor().getUser().getId().equals(userId);

        if (!isPatient && !isDoctor) {
            throw new UnauthorizedException("You don't have access to this appointment");
        }
        return mapToResponse(appointment);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private PatientProfile getPatientByUserId(Long userId) {
        return patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found for user: " + userId));
    }

    private DoctorProfile getDoctorByUserId(Long userId) {
        return doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found for user: " + userId));
    }

    private DoctorProfile getDoctorById(Long doctorProfileId) {
        return doctorProfileRepository.findById(doctorProfileId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor not found: " + doctorProfileId));
    }

    private void ensureAppointmentBelongsToDoctor(Appointment appointment, DoctorProfile doctor) {
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedException("This appointment does not belong to you");
        }
    }

    public AppointmentResponse mapToResponse(Appointment a) {
        AppointmentResponse.AppointmentResponseBuilder builder = AppointmentResponse.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getUser().getFullName())
                .patientPhone(a.getPatient().getUser().getPhone())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getUser().getFullName())
                .doctorSpecialization(a.getDoctor().getSpecialization())
                .appointmentType(a.getAppointmentType())
                .status(a.getStatus())
                .reasonForVisit(a.getReasonForVisit())
                .symptoms(a.getSymptoms())
                .patientAddress(a.getPatientAddress())
                .doctorNotes(a.getDoctorNotes())
                .rejectionReason(a.getRejectionReason())
                .paymentStatus(a.getPaymentStatus())
                .razorpayPaymentId(a.getRazorpayPaymentId())
                .createdAt(a.getCreatedAt());

        if (a.getTimeSlot() != null) {
            builder.timeSlotId(a.getTimeSlot().getId())
                   .appointmentDate(a.getTimeSlot().getSlotDate())
                   .startTime(a.getTimeSlot().getStartTime())
                   .endTime(a.getTimeSlot().getEndTime());
        }
        return builder.build();
    }
}
