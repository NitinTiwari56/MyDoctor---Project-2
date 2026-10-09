package com.mydoctor.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalPatients;
    private long totalDoctors;
    private long activeDoctors;
    private long totalAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long rejectedAppointments;
    private long totalRevenue; // in Rupees
    private long pendingDoctorVerifications;
    private Map<String, Long> specializationStats;
    private Map<String, Long> appointmentTypeStats;
    private Map<String, Long> monthlyRevenueTrend;
    private Map<String, Long> dailyAppointmentTrend;
    private List<AppointmentResponse> recentAppointments;
}
