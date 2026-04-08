package com.mydoctor.repository;

import com.mydoctor.entity.Appointment;
import com.mydoctor.entity.DoctorProfile;
import com.mydoctor.entity.PatientProfile;
import com.mydoctor.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Patient queries
    List<Appointment> findByPatientOrderByCreatedAtDesc(PatientProfile patient);

    List<Appointment> findByPatientAndStatus(PatientProfile patient, AppointmentStatus status);

    // Doctor queries
    List<Appointment> findByDoctorOrderByCreatedAtDesc(DoctorProfile doctor);

    List<Appointment> findByDoctorAndStatus(DoctorProfile doctor, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor " +
           "AND a.status = 'PENDING' ORDER BY a.createdAt ASC")
    List<Appointment> findPendingAppointmentsByDoctor(@Param("doctor") DoctorProfile doctor);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.timeSlot.slotDate = :date ORDER BY a.timeSlot.startTime ASC")
    List<Appointment> findByDoctorIdAndDate(
            @Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor AND a.status = :status")
    long countByDoctorAndStatus(@Param("doctor") DoctorProfile doctor,
                                 @Param("status") AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patient = :patient AND a.status = :status")
    long countByPatientAndStatus(@Param("patient") PatientProfile patient,
                                  @Param("status") AppointmentStatus status);
}
