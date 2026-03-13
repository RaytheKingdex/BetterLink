-- BetterLink MVP schema (MySQL 8)
-- This schema supports role-based users, job applications, and communities.

CREATE DATABASE IF NOT EXISTS betterlink;
USE betterlink;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('student', 'employer', 'admin') NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    university VARCHAR(140) NOT NULL,
    program_name VARCHAR(140) NOT NULL,
    graduation_year INT NULL,
    gpa DECIMAL(3,2) NULL,
    skills TEXT NULL,
    resume_url VARCHAR(255) NULL,
    portfolio_url VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    organization_name VARCHAR(180) NOT NULL,
    industry VARCHAR(120) NULL,
    website VARCHAR(255) NULL,
    location VARCHAR(180) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_employers_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employer_id BIGINT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(180) NULL,
    employment_type ENUM('internship', 'part-time', 'full-time', 'contract') NOT NULL,
    status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    application_deadline DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_employer
        FOREIGN KEY (employer_id) REFERENCES employers(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT NOT NULL,
    student_user_id BIGINT NOT NULL,
    cover_letter TEXT NULL,
    status ENUM('submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted') NOT NULL DEFAULT 'submitted',
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_application_job_student UNIQUE (job_id, student_user_id),
    CONSTRAINT fk_applications_job
        FOREIGN KEY (job_id) REFERENCES jobs(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_applications_student
        FOREIGN KEY (student_user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS communities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(160) NOT NULL,
    description TEXT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_communities_creator
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS community_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    community_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role ENUM('member', 'moderator') NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_community_user UNIQUE (community_id, user_id),
    CONSTRAINT fk_community_members_community
        FOREIGN KEY (community_id) REFERENCES communities(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_community_members_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    community_id BIGINT NOT NULL,
    sender_user_id BIGINT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_community
        FOREIGN KEY (community_id) REFERENCES communities(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Query performance indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_employer_status ON jobs(employer_id, status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_applications_student_status ON applications(student_user_id, status);
CREATE INDEX idx_applications_job_status ON applications(job_id, status);
CREATE INDEX idx_messages_community_created ON messages(community_id, created_at);
