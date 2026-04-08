package com.mydoctor.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardResponse {
    // Common
    private String fullName;
    private String role;

    // Doctor stats
    private Long totalAppointments;
    private Long pendingAppointments;
    private Long confirmedAppointments;
    private Long completedAppointments;

    // Patient stats
    private Long upcomingAppointments;
    private Long cancelledAppointments;
}
