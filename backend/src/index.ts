import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import { queryPg } from './db_pg';
import { queryMysql, mysqlPool } from './db_mysql';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Seeder function to populate PostgreSQL and MySQL
async function seedDatabase() {
  console.log('Checking database seeding...');

  try {
    // Run schema migration to add language and profile_picture if they don't exist
    await queryPg(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'IT',
      ADD COLUMN IF NOT EXISTS profile_picture TEXT
    `);
    
    // Create notifications table if it doesn't exist
    await queryPg(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        body TEXT NOT NULL,
        target VARCHAR(30) NOT NULL,
        date VARCHAR(50) NOT NULL,
        sender_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('PostgreSQL schema migration completed: language, profile_picture columns and notifications table verified.');
  } catch (err) {
    console.error('Failed to run schema migration on PostgreSQL:', err);
  }

  try {
    // 1. Check if database needs reset (if count of departments is not equal to 3)
    const deptsCountRes = await queryMysql('SELECT COUNT(*) as count FROM departments') as any;
    const deptsCount = deptsCountRes[0]?.count || 0;

    const needsReseed = deptsCount !== 3;

    if (needsReseed) {
      console.log('Departments count is not 3. Resetting and reseeding databases...');

      // Truncate MySQL tables cleanly
      const connection = await mysqlPool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE student_teachings');
        await connection.execute('TRUNCATE TABLE reception_slots');
        await connection.execute('TRUNCATE TABLE teachings');
        await connection.execute('TRUNCATE TABLE degree_courses');
        await connection.execute('TRUNCATE TABLE departments');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        await connection.commit();
        console.log('MySQL academic tables truncated cleanly.');
      } catch (err) {
        await connection.rollback();
        console.error('Failed to truncate MySQL tables:', err);
      } finally {
        connection.release();
      }

      // Truncate PostgreSQL tables
      console.log('Clearing PostgreSQL tables for reseeding...');
      await queryPg('TRUNCATE TABLE tickets, exams, users CASCADE');
    }

    // Now check again to seed MySQL
    const checkDeptsRes = await queryMysql('SELECT COUNT(*) as count FROM departments') as any;
    const checkDepts = checkDeptsRes[0]?.count || 0;

    if (checkDepts === 0) {
      console.log('Seeding academic data in MySQL...');

      const UNISA_DEPARTMENTS = [
        'Dipartimento di Medicina e Chirurgia',
        'Dipartimento di Scienze Giuridiche',
        "Dipartimento di Ingegneria dell'Informazione ed Elettrica e Matematica Applicata"
      ];

      const UNISA_COURSES = [
        { name: 'Medicina e Chirurgia', cfu: 360 },
        { name: 'Giurisprudenza', cfu: 300 },
        { name: 'Ingegneria Informatica', cfu: 180 },
        { name: "Ingegneria dell'Informazione per la Medicina Digitale", cfu: 180 },
        { name: 'Electrical Engineering for digital energy', cfu: 120 }
      ];

      const DEPARTMENT_COURSES: Record<string, string[]> = {
        'Dipartimento di Medicina e Chirurgia': [
          'Medicina e Chirurgia'
        ],
        'Dipartimento di Scienze Giuridiche': [
          'Giurisprudenza'
        ],
        "Dipartimento di Ingegneria dell'Informazione ed Elettrica e Matematica Applicata": [
          'Ingegneria Informatica',
          "Ingegneria dell'Informazione per la Medicina Digitale",
          'Electrical Engineering for digital energy'
        ]
      };

      const DEGREE_TEACHINGS: Record<string, string[]> = {
        'Medicina e Chirurgia': [
          'Fisica', 'Chimica e Propedeutica Biochimica', 'Biologia', 'AFP 1 Anno - I', 
          'Attività Elettiva 1', 'Attività Elettiva 2', 'Attività Elettiva 3', 'Anatomia Umana I', 
          'Istologia ed Embriologia Umana', 'Scienze Umane e della Salute', 'AFP 1 Anno - II', 
          'Anatomia Umana II', 'AFP 2 Anno - III', 'Attività Elettiva 4', 'Attività Elettiva 5', 
          'Biochimica e Biologia Molecolare', 'Fisiologia Umana', 'Patologia Generale I', 
          'Immunologia e Microbiologia', 'AFP 2 Anno - IV', 'Patologia Generale II', 
          'Metodologia Clinica', 'Medicina di Laboratorio e Diagnostica Integrata', 
          'Attività Elettiva 6', 'Attività Elettiva 7', 'AFP 3 Anno - V', 
          'Farmacologia e Tossicologia Medica', 'Anatomia e Istologia Patologica I', 
          'Igiene Generale ed Applicata', 'Oncologia ed Ematologia', 'AFP 3 Anno - VI', 
          'Anatomia e Istologia Patologica II', 'Malattie del Sistema Endocrino e dell\'Apparato Digerente', 
          'Malattie Infettive e Microbiologia Clinica', 'Attività Elettiva 8', 'AFP 4 Anno - VII', 
          'Malattie dell\'Apparato Urinario', 'Immunologia Clinica e Allergologia-Reumatologia', 
          'Malattie dell\'Apparato Respiratorio-Cardiovascolare', 'AFP 4 Anno - VIII', 
          'Diagnostica per Immagini e Radioterapia', 'Sanità Pubblica-Medicina Legale e del Lavoro-Sociologia', 
          'Scienze Neurologiche e Psichiatriche', 'Attività Elettiva 9', 'Pediatria', 
          'Medicina Interna-Farmacologia', 'Malattie del Distretto Cervico-Facciale e degli Organi di Senso', 
          'Tirocinio Pratico-Valutativo Area Medica', 'Chirurgia Plastica-Malattie Cutanee e Veneree-Malattie dell\'Apparato Locomotore', 
          'Ginecologia e Ostetricia', 'Medicina Interna e Intelligenza Artificiale', 'Chirurgia Generale', 
          'AFP 6 Anno - IX', 'Attività Elettiva 10', 'Emergenze Mediche e Chirurgiche e Medicina del Territorio', 
          'AFP 6 Anno - X', 'Prova Finale', 'Tirocinio Pratico-Valutativo Area Chirurgica', 
          'Tirocinio Pratico-Valutativo Medicina Generale', 'Tirocinio Pratico-Valutativo Medicina Legale'
        ],
        'Giurisprudenza': [
          'Diritto Costituzionale', 'Filosofia del Diritto', 'Istituzioni di Diritto Privato', 
          'Storia del Diritto Medievale e Moderno', 'Esame a scelta 1 Anno', 'Esame Integrativo 1 Anno', 
          'Diritto Commerciale', 'Diritto dell\'Unione Europea', 'Diritto Ecclesiastico', 
          'Diritto Internazionale', 'Fondamenti del Diritto Europeo', 'Sistemi Giuridici Comparati', 
          'Esame Integrativo 2 Anno', 'Diritto Civile', 'Diritto del Lavoro', 'Diritto Penale', 
          'Storia del Diritto Moderno e Contemporaneo', 'Teoria del Diritto e dell\'Argomentazione', 
          'Prima Lingua Straniera', 'Esame Integrativo 3 Anno', 'Diritto Amministrativo', 
          'Diritto Processuale Civile', 'Procedura Penale', 'Esame a scelta 4 Anno I', 
          'Esame a scelta 4 Anno II', 'Laboratorio di Scrittura Giuridica 4 Anno', 
          'Esame Integrativo 4 Anno I', 'Esame Integrativo 4 Anno II', 'Esame Integrstivo 4 Anno II', 
          'Diritto Penale Parte Speciale', 'Diritto Processuale Amministrativo', 'Prova Finale', 
          'Esame a scelta 5 Anno', 'Laboratorio di Scrittura Giuridica 5 Anno', 'Esame Integrativo 5 Anno I', 
          'Tirocinio', 'Seconda Lingua Straniera', 'Esame Integrativo 5 Anno II'
        ],
        'Ingegneria Informatica': [
          'Analisi Matematica I', 'Fisica I', 'Fondamenti di Programmazione', 'Calcolatori Elettronici', 
          'Analisi Matematica II', 'Fisica II', 'Geometria-Algebra-Logica', 'Algoritmi e Strutture Dati', 
          'Analisi dei Segnali', 'Elettrotecnica', 'Circuiti e Sistemi Digitali', 'Idoneità di Inglese', 
          'Reti di Calcolatori', 'Sistemi Operativi', 'Ingegneria del Software', 'Controlli Automatici', 
          'Programmazione ad Oggetti', 'Insegnamento di Curriculum 1', 'Insegnamento di Curriculum 2', 
          'Basi di Dati', 'Esame a scelta 1', 'Esame a scelta 2', 'Tirocinio/Academy', 
          'Orientamento al Lavoro', 'Prova Finale'
        ],
        "Ingegneria dell'Informazione per la Medicina Digitale": [
          'Analisi Matematica I', 'Analisi Matematica II e Algebra Lineare', 'Fisica Generale', 
          'Chimica', 'Fondamenti di Programmazione', 'Elementi di Biochimica e Medicina di Laboratorio', 
          'Inglese', 'Fondamenti di Farmacologia, Clinica e Chirurgia', 'Algoritmi e Strutture Dati', 
          'Calcolatori Elettronici', 'Circuiti Biomedicali', 'Elaborazione di Segnali e Dati Biomedici', 
          'Dispositivi e Sensori Biomedicali', 'Reti di Calcolatori', 'Teoria dei Sistemi', 
          'Programmazione ad Oggetti', 'Sicurezza e Privacy dei Dati Clinici', 'Sistemi Informativi Sanitari', 
          'Tecnologie Informatiche per la Medicina Digitale', 'Programmazione Web e Mobile per E-Health', 
          'Orientamento al Lavoro', 'Tirocinio/Academy', 'Prova Finale', 'Esame a scelta 1', 
          'Esame a scelta 2'
        ],
        'Electrical Engineering for digital energy': [
          'Programming Techniques', 'Electric Circuits', 'Electric Power Systems', 
          'Renewable Sources and Power Converters', 'Electric Machines', 'Communication Networks', 
          'Cybersecurity', 'Professional Skills and Knowledge', 'Automation', 
          'Batteries and Energy Storage', 'Smart Grids and Energy Management', 
          'Data Science and Machine Learning', 'Final Examination', 'Esame a scelta 1', 
          'Esame a scelta 2'
        ]
      };

      const connection = await mysqlPool.getConnection();
      try {
        await connection.beginTransaction();

        for (const deptName of UNISA_DEPARTMENTS) {
          const [deptResult] = await connection.execute(
            'INSERT INTO departments (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
            [deptName]
          ) as any;
          const deptId = deptResult.insertId;

          const courses = DEPARTMENT_COURSES[deptName] || [];
          for (const courseName of courses) {
            const courseCfu = UNISA_COURSES.find(c => c.name === courseName)?.cfu || 180;
            const [courseResult] = await connection.execute(
              'INSERT INTO degree_courses (name, department_id, cfu) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
              [courseName, deptId, courseCfu]
            ) as any;
            const courseId = courseResult.insertId;

            const teachings = DEGREE_TEACHINGS[courseName] || [];

            for (const teachingName of teachings) {
              await connection.execute(
                'INSERT INTO teachings (name, degree_course_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=name',
                [teachingName, courseId]
              );
            }
          }
        }
        await connection.commit();
        console.log('Academic hierarchy seeded successfully in MySQL.');
      } catch (err) {
        await connection.rollback();
        console.error('Failed to seed MySQL academic hierarchy', err);
      } finally {
        connection.release();
      }
    }

    // 2. Seed PostgreSQL Users, Exams, and Tickets
    const userRes = await queryPg('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userRes.rows[0].count);

    if (userCount === 0) {
      console.log('Seeding demo users and properties in PostgreSQL...');

      const passHash = await bcrypt.hash('Password123!', 10);

      // Student demo
      await queryPg(`
        INSERT INTO users (id, name, surname, email, phone, role, matricola, department, degree_course, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        'student-demo',
        'Luca',
        'Rossi',
        'l.rossi@studenti.unisa.it',
        '+39 3331234567',
        'Studente',
        '0512106789',
        "Dipartimento di Ingegneria dell'Informazione ed Elettrica e Matematica Applicata",
        'Ingegneria Informatica',
        passHash
      ]);

      // Teacher demo
      await queryPg(`
        INSERT INTO users (id, name, surname, email, phone, role, department, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'teacher-demo',
        'Mario',
        'Bianchi',
        'm.bianchi@unisa.it',
        '+39 3449876543',
        'Docente',
        "Dipartimento di Ingegneria dell'Informazione ed Elettrica e Matematica Applicata",
        passHash
      ]);

      // PTA demo
      await queryPg(`
        INSERT INTO users (id, name, surname, email, phone, role, work_scope, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'pta-demo',
        'Anna',
        'Verdi',
        'a.verdi@unisa.it',
        '+39 3471112222',
        'PTA',
        'Supporto tecnico',
        passHash
      ]);

      // Seed student luca rossi exams
      await queryPg(`
        INSERT INTO exams (id, student_id, name, grade, date, lode, status, cfu) VALUES
        ('ex-1', 'student-demo', 'Analisi Matematica I', 26, '15/02/2025', false, 'Superato', 9),
        ('ex-2', 'student-demo', 'Fondamenti di Programmazione', 30, '22/02/2025', true, 'Superato', 9),
        ('ex-3', 'student-demo', 'Calcolatori Elettronici', 24, '10/06/2025', false, 'Superato', 9),
        ('ex-4', 'student-demo', 'Programmazione ad Oggetti', 28, '15/09/2025', false, 'Superato', 9),
        ('ex-5', 'student-demo', 'Basi di Dati', 0, '18/06/2026', false, 'Pianificato', 9),
        ('ex-6', 'student-demo', 'Ingegneria del Software', 0, '', false, 'Da sostenere', 9)
      `);

      // Seed tickets
      await queryPg(`
        INSERT INTO tickets (id, creator_id, title, description, category, status, priority, created_at) VALUES
        ('tk-1', 'student-demo', 'Problema tasse seconda rata', 'Non riesco a visualizzare il bollettino MAV per il pagamento della seconda rata delle tasse universitarie.', 'Tasse', 'Aperto', 'Media', '2026-06-04T10:15:00Z'),
        ('tk-2', 'student-demo', 'Richiesta credenziali CUS', 'Vorrei iscrivermi ai corsi di tennis del CUS ma non riesco ad accedere con la mail istituzionale.', 'CUS', 'In corso', 'Bassa', '2026-06-03T16:40:00Z')
      `);

      console.log('PostgreSQL seeded successfully.');
    }

    // 3. Sync MySQL relations
    const infoTeachings = await queryMysql(
      'SELECT t.id, t.name FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name = "Ingegneria Informatica"'
    ) as any[];

    // Enrolls student-demo
    const stCountRes = await queryMysql('SELECT COUNT(*) as count FROM student_teachings') as any;
    const stCount = stCountRes[0]?.count || 0;
    if (stCount === 0 && infoTeachings.length > 0) {
      console.log('Enrolling student-demo in teachings in MySQL...');
      for (const t of infoTeachings) {
        if (['Fondamenti di Programmazione', 'Programmazione ad Oggetti', 'Ingegneria del Software', 'Basi di Dati'].includes(t.name)) {
          await queryMysql(
            'INSERT INTO student_teachings (student_id, teaching_id) VALUES (?, ?)',
            ['student-demo', t.id]
          );
        }
      }
    }

    // Assign teachings to teacher-demo
    const assignedCountRes = await queryMysql('SELECT COUNT(*) as count FROM teachings WHERE teacher_id IS NOT NULL') as any;
    const assignedCount = assignedCountRes[0]?.count || 0;
    if (assignedCount === 0) {
      console.log('Assigning teachings to teacher-demo in MySQL...');
      const infoAllTeachings = await queryMysql(
        'SELECT t.id, t.name FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name IN ("Ingegneria Informatica")'
      ) as any[];

      for (const t of infoAllTeachings) {
        if (['Ingegneria del Software', 'Programmazione ad Oggetti', 'Basi di Dati'].includes(t.name)) {
          await queryMysql(
            'UPDATE teachings SET teacher_id = ? WHERE id = ?',
            ['teacher-demo', t.id]
          );
        }
      }
    }

    // Ensure booked_by column exists in reception_slots (migration)
    try {
      await queryMysql('ALTER TABLE reception_slots ADD COLUMN booked_by VARCHAR(50) NULL');
      console.log('Migration: Added booked_by column to reception_slots table.');
    } catch (colErr: any) {
      if (!colErr.message.includes('Duplicate column name')) {
        console.warn('Migration: Failed to ensure booked_by column in reception_slots', colErr.message);
      }
    }

    // Ensure day names are standardized to full day names (migration)
    try {
      await queryMysql("UPDATE reception_slots SET day = 'Lunedì' WHERE day = 'Lun'");
      await queryMysql("UPDATE reception_slots SET day = 'Martedì' WHERE day = 'Mar'");
      await queryMysql("UPDATE reception_slots SET day = 'Mercoledì' WHERE day = 'Mer'");
      await queryMysql("UPDATE reception_slots SET day = 'Giovedì' WHERE day = 'Gio'");
      await queryMysql("UPDATE reception_slots SET day = 'Venerdì' WHERE day = 'Ven'");
      console.log('Migration: Standardized day names in reception_slots.');
    } catch (dayErr: any) {
      console.warn('Migration: Failed to standardize day names', dayErr.message);
    }

    // Seed reception slots
    const slotsCountRes = await queryMysql('SELECT COUNT(*) as count FROM reception_slots') as any;
    const slotsCount = slotsCountRes[0]?.count || 0;
    if (slotsCount === 0) {
      console.log('Seeding teacher reception slots in MySQL...');
      const teacherMobileTeaching = await queryMysql(
        'SELECT id FROM teachings WHERE name = "Ingegneria del Software" LIMIT 1'
      ) as any[];
      const teachingId = teacherMobileTeaching[0]?.id;

      if (teachingId) {
        await queryMysql(`
          INSERT INTO reception_slots (teacher_id, teaching_id, day, time_slot, status, description, date, booked_by) VALUES
          (?, ?, 'Lunedì', '09:00 - 10:00', 'Libero', 'Ricevimento per chiarimenti sul progetto di Ingegneria del Software.', '15/06/2026', NULL),
          (?, ?, 'Martedì', '15:00 - 16:00', 'Prenotato', 'Revisione architettura app di Luca Rossi.', '16/06/2026', 'student-demo'),
          (?, ?, 'Mercoledì', '11:00 - 12:00', 'Non disponibile', 'Impegni di dipartimento.', '17/06/2026', NULL)
        `, [
          'teacher-demo', teachingId,
          'teacher-demo', teachingId,
          'teacher-demo', teachingId
        ]);
      }
    }

    console.log('Database verification checks finished.');
  } catch (err) {
    console.error('Seeding database failed:', err);
  }
}

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// Academic Hierarchy: Departments -> Degree Courses -> Teachings
app.get('/api/academic/hierarchy', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id as dept_id, d.name as dept_name,
        c.id as course_id, c.name as course_name, c.cfu as course_cfu,
        t.id as teaching_id, t.name as teaching_name, t.teacher_id
      FROM departments d
      LEFT JOIN degree_courses c ON c.department_id = d.id
      LEFT JOIN teachings t ON t.degree_course_id = c.id
      ORDER BY d.name, c.name, t.name;
    `;
    const results = await queryMysql(query) as any[];

    // Structure flat results into tree hierarchy
    const departmentsMap: Record<number, any> = {};

    results.forEach(row => {
      if (!row.dept_id) return;
      if (!departmentsMap[row.dept_id]) {
        departmentsMap[row.dept_id] = {
          id: row.dept_id,
          name: row.dept_name,
          courses: {}
        };
      }

      if (row.course_id) {
        if (!departmentsMap[row.dept_id].courses[row.course_id]) {
          departmentsMap[row.dept_id].courses[row.course_id] = {
            id: row.course_id,
            name: row.course_name,
            cfu: row.course_cfu,
            teachings: []
          };
        }

        if (row.teaching_id) {
          departmentsMap[row.dept_id].courses[row.course_id].teachings.push({
            id: row.teaching_id,
            name: row.teaching_name,
            teacher_id: row.teacher_id
          });
        }
      }
    });

    const hierarchy = Object.values(departmentsMap).map(dept => ({
      id: dept.id,
      name: dept.name,
      courses: Object.values(dept.courses)
    }));

    res.json(hierarchy);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Authentication: Register
app.post('/api/auth/register', async (req, res) => {
  const {
    id, name, surname, email, phone, role, password,
    matricola, department, degreeCourse, workScope, ptaDomain,
    selectedTeachings, // Array of teaching IDs (ints) or teaching names
    language
  } = req.body;

  try {
    // Check if email already exists
    const checkUser = await queryPg('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email già registrata.' });
    }

    const passHash = await bcrypt.hash(password, 10);
    const userId = id || `user-${Date.now()}`;
    const workScopeVal = workScope || ptaDomain || null;

    // Save in PostgreSQL
    await queryPg(`
      INSERT INTO users (id, name, surname, email, phone, role, matricola, department, degree_course, work_scope, password_hash, language, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      userId, name, surname, email, phone, role,
      matricola || null, department || null, degreeCourse || null, workScopeVal,
      passHash, language || 'IT', null
    ]);

    // Handle student/teacher associations in MySQL
    if (role === 'Docente' && Array.isArray(selectedTeachings)) {
      // Clear previous teaching ties
      await queryMysql('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = ?', [userId]);

      // Set teacher_id to current user for teachings
      for (const tIdentifier of selectedTeachings) {
        if (typeof tIdentifier === 'number' || /^\d+$/.test(tIdentifier.toString())) {
          await queryMysql('UPDATE teachings SET teacher_id = ? WHERE id = ?', [userId, tIdentifier]);
        } else {
          await queryMysql('UPDATE teachings SET teacher_id = ? WHERE name = ?', [userId, tIdentifier]);
        }
      }
    } else if (role === 'Studente' && Array.isArray(selectedTeachings)) {
      // Clear previous student enrollments
      await queryMysql('DELETE FROM student_teachings WHERE student_id = ?', [userId]);

      for (const tIdentifier of selectedTeachings) {
        let tId = tIdentifier;
        if (typeof tIdentifier === 'string' && !/^\d+$/.test(tIdentifier)) {
          const tRows = await queryMysql('SELECT id FROM teachings WHERE name = ? LIMIT 1', [tIdentifier]) as any[];
          tId = tRows[0]?.id;
        }
        if (tId) {
          await queryMysql('INSERT INTO student_teachings (student_id, teaching_id) VALUES (?, ?)', [userId, tId]);
        }
      }
    } else if (role === 'Studente' && degreeCourse) {
      // Default: Enroll student in all teachings of their selected course
      const teachings = await queryMysql(
        'SELECT t.id FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name = ?',
        [degreeCourse]
      ) as any[];

      for (const t of teachings) {
        await queryMysql('INSERT INTO student_teachings (student_id, teaching_id) VALUES (?, ?)', [userId, t.id]);
      }
    }

    // Return profile
    const registeredUser = {
      id: userId, name, surname, email, phone, role,
      matricola, department, degreeCourse, 
      workScope: workScopeVal,
      ptaDomain: workScopeVal,
      teachings: selectedTeachings || [],
      language: language || 'IT'
    };

    res.status(201).json(registeredUser);
  } catch (err: any) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Users (for syncing local state with database)
