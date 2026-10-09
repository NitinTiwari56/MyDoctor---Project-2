-- ═══════════════════════════════════════════════════════════════════════════
-- MyDoctor — Add New Administrator (Direct SQL)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- HOW TO USE:
--   1. Replace the placeholder values below with actual admin details
--   2. The password MUST be BCrypt-hashed (you CANNOT use plain text)
--   3. Run this script against your MySQL database:
--
--      mysql -u root -p mydoctor_db < add_admin.sql
--
-- HOW TO GENERATE A BCRYPT HASH:
--   Option A: Use the Java utility class:
--      cd mydoctor-backend/mydoctor
--      mvn compile exec:java -Dexec.mainClass="com.mydoctor.util.AddAdminUtil"
--
--   Option B: Use an online BCrypt generator (https://bcrypt-generator.com/)
--      and paste the hash below.
--
--   Option C: Use this pre-generated hash for password "Admin@123":
--      $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--
-- ═══════════════════════════════════════════════════════════════════════════

-- Check: make sure the email doesn't already exist before inserting
INSERT INTO users (full_name, email, password, phone, role, active, created_at, updated_at)
SELECT
    'New Administrator',                                                          -- ← Change: Full name
    'newadmin@mydoctor.com',                                                      -- ← Change: Email
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',             -- ← Change: BCrypt hash of password
    '+91 00000 00000',                                                            -- ← Change: Phone number
    'ADMIN',
    true,
    NOW(),
    NOW()
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'newadmin@mydoctor.com'                     -- ← Must match the email above
);

-- Verify insertion
SELECT id, full_name, email, role, active, created_at
  FROM users
 WHERE role = 'ADMIN'
 ORDER BY created_at DESC;
