package com.mydoctor.controller;

import com.mydoctor.dto.request.BulkCreateSlotRequest;
import com.mydoctor.dto.request.CreateSlotRequest;
import com.mydoctor.dto.response.ApiResponse;
import com.mydoctor.dto.response.TimeSlotResponse;
import com.mydoctor.security.UserDetailsImpl;
import com.mydoctor.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    /**
     * GET /api/slots/available?doctorId=&date=
     * Any authenticated user: view available slots for a doctor on a date
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(
                ApiResponse.success("Available slots",
                        slotService.getAvailableSlots(doctorId, date)));
    }

    /**
     * GET /api/slots/my?date=
     * DOCTOR: view own slots for a given date
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> getMySlots(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(
                ApiResponse.success("Your slots",
                        slotService.getDoctorSlots(currentUser.getId(), date)));
    }

    /**
     * POST /api/slots
     * DOCTOR: create a single time slot
     */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<TimeSlotResponse>> createSlot(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody CreateSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slot created",
                        slotService.createSlot(currentUser.getId(), request)));
    }

    /**
     * POST /api/slots/bulk
     * DOCTOR: bulk-create slots across a date range
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> createBulkSlots(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody BulkCreateSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slots created",
                        slotService.createBulkSlots(currentUser.getId(), request)));
    }

    /**
     * DELETE /api/slots/{slotId}
     * DOCTOR: delete an available slot
     */
    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long slotId) {
        slotService.deleteSlot(currentUser.getId(), slotId);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted"));
    }

    /**
     * PATCH /api/slots/{slotId}/block
     * DOCTOR: block a slot so it cannot be booked
     */
    @PatchMapping("/{slotId}/block")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> blockSlot(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long slotId) {
        slotService.blockSlot(currentUser.getId(), slotId);
        return ResponseEntity.ok(ApiResponse.success("Slot blocked"));
    }
}
