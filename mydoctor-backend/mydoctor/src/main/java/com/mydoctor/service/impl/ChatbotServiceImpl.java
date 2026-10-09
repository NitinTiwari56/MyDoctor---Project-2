package com.mydoctor.service.impl;

import com.mydoctor.dto.request.ChatMessageRequest;
import com.mydoctor.dto.response.AppointmentResponse;
import com.mydoctor.dto.response.ChatbotResponse;
import com.mydoctor.dto.response.DoctorProfileResponse;
import com.mydoctor.entity.Appointment;
import com.mydoctor.entity.DoctorProfile;
import com.mydoctor.entity.PatientProfile;
import com.mydoctor.enums.AppointmentStatus;
import com.mydoctor.exception.ResourceNotFoundException;
import com.mydoctor.entity.User;
import com.mydoctor.repository.AppointmentRepository;
import com.mydoctor.repository.DoctorProfileRepository;
import com.mydoctor.repository.PatientProfileRepository;
import com.mydoctor.repository.UserRepository;
import com.mydoctor.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AppointmentRepository appointmentRepository;

    @Autowired(required = false)
    private ChatClient chatClient;

    @Override
    @Transactional(readOnly = true)
    public ChatbotResponse processPatientMessage(Long patientUserId, ChatMessageRequest request) {
        User user = userRepository.findById(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + patientUserId));

        String patientName = (user.getFullName() != null && !user.getFullName().isBlank()) ? user.getFullName() : "Patient";
        String userMsg = request.getMessage().trim();
        String lowerMsg = userMsg.toLowerCase();

        // 1. Gather patient's pending and upcoming appointments safely
        List<AppointmentResponse> pendingResponses = Collections.emptyList();
        Optional<PatientProfile> patientOpt = patientProfileRepository.findByUserId(patientUserId);
        if (patientOpt.isPresent()) {
            List<Appointment> allAppts = appointmentRepository.findByPatientOrderByCreatedAtDesc(patientOpt.get());
            pendingResponses = allAppts.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.CONFIRMED)
                    .map(this::mapToAppointmentResponse)
                    .collect(Collectors.toList());
        }

        // 2. Check if user is asking about appointments / reminders
        boolean asksAboutAppointments = lowerMsg.contains("appointment") || lowerMsg.contains("pending")
                || lowerMsg.contains("remind") || lowerMsg.contains("status") || lowerMsg.contains("schedule")
                || lowerMsg.contains("booking") || lowerMsg.contains("when") || lowerMsg.contains("upcoming")
                || lowerMsg.contains("visit");

        // 3. Clinical Symptom Analysis & Specialty Matching
        ClinicalAssessment assessment = analyzeSymptoms(lowerMsg);

        // 4. Retrieve best matching verified doctors
        List<DoctorProfileResponse> recommendedDoctors = findBestDoctors(assessment.specialty);

        // 5. Generate AI Chatbot Response using Spring AI (with expert clinical fallback)
        String aiReply = generateAiResponse(userMsg, assessment, pendingResponses, recommendedDoctors, patientName, request.getHistory());

        // 6. Build contextual quick suggestion chips
        List<String> suggestions = buildQuickSuggestions(assessment, pendingResponses.size());

        List<String> identifiedList = (assessment.detectedSymptoms != null && !assessment.detectedSymptoms.isBlank())
                ? Arrays.stream(assessment.detectedSymptoms.split("[,;•]"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return ChatbotResponse.builder()
                .reply(aiReply)
                .recommendedSpecialty(assessment.specialty)
                .symptomsIdentified(assessment.detectedSymptoms)
                .identifiedSymptoms(identifiedList)
                .recommendedDoctors(recommendedDoctors)
                .pendingAppointments(asksAboutAppointments ? pendingResponses : (pendingResponses.isEmpty() ? Collections.emptyList() : pendingResponses))
                .quickSuggestions(suggestions)
                .suggestionChips(suggestions)
                .isEmergency(assessment.isEmergency)
                .emergencyAlert(assessment.isEmergency)
                .build();
    }

    // ── Spring AI Prompt Engine ────────────────────────────────────────────────

    private String generateAiResponse(String userMsg, ClinicalAssessment assessment,
                                      List<AppointmentResponse> pendingAppts,
                                      List<DoctorProfileResponse> recommendedDoctors,
                                      String patientName,
                                      List<ChatMessageRequest.ChatHistoryItem> history) {
        // Try calling Spring AI ChatClient if available and configured
        if (chatClient != null) {
            try {
                String doctorsContext = formatDoctorsForPrompt(recommendedDoctors);

                String systemPrompt = String.format(
                        "You are MyDoctor AI Assistant, a compassionate, highly knowledgeable healthcare assistant.\n" +
                        "Patient Name: %s.\n" +
                        "Pending Appointments count: %d.\n" +
                        "Analyzed Specialty: %s.\n" +
                        "Emergency: %s.\n\n" +
                        "VERIFIED DOCTORS AVAILABLE IN DATABASE FOR THIS SPECIALTY:\n%s\n\n" +
                        "Instructions:\n" +
                        "1. Provide a concise, warm, professional response (maximum 3 paragraphs).\n" +
                        "2. Explain why they should consult a %s specialist based on their described symptoms.\n" +
                        "3. Explicitly recommend the verified doctor(s) listed above BY NAME, mentioning their qualifications, experience, and fee.\n" +
                        "4. If relevant, remind them about any pending appointments they have.\n" +
                        "5. Encourage them to choose and book with the doctor using the cards provided below.",
                        patientName, pendingAppts.size(), assessment.specialty, assessment.isEmergency,
                        doctorsContext, assessment.specialty
                );

                List<Message> messages = new ArrayList<>();
                messages.add(new SystemMessage(systemPrompt));

                if (history != null) {
                    for (ChatMessageRequest.ChatHistoryItem item : history) {
                        if ("user".equalsIgnoreCase(item.getRole())) {
                            messages.add(new UserMessage(item.getContent()));
                        } else if ("assistant".equalsIgnoreCase(item.getRole())) {
                            messages.add(new AssistantMessage(item.getContent()));
                        }
                    }
                }
                messages.add(new UserMessage(userMsg));

                Prompt prompt = new Prompt(messages);
                var chatResponse = chatClient.call(prompt);
                if (chatResponse != null && chatResponse.getResult() != null && chatResponse.getResult().getOutput() != null) {
                    String springAiContent = chatResponse.getResult().getOutput().getContent();
                    if (springAiContent != null && !springAiContent.isBlank()) {
                        return springAiContent;
                    }
                }
            } catch (Throwable ex) {
                log.warn("Spring AI remote call error (falling back to clinical intelligence): {}", ex.getMessage());
            }
        }

        // Built-in intelligent clinical engine
        return buildClinicalReply(userMsg, assessment, pendingAppts, recommendedDoctors, patientName);
    }

    private String formatDoctorsForPrompt(List<DoctorProfileResponse> doctors) {
        if (doctors == null || doctors.isEmpty()) {
            return "No verified doctors currently registered in our database for this specific specialty. Advise patient to consult our General Medicine practitioners.";
        }
        StringBuilder sb = new StringBuilder();
        int idx = 1;
        for (DoctorProfileResponse d : doctors) {
            sb.append(idx++).append(". Dr. ").append(d.getFullName() != null ? d.getFullName() : "Specialist")
              .append(" | Specialization: ").append(d.getSpecialization() != null ? d.getSpecialization() : "Medical Practitioner")
              .append(" | Qualifications: ").append(d.getQualifications() != null ? d.getQualifications() : "MBBS")
              .append(" | Experience: ").append(d.getExperienceYears() != null ? d.getExperienceYears().intValue() + " years" : "Experienced")
              .append(" | Consultation Fee: ₹").append(d.getConsultationFeeClinic() != null ? d.getConsultationFeeClinic() : 500)
              .append(" | Clinic Address: ").append(d.getClinicAddress() != null ? d.getClinicAddress() : "Consultation Clinic")
              .append(" | Home Visits: ").append(d.isAcceptsHomeVisits() ? "Available" : "Not offered")
              .append("\n");
        }
        return sb.toString();
    }

    private String buildClinicalReply(String userMsg, ClinicalAssessment assessment,
                                       List<AppointmentResponse> pendingAppts,
                                       List<DoctorProfileResponse> recommendedDoctors,
                                       String patientName) {
        StringBuilder sb = new StringBuilder();
        String lower = userMsg.toLowerCase();

        // Greeting
        if (lower.startsWith("hi") || lower.startsWith("hello") || lower.startsWith("hey")) {
            sb.append("Hello ").append(patientName).append("! I'm your MyDoctor AI Health Assistant. ");
        }

        // Emergency Alert
        if (assessment.isEmergency) {
            sb.append("⚠️ **URGENT MEDICAL NOTICE**: The symptoms you described could indicate a critical condition. ")
              .append("Please seek immediate emergency medical care or call local emergency dispatch without delay.\n\n");
        }

        // Pending Appointments reminder if patient inquired or has pending visits
        if (lower.contains("appointment") || lower.contains("pending") || lower.contains("remind") || lower.contains("schedule")) {
            if (pendingAppts.isEmpty()) {
                sb.append("You currently have **no pending or upcoming appointments**. Would you like to schedule a visit with one of our certified specialists?\n\n");
            } else {
                sb.append("📅 **Appointment Reminder**: You have **").append(pendingAppts.size())
                  .append("** scheduled visit(s):\n");
                for (AppointmentResponse a : pendingAppts) {
                    sb.append("• **Dr. ").append(a.getDoctorName() != null ? a.getDoctorName() : "Specialist")
                      .append("** (").append(a.getDoctorSpecialization() != null ? a.getDoctorSpecialization() : "Consultant").append(") on ")
                      .append(a.getAppointmentDate() != null ? a.getAppointmentDate() : "Scheduled date")
                      .append(" at ").append(a.getStartTime() != null ? a.getStartTime() : "time slot")
                      .append(" — Status: **").append(a.getStatus()).append("**\n");
                }
                sb.append("\n");
            }
        }

        // Symptom Assessment & Recommendation
        if (!"General Medicine".equalsIgnoreCase(assessment.specialty) || assessment.hasSpecificSymptoms) {
            sb.append("Based on your symptoms (").append(assessment.detectedSymptoms).append("), ")
              .append("I strongly recommend consulting a **").append(assessment.specialty).append("** specialist. ")
              .append(assessment.clinicalRationale).append("\n\n");

            if (recommendedDoctors != null && !recommendedDoctors.isEmpty()) {
                sb.append("Here are verified **").append(assessment.specialty).append("** doctors available on MyDoctor:\n");
                for (DoctorProfileResponse d : recommendedDoctors) {
                    sb.append("• **Dr. ").append(d.getFullName() != null ? d.getFullName() : "Specialist").append("**")
                      .append(" (").append(d.getSpecialization() != null ? d.getSpecialization() : assessment.specialty).append(")")
                      .append(" — ").append(d.getQualifications() != null ? d.getQualifications() + ", " : "")
                      .append(d.getExperienceYears() != null ? d.getExperienceYears().intValue() + " yrs exp" : "Experienced")
                      .append(" | Fee: ₹").append(d.getConsultationFeeClinic() != null ? d.getConsultationFeeClinic() : 500)
                      .append(d.isAcceptsHomeVisits() ? " | 🏠 Offers Home Visits" : "")
                      .append("\n");
                }
                sb.append("\nYou can select any of these doctors below to view open time slots and confirm your booking.");
            } else {
                sb.append("You can browse verified doctors in the platform directory below.");
            }
        } else if (!lower.contains("appointment") && !lower.contains("pending")) {
            sb.append("To connect you with the ideal specialist, could you describe what symptoms you are experiencing? ")
              .append("For example: *chest pain, joint pain, skin rash, headache, fever, or stomach acidity*. ")
              .append("I will instantly recommend the best qualified practitioner and check live slot availability for you!");
        }

        return sb.toString();
    }

    // ── Clinical Symptom Intelligence ──────────────────────────────────────────

    private ClinicalAssessment analyzeSymptoms(String text) {
        if (text.contains("chest") || text.contains("heart") || text.contains("palpitation") || text.contains("shortness of breath") || text.contains("blood pressure")) {
            boolean emergency = text.contains("severe chest") || text.contains("crushing") || text.contains("radiating");
            return new ClinicalAssessment(
                    "Cardiology",
                    "cardiovascular indicators (chest pressure, palpitations, breathlessness)",
                    "A Cardiologist specializes in diagnosing heart rhythms, circulation, and cardiac health to ensure your heart is functioning safely.",
                    emergency,
                    true
            );
        }

        if (text.contains("skin") || text.contains("rash") || text.contains("itch") || text.contains("acne") || text.contains("pimple") || text.contains("eczema") || text.contains("allergy") || text.contains("hair fall")) {
            return new ClinicalAssessment(
                    "Dermatology",
                    "dermatological symptoms (skin rash, itching, irritation, acne)",
                    "A Dermatologist will evaluate your skin condition, prescribe targeted topical or systemic treatments, and rule out allergic dermatitis.",
                    false,
                    true
            );
        }

        if (text.contains("headache") || text.contains("migraine") || text.contains("dizzy") || text.contains("dizziness") || text.contains("seizure") || text.contains("numb") || text.contains("nerve")) {
            return new ClinicalAssessment(
                    "Neurology",
                    "neurological indicators (headache, migraine, dizziness, nerve sensations)",
                    "A Neurologist specializes in nervous system disorders, migraines, and cranial pathways to accurately identify the root cause.",
                    text.contains("sudden numbness") || text.contains("speech"),
                    true
            );
        }

        if (text.contains("bone") || text.contains("joint") || text.contains("knee") || text.contains("fracture") || text.contains("back pain") || text.contains("spine") || text.contains("shoulder") || text.contains("sprain") || text.contains("arthritis")) {
            return new ClinicalAssessment(
                    "Orthopedics",
                    "musculoskeletal concerns (joint pain, bone stiffness, back pain)",
                    "An Orthopedic specialist assesses bones, joints, ligaments, and mobility to restore pain-free movement.",
                    false,
                    true
            );
        }

        if (text.contains("stomach") || text.contains("belly") || text.contains("acid") || text.contains("gastric") || text.contains("vomit") || text.contains("diarrhea") || text.contains("nausea") || text.contains("bloat") || text.contains("digestion")) {
            return new ClinicalAssessment(
                    "Gastroenterology",
                    "digestive symptoms (stomach pain, acidity, nausea, indigestion)",
                    "A Gastroenterologist focuses on the gastrointestinal tract, acid reflux, stomach lining, and nutritional absorption.",
                    text.contains("vomiting blood"),
                    true
            );
        }

        if (text.contains("tooth") || text.contains("teeth") || text.contains("gum") || text.contains("cavity") || text.contains("toothache") || text.contains("jaw")) {
            return new ClinicalAssessment(
                    "Dentistry",
                    "oral health symptoms (toothache, gum swelling, cavity pain)",
                    "A certified Dental Surgeon can perform restorative oral care, tooth pain relief, and dental hygiene procedures.",
                    false,
                    true
            );
        }

        if (text.contains("eye") || text.contains("vision") || text.contains("blur") || text.contains("glasses") || text.contains("optical")) {
            return new ClinicalAssessment(
                    "Ophthalmology",
                    "ocular symptoms (vision issues, eye strain, irritation)",
                    "An Ophthalmologist provides comprehensive eye examinations, corneal assessments, and vision correction guidance.",
                    false,
                    true
            );
        }

        if (text.contains("child") || text.contains("baby") || text.contains("infant") || text.contains("toddler") || text.contains("pediatric")) {
            return new ClinicalAssessment(
                    "Pediatrics",
                    "childhood health indicators (infant/child wellness, pediatric symptoms)",
                    "A Pediatrician is specially trained in infant, child, and adolescent healthcare, growth, and immunization.",
                    false,
                    true
            );
        }

        if (text.contains("fever") || text.contains("cold") || text.contains("cough") || text.contains("flu") || text.contains("weakness") || text.contains("body ache") || text.contains("throat")) {
            return new ClinicalAssessment(
                    "General Medicine",
                    "general infectious symptoms (fever, cold, body aches, malaise)",
                    "A General Physician provides primary diagnosis, laboratory tests, and targeted medications for acute viral or bacterial illness.",
                    false,
                    true
            );
        }

        // Default general consultation
        return new ClinicalAssessment(
                "General Medicine",
                "general health inquiry",
                "A General Physician can conduct an initial primary triage and refer to specialized care if required.",
                false,
                false
        );
    }

    private List<DoctorProfileResponse> findBestDoctors(String specialty) {
        List<DoctorProfile> all = doctorProfileRepository.findAll();

        return all.stream()
                .filter(d -> d.getUser() != null && d.getUser().isActive() && d.isVerified())
                .filter(d -> {
                    if (d.getSpecialization() == null) return false;
                    String s = d.getSpecialization().toLowerCase();
                    String target = specialty.toLowerCase();
                    return s.contains(target) || target.contains(s) || s.contains("general");
                })
                .sorted((a, b) -> Double.compare(b.getExperienceYears() != null ? b.getExperienceYears() : 0.0,
                                                  a.getExperienceYears() != null ? a.getExperienceYears() : 0.0))
                .limit(3)
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }

    private List<String> buildQuickSuggestions(ClinicalAssessment assessment, int pendingCount) {
        List<String> suggestions = new ArrayList<>();
        if (pendingCount > 0) {
            suggestions.add("⏰ Check my pending appointments");
        }
        if (!"General Medicine".equalsIgnoreCase(assessment.specialty)) {
            suggestions.add("🩺 Book " + assessment.specialty + " Doctor");
        } else {
            suggestions.add("🩺 Find doctor for chest pain");
            suggestions.add("🌿 Find doctor for skin rash");
            suggestions.add("🦴 Find doctor for joint pain");
        }
        suggestions.add("🏠 Doctors offering Home Visits");
        return suggestions;
    }

    // ── Mappers ────────────────────────────────────────────────────────────────

    private AppointmentResponse mapToAppointmentResponse(Appointment a) {
        AppointmentResponse.AppointmentResponseBuilder builder = AppointmentResponse.builder()
                .id(a.getId())
                .appointmentType(a.getAppointmentType())
                .status(a.getStatus())
                .reasonForVisit(a.getReasonForVisit())
                .symptoms(a.getSymptoms())
                .patientAddress(a.getPatientAddress())
                .doctorNotes(a.getDoctorNotes())
                .createdAt(a.getCreatedAt());

        if (a.getDoctor() != null) {
            builder.doctorId(a.getDoctor().getId())
                   .doctorSpecialization(a.getDoctor().getSpecialization());
            if (a.getDoctor().getUser() != null) {
                builder.doctorName(a.getDoctor().getUser().getFullName());
            }
        }

        if (a.getTimeSlot() != null) {
            builder.timeSlotId(a.getTimeSlot().getId())
                   .appointmentDate(a.getTimeSlot().getSlotDate())
                   .startTime(a.getTimeSlot().getStartTime())
                   .endTime(a.getTimeSlot().getEndTime());
        }

        return builder.build();
    }

    private DoctorProfileResponse mapToDoctorResponse(DoctorProfile d) {
        return DoctorProfileResponse.builder()
                .userId(d.getUser() != null ? d.getUser().getId() : null)
                .doctorProfileId(d.getId())
                .fullName(d.getUser() != null ? d.getUser().getFullName() : null)
                .email(d.getUser() != null ? d.getUser().getEmail() : null)
                .phone(d.getUser() != null ? d.getUser().getPhone() : null)
                .specialization(d.getSpecialization())
                .qualifications(d.getQualifications())
                .clinicAddress(d.getClinicAddress())
                .consultationFeeClinic(d.getConsultationFeeClinic())
                .consultationFeeHome(d.getConsultationFeeHome())
                .bio(d.getBio())
                .experienceYears(d.getExperienceYears())
                .acceptsHomeVisits(d.isAcceptsHomeVisits())
                .medicalLicenseNumber(d.getMedicalLicenseNumber())
                .verified(d.isVerified())
                .verificationStatus(d.getVerificationStatus())
                .build();
    }

    private static class ClinicalAssessment {
        final String specialty;
        final String detectedSymptoms;
        final String clinicalRationale;
        final boolean isEmergency;
        final boolean hasSpecificSymptoms;

        ClinicalAssessment(String specialty, String detectedSymptoms, String clinicalRationale,
                           boolean isEmergency, boolean hasSpecificSymptoms) {
            this.specialty = specialty;
            this.detectedSymptoms = detectedSymptoms;
            this.clinicalRationale = clinicalRationale;
            this.isEmergency = isEmergency;
            this.hasSpecificSymptoms = hasSpecificSymptoms;
        }
    }
}
