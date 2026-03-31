-- ============================================================
-- Library Management System - Seed Data
-- Run AFTER schema.sql
-- Passwords (all): Password@123
-- ============================================================
USE library_db;

-- bcrypt hash for "Password@123"
SET @hash = '$2b$12$j27XjEbSGPuP8u33rcB93.MMJyjD8skRjRs3igVmLr4L.X55hwEga';

INSERT INTO users (first_name, last_name, email, password_hash, role, department, enrollment_id, phone) VALUES
('Super',   'Admin',   'admin@library.com',   @hash, 'admin',   'Administration', 'ADM-001', '9000000001'),
('Arjun',   'Sharma',  'student1@library.com', @hash, 'student', 'Computer Science', 'CS-2021-001', '9000000002'),
('Priya',   'Patel',   'student2@library.com', @hash, 'student', 'Electronics', 'EC-2021-002', '9000000003'),
('Rahul',   'Mehta',   'student3@library.com', @hash, 'student', 'Mechanical', 'ME-2022-003', '9000000004'),
('Sunita',  'Joshi',   'staff1@library.com',   @hash, 'staff',   'Computer Science', 'EMP-2019-001', '9000000005'),
('Vikram',  'Nair',    'staff2@library.com',   @hash, 'staff',   'Library', 'EMP-2020-002', '9000000006');

INSERT INTO books (title, author, isbn, semester, department, category, quantity, available_quantity, price, location, book_number, description) VALUES
('Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', '3', 'Computer Science', 'Textbook', 5, 4, 850.00, 'Rack A-1', 'BK-CS-001', 'Comprehensive textbook on algorithms and data structures.'),
('Database System Concepts', 'Abraham Silberschatz', '978-0078022159', '4', 'Computer Science', 'Textbook', 3, 3, 750.00, 'Rack A-2', 'BK-CS-002', 'Covers relational models, SQL, and database design.'),
('Computer Networks', 'Andrew Tanenbaum', '978-0132126953', '5', 'Computer Science', 'Textbook', 4, 4, 700.00, 'Rack A-3', 'BK-CS-003', 'Complete guide to computer networking concepts.'),
('Operating System Concepts', 'Abraham Silberschatz', '978-1118063330', '4', 'Computer Science', 'Textbook', 3, 2, 800.00, 'Rack A-4', 'BK-CS-004', 'Covers OS fundamentals, processes, memory, and file systems.'),
('Signals and Systems', 'Alan Oppenheim', '978-0138147570', '3', 'Electronics', 'Textbook', 2, 2, 650.00, 'Rack B-1', 'BK-EC-001', 'Foundation of signals and systems analysis.'),
('Electronic Devices and Circuit Theory', 'Robert Boylestad', '978-0132622264', '2', 'Electronics', 'Textbook', 3, 3, 700.00, 'Rack B-2', 'BK-EC-002', 'Comprehensive coverage of electronics devices.'),
('Engineering Mathematics', 'B.S. Grewal', '978-8174091955', '1', 'General', 'Reference', 6, 6, 500.00, 'Rack C-1', 'BK-GN-001', 'Standard mathematics textbook for engineering students.'),
('Fluid Mechanics', 'Frank White', '978-0073529349', '4', 'Mechanical', 'Textbook', 2, 2, 780.00, 'Rack D-1', 'BK-ME-001', 'Comprehensive fluid mechanics for mechanical engineers.'),
('Machine Design', 'V.B. Bhandari', '978-0070083417', '5', 'Mechanical', 'Textbook', 3, 3, 620.00, 'Rack D-2', 'BK-ME-002', 'Design of machine elements with solved examples.'),
('The Pragmatic Programmer', 'David Thomas', '978-0135957059', NULL, 'General', 'Reference', 2, 2, 950.00, 'Rack C-2', 'BK-GN-002', 'Classic guide to software craftsmanship.');

INSERT INTO book_number_sequences (department_code, last_number) VALUES
('CS', 4),
('EC', 2),
('GN', 2),
('ME', 2);

-- Issue one book to student1
INSERT INTO book_issues (user_id, book_id, issued_by, issue_date, due_date, status) VALUES
(2, 4, 1, CURDATE() - INTERVAL 7 DAY, CURDATE() + INTERVAL 7 DAY, 'issued');

-- Mark a returned book
INSERT INTO book_issues (user_id, book_id, issued_by, issue_date, due_date, return_date, status) VALUES
(3, 1, 1, CURDATE() - INTERVAL 20 DAY, CURDATE() - INTERVAL 6 DAY, CURDATE() - INTERVAL 2 DAY, 'returned');