app.get('/api/users', async (req, res) => {
  try {
    const result = await queryPg('SELECT id, name, surname, email, phone, role, matricola, department, degree_course as "degreeCourse", work_scope as "workScope", language FROM users');
    const dbUsers = result.rows;

    // Load teachings/courses for each user from MySQL
    for (const u of dbUsers) {
      u.ptaDomain = u.workScope;
      let teachings: string[] = [];
      let teacherDegrees: string[] = [];

      if (u.role === 'Docente') {
        const tResults = await queryMysql(
          `SELECT t.name as teaching_name, c.name as course_name 
           FROM teachings t 
           JOIN degree_courses c ON t.degree_course_id = c.id 
           WHERE t.teacher_id = ?`,
          [u.id]
        ) as any[];

        teachings = tResults.map(r => r.teaching_name);
        teacherDegrees = Array.from(new Set(tResults.map(r => r.course_name)));
        u.teacherDegrees = teacherDegrees;
      } else if (u.role === 'Studente') {
        const tResults = await queryMysql(
          `SELECT t.name as teaching_name 
           FROM student_teachings st 
           JOIN teachings t ON st.teaching_id = t.id 
           WHERE st.student_id = ?`,
          [u.id]
        ) as any[];

        teachings = tResults.map(r => r.teaching_name);
      }
      u.teachings = teachings;
    }

    res.json(dbUsers);
  } catch (err: any) {
    console.error('Failed to get users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Authentication: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await queryPg('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide.' });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenziali non valide.' });
    }

    // Load associations from MySQL
    let teachings: string[] = [];
    let degreeCourses: string[] = [];

    if (user.role === 'Docente') {
      // Get teachings assigned to this teacher
      const tResults = await queryMysql(
        `SELECT t.name as teaching_name, c.name as course_name 
         FROM teachings t 
         JOIN degree_courses c ON t.degree_course_id = c.id 
         WHERE t.teacher_id = ?`,
        [user.id]
      ) as any[];

      teachings = tResults.map(r => r.teaching_name);
      // Unique courses
      degreeCourses = Array.from(new Set(tResults.map(r => r.course_name)));
    } else if (user.role === 'Studente') {
      // Get student teachings
      const tResults = await queryMysql(
        `SELECT t.name as teaching_name 
         FROM student_teachings st 
         JOIN teachings t ON st.teaching_id = t.id 
         WHERE st.student_id = ?`,
        [user.id]
      ) as any[];

      teachings = tResults.map(r => r.teaching_name);
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      matricola: user.matricola,
      department: user.department,
      degreeCourse: user.degree_course,
      workScope: user.work_scope,
      ptaDomain: user.work_scope,
      degreeCourses: user.role === 'Docente' ? degreeCourses : undefined,
      teachings: teachings,
      language: user.language || 'IT'
    };

    res.json(userProfile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
app.put('/api/profile', async (req, res) => {
  const {
    id, name, surname, phone, matricola, department, degreeCourse, workScope, ptaDomain,
    selectedTeachings, selectedCourses, language, password
  } = req.body;

  try {
    const workScopeVal = workScope || ptaDomain || null;
    
    let passHash = null;
    if (password) {
      passHash = await bcrypt.hash(password, 10);
    }

    if (passHash) {
      // Update user table including password hash in Postgres
      await queryPg(`
        UPDATE users 
        SET name = $1, surname = $2, phone = $3, matricola = $4, department = $5, degree_course = $6, work_scope = $7, language = $8, password_hash = $9, profile_picture = $10, updated_at = NOW()
        WHERE id = $11
      `, [name, surname, phone, matricola || null, department || null, degreeCourse || null, workScopeVal, language || 'IT', passHash, null, id]);
    } else {
      // Update user table in Postgres (no password change)
      await queryPg(`
        UPDATE users 
        SET name = $1, surname = $2, phone = $3, matricola = $4, department = $5, degree_course = $6, work_scope = $7, language = $8, profile_picture = $9, updated_at = NOW()
        WHERE id = $10
      `, [name, surname, phone, matricola || null, department || null, degreeCourse || null, workScopeVal, language || 'IT', null, id]);
    }

    // Handle teaching locks/updates in MySQL
    const userRoleResult = await queryPg('SELECT role FROM users WHERE id = $1', [id]);
    const role = userRoleResult.rows[0]?.role;

    if (role === 'Docente' && Array.isArray(selectedTeachings)) {
      // Reset teachings previously taught
      await queryMysql('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = ?', [id]);

      // Set new teachings
      for (const tName of selectedTeachings) {
        await queryMysql('UPDATE teachings SET teacher_id = ? WHERE name = ?', [id, tName]);
      }
    } else if (role === 'Studente' && degreeCourse) {
      // If student course changed, re-sync their default teachings
      const checkEnrolled = await queryMysql('SELECT COUNT(*) as count FROM student_teachings WHERE student_id = ?', [id]) as any;
      const count = checkEnrolled[0]?.count || 0;

      if (count === 0) {
        const teachings = await queryMysql(
          'SELECT t.id FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name = ?',
          [degreeCourse]
        ) as any[];

        for (const t of teachings) {
          await queryMysql('INSERT INTO student_teachings (student_id, teaching_id) VALUES (?, ?)', [id, t.id]);
        }
      }
    }

    res.json({ message: 'Profilo aggiornato con successo.' });
  } catch (err: any) {
    console.error('Update profile failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Exams Management
app.get('/api/exams', async (req, res) => {
  const { studentId } = req.query;
  try {
    const result = await queryPg('SELECT * FROM exams WHERE student_id = $1', [studentId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/exams/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await queryPg('DELETE FROM exams WHERE id = $1', [id]);
    res.json({ message: 'Esame eliminato con successo.' });
  } catch (err: any) {
    console.error('Delete exam failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exams', async (req, res) => {
  const { id, student_id, name, grade, date, lode, status, cfu } = req.body;
  try {
    // Check if student already has a pending, accepted, or superato exam for this teaching
    const checkExisting = await queryPg(
      `SELECT id, status FROM exams 
       WHERE student_id = $1 AND LOWER(TRIM(name)) = LOWER(TRIM($2)) AND status IN ('Da valutare', 'Accettato', 'Superato')`,
      [student_id, name]
    );

    if (checkExisting.rows.length > 0) {
      return res.status(400).json({ error: 'Lo studente ha già un esito in corso o registrato per questo insegnamento.' });
    }

    await queryPg(`
      INSERT INTO exams (id, student_id, name, grade, date, lode, status, cfu)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, student_id, name, grade, date, lode, status, cfu]);
    res.status(201).json({ id, name, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/exams/:id', async (req, res) => {
  const { id } = req.params;
  const { grade, date, lode, status } = req.body;
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let valIndex = 1;

    if (grade !== undefined) {
      updates.push(`grade = $${valIndex++}`);
      values.push(grade);
    }
    if (date !== undefined) {
      updates.push(`date = $${valIndex++}`);
      values.push(date);
    }
    if (lode !== undefined) {
      updates.push(`lode = $${valIndex++}`);
      values.push(lode);
    }
    if (status !== undefined) {
      updates.push(`status = $${valIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.json({ message: 'Nessun campo da aggiornare.' });
    }

    values.push(id);
    const query = `
      UPDATE exams 
      SET ${updates.join(', ')} 
      WHERE id = $${valIndex}
    `;

    await queryPg(query, values);
    res.json({ message: 'Esame aggiornato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Support Tickets Management
app.get('/api/tickets', async (req, res) => {
  const { creatorId, role, scope } = req.query;
  try {
    let result;
    if (role === 'PTA') {
      result = await queryPg(`
        SELECT t.*, u.name as creator_name, u.surname as creator_surname 
        FROM tickets t
        JOIN users u ON t.creator_id = u.id
        WHERE t.category = $1
        ORDER BY t.created_at DESC
      `, [scope || '']);
    } else {
      // Student only sees their own
      result = await queryPg(`
        SELECT t.*, u.name as creator_name, u.surname as creator_surname 
        FROM tickets t
        JOIN users u ON t.creator_id = u.id
        WHERE t.creator_id = $1
        ORDER BY t.created_at DESC
      `, [creatorId || '']);
    }
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  const { id, creator_id, title, description, category, status, priority, created_at } = req.body;
  try {
    await queryPg(`
      INSERT INTO tickets (id, creator_id, title, description, category, status, priority, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, creator_id, title, description, category, status, priority, created_at]);
    res.status(201).json({ id, title, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await queryPg('UPDATE tickets SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Ticket aggiornato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications Management
app.get('/api/notifications', async (req, res) => {
  const { role, userId } = req.query;
  try {
    let studentDegreeCourse: string | null = null;
    if (role === 'Studente' && userId) {
      const studentRes = await queryPg('SELECT degree_course FROM users WHERE id = $1', [userId]);
      if (studentRes.rows.length > 0) {
        studentDegreeCourse = studentRes.rows[0].degree_course;
      }
    }

    const result = await queryPg(`
      SELECT n.*, u.role as sender_role
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.target = 'Tutti' OR n.target = $1 OR n.target = $2 OR n.sender_id = $2 
      ORDER BY n.created_at DESC
    `, [role || '', userId || '']);

    let filteredRows = result.rows;
    if (role === 'Studente' && studentDegreeCourse) {
      const teacherIds = Array.from(new Set(
        filteredRows
          .filter(row => row.sender_role === 'Docente' && row.sender_id)
          .map(row => row.sender_id)
      ));
      
      if (teacherIds.length > 0) {
        const placeholders = teacherIds.map(() => '?').join(',');
        const mysqlQuery = `
          SELECT t.teacher_id, dc.name as degree_course_name 
          FROM teachings t 
          JOIN degree_courses dc ON t.degree_course_id = dc.id 
          WHERE t.teacher_id IN (${placeholders})
        `;
        const teachingsList = await queryMysql(mysqlQuery, teacherIds) as any[];
        
        const teacherCoursesMap = new Map<string, Set<string>>();
        for (const row of teachingsList) {
          if (!teacherCoursesMap.has(row.teacher_id)) {
            teacherCoursesMap.set(row.teacher_id, new Set<string>());
          }
          teacherCoursesMap.get(row.teacher_id)!.add(row.degree_course_name);
        }
        
        filteredRows = filteredRows.filter(row => {
          if (row.target === userId) {
            return true;
          }
          if (row.sender_role === 'Docente' && row.sender_id) {
            const teacherCourses = teacherCoursesMap.get(row.sender_id);
            if (teacherCourses && studentDegreeCourse && teacherCourses.has(studentDegreeCourse)) {
              return true;
            }
            return false;
          }
          return true;
        });
      }
    }

    res.json(filteredRows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  const { id, title, body, target, date, senderId } = req.body;
  try {
    await queryPg(`
      INSERT INTO notifications (id, title, body, target, date, sender_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, title, body, target, date, senderId || null]);
    res.status(201).json({ id, title, target });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher Reception Slots (MySQL)
app.get('/api/slots', async (req, res) => {
  try {
    // Fetch slots, teaching names and degree course names from MySQL
    const results = await queryMysql(`
      SELECT 
        rs.*, t.name as teaching_name, dc.name as degree_course_name
      FROM reception_slots rs
      JOIN teachings t ON rs.teaching_id = t.id
      JOIN degree_courses dc ON t.degree_course_id = dc.id
    `) as any[];

    // Extract unique user IDs (teachers + booked student IDs)
    const teacherIds = results.map(row => row.teacher_id).filter(Boolean);
    const studentIds = results.map(row => row.booked_by).filter(Boolean);
    const allUserIds = [...new Set([...teacherIds, ...studentIds])];

    // Fetch user details from PostgreSQL in one go
    let usersMap: Record<string, { name: string; surname: string; degree_course?: string }> = {};
    if (allUserIds.length > 0) {
      const placeholders = allUserIds.map((_, i) => `$${i + 1}`).join(',');
      const usersResult = await queryPg(`
        SELECT id, name, surname, degree_course FROM users WHERE id IN (${placeholders})
      `, allUserIds);
      usersResult.rows.forEach(u => {
        usersMap[u.id] = { name: u.name, surname: u.surname, degree_course: u.degree_course };
      });
    }

    // Map MySQL snake_case fields back to React Native camelCase expectations and merge teacher/student names
    const mapped = results.map(row => {
      const teacher = usersMap[row.teacher_id] || { name: 'Docente', surname: 'Sconosciuto' };
      const student = row.booked_by ? usersMap[row.booked_by] : null;
      const bookedByStr = student ? `${student.name} ${student.surname} (${student.degree_course || 'Studente'})` : undefined;

      return {
        id: row.id.toString(),
        teacherId: row.teacher_id,
        teaching: row.teaching_name,
        day: row.day,
        time: row.time_slot,
        status: row.status,
        desc: row.description || '',
        date: row.date,
        teacherName: `${teacher.name} ${teacher.surname}`,
        bookedBy: bookedByStr,
        bookedByStudentId: row.booked_by || undefined,
        degreeCourse: row.degree_course_name
      };
    });

    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/slots', async (req, res) => {
  const { teacherId, teachingName, day, timeSlot, time, status, description, desc, date } = req.body;

  try {
    // Find teaching ID by name
    const teachingRow = await queryMysql('SELECT id FROM teachings WHERE name = ? LIMIT 1', [teachingName]) as any[];
    const teachingId = teachingRow[0]?.id;

    if (!teachingId) {
      return res.status(400).json({ error: 'Insegnamento non valido.' });
    }

    const tSlot = timeSlot || time;
    const dScript = description || desc;

    const insertRes = await queryMysql(`
      INSERT INTO reception_slots (teacher_id, teaching_id, day, time_slot, status, description, date, booked_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `, [teacherId, teachingId, day, tSlot, status, dScript || null, date || null]) as any;

    res.status(201).json({ id: insertRes.insertId.toString(), teachingName, status });
  } catch (err: any) {
    console.error('Failed to create slot:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/slots/:id', async (req, res) => {
  const { id } = req.params;
  const { status, description, desc, bookedByStudentId } = req.body;

  try {
    const dScript = description || desc;
    await queryMysql(
      'UPDATE reception_slots SET status = ?, description = ?, booked_by = ? WHERE id = ?',
      [status, dScript || null, bookedByStudentId || null, id]
    );
    res.json({ message: 'Slot aggiornato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account support
app.delete('/api/profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await queryPg('DELETE FROM users WHERE id = $1', [id]);
    await queryMysql('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = ?', [id]);
    await queryMysql('DELETE FROM student_teachings WHERE student_id = ?', [id]);
    res.json({ message: 'Profilo eliminato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reception slot
app.delete('/api/slots/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await queryMysql('DELETE FROM reception_slots WHERE id = ?', [id]);
    res.json({ message: 'Slot eliminato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Run Seeding
app.listen(PORT, async () => {
  console.log(`UnisAllRound backend running on http://localhost:${PORT}`);
  
  // Wait a few seconds for DBs to settle, then run seeder
  setTimeout(seedDatabase, 3000);
});
