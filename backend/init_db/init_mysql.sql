-- MySQL Database Schema for UnisAllRound Academic Structures

-- Drop tables if they exist
DROP TABLE IF EXISTS reception_slots;
DROP TABLE IF EXISTS student_teachings;
DROP TABLE IF EXISTS teachings;
DROP TABLE IF EXISTS degree_courses;
DROP TABLE IF EXISTS departments;

-- Departments Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Degree Courses Table
CREATE TABLE degree_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    department_id INT NOT NULL,
    cfu INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teachings Table
CREATE TABLE teachings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    degree_course_id INT NOT NULL,
    teacher_id VARCHAR(50) NULL, -- References user ID in Postgres (Docente)
    FOREIGN KEY (degree_course_id) REFERENCES degree_courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teaching_per_course (name, degree_course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student-Teaching Many-to-Many Enrollment Table
CREATE TABLE student_teachings (
    student_id VARCHAR(50) NOT NULL, -- References user ID in Postgres (Studente)
    teaching_id INT NOT NULL,
    PRIMARY KEY (student_id, teaching_id),
    FOREIGN KEY (teaching_id) REFERENCES teachings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reception Slots Table (Calendar)
CREATE TABLE reception_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(50) NOT NULL, -- References user ID in Postgres (Docente)
    teaching_id INT NOT NULL,
    day VARCHAR(50) NOT NULL, -- e.g. 'Lun', 'Mar', etc.
    time_slot VARCHAR(50) NOT NULL, -- e.g. '09:00 - 10:00'
    status VARCHAR(30) NOT NULL, -- 'Libero' | 'Prenotato' | 'Non disponibile'
    description TEXT NULL,
    date VARCHAR(50) NULL,
    FOREIGN KEY (teaching_id) REFERENCES teachings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
