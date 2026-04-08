package com.mydoctor.service;

import com.mydoctor.dto.request.BulkCreateSlotRequest;
import com.mydoctor.dto.request.CreateSlotRequest;
import com.mydoctor.dto.response.TimeSlotResponse;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {
    TimeSlotResponse createSlot(Long doctorUserId, CreateSlotRequest request);
    List<TimeSlotResponse> createBulkSlots(Long doctorUserId, BulkCreateSlotRequest request);
    List<TimeSlotResponse> getAvailableSlots(Long doctorId, LocalDate date);
    List<TimeSlotResponse> getDoctorSlots(Long doctorUserId, LocalDate date);
    void deleteSlot(Long doctorUserId, Long slotId);
    void blockSlot(Long doctorUserId, Long slotId);
}
