-- PostgreSQL Database Schema for UnisAllRound

-- Drop tables if they exist
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'Studente', 'Docente', 'PTA'
    matricola VARCHAR(10), -- only for Studente
    department VARCHAR(150), -- for Studente, Docente
    degree_course VARCHAR(150), -- only for Studente
    work_scope VARCHAR(100), -- only for PTA
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Career Exams Table (only for Studente)
CREATE TABLE exams (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    grade INT NOT NULL,
    date VARCHAR(50) NOT NULL,
    lode BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) NOT NULL, -- 'Superato' | 'Pianificato' | 'Da sostenere'
    cfu INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Support Tickets Table (for Studente, PTA)
CREATE TABLE tickets (
    id VARCHAR(50) PRIMARY KEY,
    creator_id VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'Aperto' | 'In corso' | 'In sospeso' | 'Chiuso'
    priority VARCHAR(30) NOT NULL, -- 'Bassa' | 'Media' | 'Alta'
    created_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);
