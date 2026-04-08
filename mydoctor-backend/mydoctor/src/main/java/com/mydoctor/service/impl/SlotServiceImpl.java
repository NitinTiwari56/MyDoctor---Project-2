package com.mydoctor.service.impl;

import com.mydoctor.dto.request.BulkCreateSlotRequest;
import com.mydoctor.dto.request.CreateSlotRequest;
import com.mydoctor.dto.response.TimeSlotResponse;
import com.mydoctor.entity.DoctorProfile;
import com.mydoctor.entity.TimeSlot;
import com.mydoctor.enums.SlotStatus;
import com.mydoctor.exception.BadRequestException;
import com.mydoctor.exception.ResourceNotFoundException;
import com.mydoctor.exception.UnauthorizedException;
import com.mydoctor.repository.DoctorProfileRepository;
import com.mydoctor.repository.TimeSlotRepository;
import com.mydoctor.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @Override
    @Transactional
    public TimeSlotResponse createSlot(Long doctorUserId, CreateSlotRequest request) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        validateSlotTimes(request.getStartTime(), request.getEndTime(), request.getSlotDate());

        if (timeSlotRepository.existsByDoctorAndSlotDateAndStartTime(
                doctor, request.getSlotDate(), request.getStartTime())) {
            throw new BadRequestException("A slot already exists at this time");
        }

        TimeSlot slot = TimeSlot.builder()
                .doctor(doctor)
                .slotDate(request.getSlotDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(SlotStatus.AVAILABLE)
                .build();

        return mapToResponse(timeSlotRepository.save(slot));
    }

    @Override
    @Transactional
    public List<TimeSlotResponse> createBulkSlots(Long doctorUserId, BulkCreateSlotRequest request) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);

        if (request.getFromDate().isAfter(request.getToDate())) {
            throw new BadRequestException("fromDate must be before or equal to toDate");
        }
        if (request.getSlotStartTime().isAfter(request.getSlotEndTime())) {
            throw new BadRequestException("slotStartTime must be before slotEndTime");
        }

        List<TimeSlot> slotsToSave = new ArrayList<>();
        LocalDate current = request.getFromDate();

        while (!current.isAfter(request.getToDate())) {
            LocalTime start = request.getSlotStartTime();
            while (start.plusMinutes(request.getSlotDurationMinutes())
                        .compareTo(request.getSlotEndTime()) <= 0) {
                LocalTime end = start.plusMinutes(request.getSlotDurationMinutes());
                final LocalDate slotDate = current;
                final LocalTime slotStart = start;

                if (!timeSlotRepository.existsByDoctorAndSlotDateAndStartTime(doctor, slotDate, slotStart)) {
                    slotsToSave.add(TimeSlot.builder()
                            .doctor(doctor)
                            .slotDate(slotDate)
                            .startTime(slotStart)
                            .endTime(end)
                            .status(SlotStatus.AVAILABLE)
                            .build());
                }
                start = end;
            }
            current = current.plusDays(1);
        }

        return timeSlotRepository.saveAll(slotsToSave)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getAvailableSlots(Long doctorProfileId, LocalDate date) {
        return timeSlotRepository
                .findAvailableSlotsByDoctorAndDate(doctorProfileId, date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getDoctorSlots(Long doctorUserId, LocalDate date) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        return timeSlotRepository.findByDoctorAndSlotDate(doctor, date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteSlot(Long doctorUserId, Long slotId) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        TimeSlot slot = getSlotById(slotId);
        ensureSlotBelongsToDoctor(slot, doctor);

        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new BadRequestException("Cannot delete a booked slot. Cancel the appointment first.");
        }
        timeSlotRepository.delete(slot);
    }

    @Override
    @Transactional
    public void blockSlot(Long doctorUserId, Long slotId) {
        DoctorProfile doctor = getDoctorByUserId(doctorUserId);
        TimeSlot slot = getSlotById(slotId);
        ensureSlotBelongsToDoctor(slot, doctor);

        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new BadRequestException("Cannot block a slot that is already booked.");
        }
        slot.setStatus(SlotStatus.BLOCKED);
        timeSlotRepository.save(slot);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private DoctorProfile getDoctorByUserId(Long userId) {
        return doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found for user id: " + userId));
    }

    private TimeSlot getSlotById(Long slotId) {
        return timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found: " + slotId));
    }

    private void ensureSlotBelongsToDoctor(TimeSlot slot, DoctorProfile doctor) {
        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedException("This slot does not belong to you");
        }
    }

    private void validateSlotTimes(LocalTime start, LocalTime end, LocalDate date) {
        if (!start.isBefore(end)) {
            throw new BadRequestException("Start time must be before end time");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot create slots in the past");
        }
    }

    public TimeSlotResponse mapToResponse(TimeSlot s) {
        return TimeSlotResponse.builder()
                .id(s.getId())
                .doctorId(s.getDoctor().getId())
                .slotDate(s.getSlotDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus())
                .build();
    }
}
