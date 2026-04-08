package com.mydoctor.repository;

import com.mydoctor.entity.DoctorProfile;
import com.mydoctor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    Optional<DoctorProfile> findByUser(User user);

    Optional<DoctorProfile> findByUserId(Long userId);

    List<DoctorProfile> findBySpecializationContainingIgnoreCase(String specialization);

    List<DoctorProfile> findByAcceptsHomeVisitsTrue();

    @Query("SELECT d FROM DoctorProfile d WHERE " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<DoctorProfile> searchDoctors(@Param("keyword") String keyword);
}
