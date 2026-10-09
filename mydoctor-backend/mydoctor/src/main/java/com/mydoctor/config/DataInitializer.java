package com.mydoctor.config;

import com.mydoctor.entity.User;
import com.mydoctor.enums.Role;
import com.mydoctor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@mydoctor.com";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .fullName("Platform Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .phone("+91 98765 43210")
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info(">> Default Administrator created: {} / Admin@123", adminEmail);
        }
    }
}
