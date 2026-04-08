package com.mydoctor.repository;

import com.mydoctor.entity.DoctorProfile;
import com.mydoctor.entity.TimeSlot;
import com.mydoctor.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByDoctorAndSlotDate(DoctorProfile doctor, LocalDate slotDate);

    List<TimeSlot> findByDoctorAndSlotDateAndStatus(DoctorProfile doctor, LocalDate slotDate, SlotStatus status);

    List<TimeSlot> findByDoctorAndSlotDateBetween(DoctorProfile doctor, LocalDate startDate, LocalDate endDate);

    List<TimeSlot> findByDoctorAndSlotDateGreaterThanEqualAndStatus(
            DoctorProfile doctor, LocalDate date, SlotStatus status);

    Optional<TimeSlot> findByDoctorAndSlotDateAndStartTime(
            DoctorProfile doctor, LocalDate slotDate, LocalTime startTime);

    boolean existsByDoctorAndSlotDateAndStartTime(
            DoctorProfile doctor, LocalDate slotDate, LocalTime startTime);

    @Query("SELECT t FROM TimeSlot t WHERE t.doctor.id = :doctorId " +
           "AND t.slotDate = :date AND t.status = 'AVAILABLE' ORDER BY t.startTime")
    List<TimeSlot> findAvailableSlotsByDoctorAndDate(
            @Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}
