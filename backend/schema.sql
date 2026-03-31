-- ============================================================
-- Library Management System - MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;

-- -----------------------------------------------
-- users table (unified auth for all roles)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','student','staff') NOT NULL DEFAULT 'student',
  department    VARCHAR(150),
  enrollment_id VARCHAR(100),          -- enrollment no (student) or employee id (staff/admin)
  phone         VARCHAR(20),
  address       TEXT,
  profile_image VARCHAR(255),
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- -----------------------------------------------
-- books table
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title              VARCHAR(255) NOT NULL,
  author             VARCHAR(255) NOT NULL,
  isbn               VARCHAR(20),
  semester           VARCHAR(20),
  department         VARCHAR(150),
  category           VARCHAR(100),
  quantity           INT UNSIGNED NOT NULL DEFAULT 1,
  available_quantity INT UNSIGNED NOT NULL DEFAULT 1,
  price              DECIMAL(10,2),
  location           VARCHAR(100),
  book_number        VARCHAR(100) UNIQUE,
  description        TEXT,
  cover_image        VARCHAR(255),
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_department (department)
) ENGINE=InnoDB;

-- -----------------------------------------------
-- book number sequences table
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS book_number_sequences (
  department_code VARCHAR(10) PRIMARY KEY,
  last_number     INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------
-- book_issues table
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS book_issues (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  book_id     INT UNSIGNED NOT NULL,
  issued_by   INT UNSIGNED NOT NULL,          -- admin who issued
  issue_date  DATE NOT NULL,
  due_date    DATE NOT NULL,
  return_date DATE,
  fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status      ENUM('issued','returned','overdue') NOT NULL DEFAULT 'issued',
  notes       TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_issue_user   FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_issue_book   FOREIGN KEY (book_id)   REFERENCES books(id) ON DELETE RESTRICT,
  CONSTRAINT fk_issue_admin  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user_id  (user_id),
  INDEX idx_book_id  (book_id),
  INDEX idx_status   (status)
) ENGINE=InnoDB;

-- -----------------------------------------------
-- refresh_tokens table (optional – for token rotation)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  token      VARCHAR(512) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(64))
) ENGINE=InnoDB;
