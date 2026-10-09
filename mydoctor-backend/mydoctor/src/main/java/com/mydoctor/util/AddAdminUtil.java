package com.mydoctor.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Scanner;

/**
 * Standalone utility to add a new ADMIN user directly into the database.
 *
 * Usage (run from the project root):
 *   mvn compile exec:java -Dexec.mainClass="com.mydoctor.util.AddAdminUtil"
 *
 * Or run this class directly from your IDE (right-click → Run).
 *
 * It will prompt you for:
 *   1. Full name
 *   2. Email
 *   3. Password
 *   4. Phone
 *   5. Database URL, username, password (with sensible defaults)
 */
public class AddAdminUtil {

    private static final String DEFAULT_DB_URL =
            "jdbc:mysql://localhost:3306/mydoctor_db?useSSL=false&serverTimezone=UTC";
    private static final String DEFAULT_DB_USER = "root";

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("╔══════════════════════════════════════════════╗");
        System.out.println("║   MyDoctor — Add New Administrator Utility   ║");
        System.out.println("╚══════════════════════════════════════════════╝");
        System.out.println();

        // ── Collect admin details ──────────────────────────────────────────────
        System.out.print("Full Name       : ");
        String fullName = scanner.nextLine().trim();
        if (fullName.isEmpty()) {
            System.err.println("ERROR: Full name cannot be empty.");
            return;
        }

        System.out.print("Email           : ");
        String email = scanner.nextLine().trim();
        if (email.isEmpty() || !email.contains("@")) {
            System.err.println("ERROR: Please provide a valid email address.");
            return;
        }

        System.out.print("Password        : ");
        String password = scanner.nextLine().trim();
        if (password.length() < 6) {
            System.err.println("ERROR: Password must be at least 6 characters.");
            return;
        }

        System.out.print("Phone           : ");
        String phone = scanner.nextLine().trim();
        if (phone.isEmpty()) {
            System.err.println("ERROR: Phone number cannot be empty.");
            return;
        }

        // ── Database connection details ────────────────────────────────────────
        System.out.println();
        System.out.println("── Database Connection (press Enter for defaults) ──");

        System.out.printf("DB URL     [%s]: ", DEFAULT_DB_URL);
        String dbUrl = scanner.nextLine().trim();
        if (dbUrl.isEmpty()) dbUrl = DEFAULT_DB_URL;

        System.out.printf("DB Username [%s]: ", DEFAULT_DB_USER);
        String dbUser = scanner.nextLine().trim();
        if (dbUser.isEmpty()) dbUser = DEFAULT_DB_USER;

        System.out.print("DB Password     : ");
        String dbPassword = scanner.nextLine().trim();

        // ── Insert into database ───────────────────────────────────────────────
        String hashedPassword = encoder.encode(password);

        String checkSql = "SELECT COUNT(*) FROM users WHERE email = ?";
        String insertSql = "INSERT INTO users (full_name, email, password, phone, role, active, created_at, updated_at) " +
                           "VALUES (?, ?, ?, ?, 'ADMIN', true, NOW(), NOW())";

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {

                // Check if email already exists
                try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                    checkStmt.setString(1, email);
                    ResultSet rs = checkStmt.executeQuery();
                    if (rs.next() && rs.getInt(1) > 0) {
                        System.err.println();
                        System.err.println("ERROR: A user with email '" + email + "' already exists.");
                        return;
                    }
                }

                // Insert admin user
                try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                    insertStmt.setString(1, fullName);
                    insertStmt.setString(2, email);
                    insertStmt.setString(3, hashedPassword);
                    insertStmt.setString(4, phone);
                    int rows = insertStmt.executeUpdate();

                    if (rows > 0) {
                        System.out.println();
                        System.out.println("✅ SUCCESS! New administrator created:");
                        System.out.println("   Name  : " + fullName);
                        System.out.println("   Email : " + email);
                        System.out.println("   Role  : ADMIN");
                        System.out.println();
                        System.out.println("   You can now log in at http://localhost:3000/login");
                    } else {
                        System.err.println("ERROR: Failed to insert admin user.");
                    }
                }
            }
        } catch (ClassNotFoundException e) {
            System.err.println("ERROR: MySQL JDBC driver not found. Make sure mysql-connector-j is on the classpath.");
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
