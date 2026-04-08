package com.mydoctor.service;

import com.mydoctor.dto.request.AppointmentActionRequest;
import com.mydoctor.dto.request.BookAppointmentRequest;
import com.mydoctor.dto.response.AppointmentResponse;

import java.util.List;

public interface AppointmentService {
    // Patient actions
    AppointmentResponse bookAppointment(Long patientUserId, BookAppointmentRequest request);
    AppointmentResponse cancelAppointment(Long patientUserId, Long appointmentId);
    List<AppointmentResponse> getPatientAppointments(Long patientUserId);

    // Doctor actions
    AppointmentResponse confirmAppointment(Long doctorUserId, Long appointmentId);
    AppointmentResponse rejectAppointment(Long doctorUserId, Long appointmentId, AppointmentActionRequest request);
    AppointmentResponse completeAppointment(Long doctorUserId, Long appointmentId, AppointmentActionRequest request);
    List<AppointmentResponse> getDoctorAppointments(Long doctorUserId);
    List<AppointmentResponse> getDoctorPendingAppointments(Long doctorUserId);

    // Shared
    AppointmentResponse getAppointmentById(Long userId, Long appointmentId);
}
