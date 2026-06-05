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

// Seeder function to populate PostgreSQL and MySQL
async function seedDatabase() {
  console.log('Checking database seeding...');

  try {
    // 1. Seed MySQL Academic Data
    const deptsCountRes = await queryMysql('SELECT COUNT(*) as count FROM departments') as any;
    const deptsCount = deptsCountRes[0]?.count || 0;

    if (deptsCount === 0) {
      console.log('Seeding academic data in MySQL...');

      const UNISA_DEPARTMENTS = [
        'Dipartimento di Chimica e Biologia "Adolfo Zambelli"',
        'Dipartimento di Farmacia',
        'Dipartimento di Fisica "E.R. Caianiello"',
        'Dipartimento di Informatica',
        'Dipartimento di Ingegneria Civile',
        'Dipartimento di Ingegneria dell\'Informazione ed Elettrica e Matematica Applicata',
        'Dipartimento di Ingegneria Industriale',
        'Dipartimento di Matematica',
        'Dipartimento di Medicina, Chirurgia e Odontoiatria "Scuola Medica Salernitana"',
        'Dipartimento di Scienze Aziendali - Management & Innovation Systems',
        'Dipartimento di Scienze Economiche e Statistiche',
        'Dipartimento di Scienze del Patrimonio Culturale',
        'Dipartimento di Scienze Politiche e della Comunicazione',
        'Dipartimento di Scienze Umane, Filosofiche e della Formazione',
        'Dipartimento di Studi Umanistici',
        'Dipartimento di Studi Politici e Sociali',
        'Dipartimento di Scienze Giuridiche (Scuola di Giurisprudenza)'
      ];

      const UNISA_COURSES = [
        { name: 'Medicina e Chirurgia', cfu: 360 },
        { name: 'Odontoiatria e Protesi Dentaria', cfu: 360 },
        { name: 'Giurisprudenza', cfu: 300 },
        { name: 'Farmacia', cfu: 300 },
        { name: 'Chimica e Tecnologia Farmaceutiche (CTF)', cfu: 300 },
        { name: 'Ingegneria Edile-Architettura', cfu: 300 },
        { name: 'Scienze della Formazione Primaria', cfu: 300 },
        { name: 'Informatica', cfu: 180 },
        { name: 'Fisica', cfu: 180 },
        { name: 'Matematica', cfu: 180 },
        { name: 'Chimica', cfu: 180 },
        { name: 'Scienze Biologiche', cfu: 180 },
        { name: 'Scienze Ambientali', cfu: 180 },
        { name: 'Ingegneria Informatica', cfu: 180 },
        { name: 'Ingegneria Gestionale', cfu: 180 },
        { name: 'Ingegneria Elettronica', cfu: 180 },
        { name: 'Ingegneria Meccanica', cfu: 180 },
        { name: 'Ingegneria Chimica', cfu: 180 },
        { name: 'Ingegneria Civile', cfu: 180 },
        { name: 'Ingegneria Civile per l\'Ambiente e il Territorio', cfu: 180 },
        { name: 'Economia e Commercio', cfu: 180 },
        { name: 'Economia e Management', cfu: 180 },
        { name: 'Scienze Politiche e delle Relazioni Internazionali', cfu: 180 },
        { name: 'Scienze della Comunicazione', cfu: 180 },
        { name: 'Sociologia', cfu: 180 },
        { name: 'Beni Culturali', cfu: 180 },
        { name: 'Lettere', cfu: 180 },
        { name: 'Lingue e Culture Straniere', cfu: 180 },
        { name: 'Filosofia', cfu: 180 },
        { name: 'Scienze dell\'Educazione', cfu: 180 },
        { name: 'Scienze delle Attività Motorie, Sportive e della Salute', cfu: 180 },
        { name: 'Scienze Erboristiche', cfu: 180 },
        { name: 'Statistica per l\'Azienda e la Finanza', cfu: 180 },
        { name: 'Agraria', cfu: 180 },
        { name: 'Viticoltura ed Enologia', cfu: 180 },
        { name: 'Infermieristica', cfu: 180 },
        { name: 'Ostetricia', cfu: 180 },
        { name: 'Fisioterapia', cfu: 180 },
        { name: 'Logopedia', cfu: 180 },
        { name: 'Tecniche di Radiologia Medica', cfu: 180 },
        { name: 'Informatica (Laurea Magistrale)', cfu: 120 },
        { name: 'Fisica (Laurea Magistrale)', cfu: 120 },
        { name: 'Matematica (Laurea Magistrale)', cfu: 120 },
        { name: 'Chimica (Laurea Magistrale)', cfu: 120 },
        { name: 'Biologia (Laurea Magistrale)', cfu: 120 },
        { name: 'Scienze Ambientali (Laurea Magistrale)', cfu: 120 },
        { name: 'Ingegneria Informatica (Laurea Magistrale)', cfu: 120 },
        { name: 'Ingegneria Gestionale (Laurea Magistrale)', cfu: 120 },
        { name: 'Ingegneria Elettronica (Laurea Magistrale)', cfu: 120 },
        { name: 'Ingegneria Meccanica (Laurea Magistrale)', cfu: 120 },
        { name: 'Ingegneria Chimica (Laurea Magistrale)', cfu: 120 },
        { name: 'Ingegneria Civile (Laurea Magistrale)', cfu: 120 },
        { name: 'Ingegneria per l\'Ambiente e il Territorio (Laurea Magistrale)', cfu: 120 },
        { name: 'Consulenza e Gestione Aziendale (Laurea Magistrale)', cfu: 120 },
        { name: 'Economia e Politiche Pubbliche (Laurea Magistrale)', cfu: 120 },
        { name: 'Scienze delle Pubbliche Amministrazioni (Laurea Magistrale)', cfu: 120 },
        { name: 'Corporate Communication e Media (Laurea Magistrale)', cfu: 120 },
        { name: 'Sociologia e Politiche Sociali (Laurea Magistrale)', cfu: 120 },
        { name: 'Gestione e Conservazione del Patrimonio Culturale (Laurea Magistrale)', cfu: 120 },
        { name: 'Filologia, Letterature e Storia (Laurea Magistrale)', cfu: 120 },
        { name: 'Lingue e Letterature Moderne (Laurea Magistrale)', cfu: 120 },
        { name: 'Filosofia e Studi Storici (Laurea Magistrale)', cfu: 120 },
        { name: 'Scienze Pedagogiche (Laurea Magistrale)', cfu: 120 },
        { name: 'Scienze e Tecniche delle Attività Motorie (Laurea Magistrale)', cfu: 120 },
        { name: 'Scienze e Tecniche Psicologiche', cfu: 180 },
        { name: 'Psicologia (Laurea Magistrale)', cfu: 120 },
        { name: 'Discipline delle Arti, della Musica e dello Spettacolo (DAMS)', cfu: 180 },
        { name: 'Scienze dell\'Amministrazione e dell\'Organizzazione', cfu: 180 },
        { name: 'Servizio Sociale', cfu: 180 },
        { name: 'Biotecnologie', cfu: 180 },
        { name: 'Scienze Geologiche', cfu: 180 },
        { name: 'Ingegneria Meccatronica (Laurea Magistrale)', cfu: 120 },
        { name: 'Ingegneria Alimentare (Laurea Triennale)', cfu: 180 },
        { name: 'Ingegneria Alimentare (Laurea Magistrale)', cfu: 120 },
        { name: 'Finanza e Mercati (Laurea Magistrale)', cfu: 120 },
        { name: 'Tecniche di Laboratorio Biomedico', cfu: 180 },
        { name: 'Tecniche della Prevenzione nell\'Ambiente e nei Luoghi di Lavoro', cfu: 180 },
        { name: 'Educazione Professionale', cfu: 180 }
      ];

      const DEPARTMENT_COURSES: Record<string, string[]> = {
        'Dipartimento di Chimica e Biologia "Adolfo Zambelli"': [
          'Chimica', 'Scienze Biologiche', 'Biotecnologie', 'Chimica (Laurea Magistrale)', 'Biologia (Laurea Magistrale)'
        ],
        'Dipartimento di Farmacia': [
          'Farmacia', 'Chimica e Tecnologia Farmaceutiche (CTF)', 'Scienze Erboristiche'
        ],
        'Dipartimento di Fisica "E.R. Caianiello"': [
          'Fisica', 'Fisica (Laurea Magistrale)'
        ],
        'Dipartimento di Informatica': [
          'Informatica', 'Informatica (Laurea Magistrale)'
        ],
        'Dipartimento di Ingegneria Civile': [
          'Ingegneria Civile', 'Ingegneria Civile per l\'Ambiente e il Territorio', 
          'Ingegneria Civile (Laurea Magistrale)', 'Ingegneria per l\'Ambiente e il Territorio (Laurea Magistrale)'
        ],
        'Dipartimento di Ingegneria dell\'Informazione ed Elettrica e Matematica Applicata': [
          'Ingegneria Informatica', 'Ingegneria Elettronica', 'Ingegneria Informatica (Laurea Magistrale)', 
          'Ingegneria Elettronica (Laurea Magistrale)', 'Ingegneria Meccatronica (Laurea Magistrale)'
        ],
        'Dipartimento di Ingegneria Industriale': [
          'Ingegneria Gestionale', 'Ingegneria Meccanica', 'Ingegneria Chimica', 'Ingegneria Edile-Architettura',
          'Ingegneria Alimentare (Laurea Triennale)', 'Ingegneria Alimentare (Laurea Magistrale)', 
          'Ingegneria Gestionale (Laurea Magistrale)', 'Ingegneria Meccanica (Laurea Magistrale)', 'Ingegneria Chimica (Laurea Magistrale)'
        ],
        'Dipartimento di Matematica': [
          'Matematica', 'Matematica (Laurea Magistrale)'
        ],
        'Dipartimento di Medicina, Chirurgia e Odontoiatria "Scuola Medica Salernitana"': [
          'Medicina e Chirurgia', 'Odontoiatria e Protesi Dentaria', 'Infermieristica', 'Ostetricia', 
          'Fisioterapia', 'Logopedia', 'Tecniche di Radiologia Medica', 'Tecniche di Laboratorio Biomedico', 
          'Tecniche della Prevenzione nell\'Ambiente e nei Luoghi di Lavoro', 'Educazione Professionale', 
          'Scienze e Tecniche Psicologiche', 'Psicologia (Laurea Magistrale)'
        ],
        'Dipartimento di Scienze Aziendali - Management & Innovation Systems': [
          'Economia e Management', 'Consulenza e Gestione Aziendale (Laurea Magistrale)'
        ],
        'Dipartimento di Scienze Economiche e Statistiche': [
          'Economia e Commercio', 'Statistica per l\'Azienda e la Finanza', 
          'Economia e Politiche Pubbliche (Laurea Magistrale)', 'Finanza e Mercati (Laurea Magistrale)'
        ],
        'Dipartimento di Scienze del Patrimonio Culturale': [
          'Beni Culturali', 'Gestione e Conservazione del Patrimonio Culturale (Laurea Magistrale)'
        ],
        'Dipartimento di Scienze Politiche e della Comunicazione': [
          'Scienze della Comunicazione', 'Scienze Politiche e delle Relazioni Internazionali', 
          'Corporate Communication e Media (Laurea Magistrale)'
        ],
        'Dipartimento di Scienze Umane, Filosofiche e della Formazione': [
          'Scienze della Formazione Primaria', 'Scienze dell\'Educazione', 'Scienze Pedagogiche (Laurea Magistrale)'
        ],
        'Dipartimento di Studi Umanistici': [
          'Lettere', 'Filosofia', 'Lingue e Culture Straniere', 
          'Filologia, Letterature e Storia (Laurea Magistrale)', 'Lingue e Letterature Moderne (Laurea Magistrale)', 
          'Filosofia e Studi Storici (Laurea Magistrale)', 'Discipline delle Arti, della Musica e dello Spettacolo (DAMS)'
        ],
        'Dipartimento di Studi Politici e Sociali': [
          'Sociologia', 'Scienze dell\'Amministrazione e dell\'Organizzazione', 'Servizio Sociale', 
          'Sociologia e Politiche Sociali (Laurea Magistrale)', 'Scienze delle Pubbliche Amministrazioni (Laurea Magistrale)'
        ],
        'Dipartimento di Scienze Giuridiche (Scuola di Giurisprudenza)': [
          'Giurisprudenza'
        ]
      };

      const DEGREE_TEACHINGS: Record<string, string[]> = {
        'Informatica': [
          'Programmazione I', 'Programmazione II', 'Programmazione Mobile', 
          'Basi di Dati', 'Ingegneria del Software', 'Architettura degli Elaboratori', 
          'Algoritmi e Strutture Dati', 'Reti di Calcolatori', 'Intelligenza Artificiale'
        ],
        'Informatica (Laurea Magistrale)': [
          'Advanced Mobile Programming', 'Cloud Computing', 'Machine Learning', 
          'Cybersecurity', 'Software Architecture', 'Data Science', 'Virtual Reality'
        ],
        'Ingegneria Informatica': [
          'Fondamenti di Informatica', 'Sistemi Operativi', 'Automazione', 
          'Calcolatori Elettronici', 'Elettronica Analogica e Digitale', 'Misure Elettroniche'
        ],
        'Ingegneria Informatica (Laurea Magistrale)': [
          'High Performance Computing', 'Distributed Systems', 'Internet of Things',
          'Robotics', 'Digital Image Processing', 'Network Security'
        ],
        'Medicina e Chirurgia': [
          'Anatomia Umana', 'Fisiologia Umana', 'Patologia Generale', 
          'Cardiologia', 'Pediatria', 'Chirurgia Generale', 'Biochimica Clinica'
        ],
        'Giurisprudenza': [
          'Diritto Privato', 'Diritto Costituzionale', 'Diritto Penale', 
          'Diritto Commerciale', 'Diritto Amministrativo', 'Diritto Internazionale'
        ],
        'Economia e Management': [
          'Microeconomia', 'Macroeconomia', 'Economia Aziendale', 
          'Marketing', 'Statistica', 'Finanza Aziendale', 'Diritto Commerciale'
        ],
        'Fisica': [
          'Fisica Generale I', 'Fisica Generale II', 'Meccanica Razionale', 
          'Fisica Quantistica', 'Struttura della Materia', 'Astrodinamica'
        ],
        'Matematica': [
          'Analisi Matematica I', 'Analisi Matematica II', 'Algebra', 
          'Geometria', 'Calcolo delle Probabilità', 'Fisica Matematica'
        ],
        'Scienze e Tecniche Psicologiche': [
          'Psicologia Generale', 'Psicologia dello Sviluppo', 'Psicologia Sociale',
          'Metodologia della Ricerca Psicologica', 'Neuroscienze Cognitive'
        ],
        'Psicologia (Laurea Magistrale)': [
          'Psicopatologia Clinica', 'Tecniche di Colloquio Psicologico', 'Psicologia del Lavoro',
          'Neuropsicologia Applicata', 'Psicoterapia Cognitiva'
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

            const teachings = DEGREE_TEACHINGS[courseName] || [
              `Fondamenti di ${courseName}`,
              `Laboratorio di ${courseName}`,
              `Corso Avanzato di ${courseName}`,
              `Seminario Specialistico di ${courseName}`
            ];

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
        'Dipartimento di Informatica',
        'Informatica',
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
        'Dipartimento di Informatica',
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
        ('ex-2', 'student-demo', 'Programmazione I', 30, '22/02/2025', true, 'Superato', 9),
        ('ex-3', 'student-demo', 'Architettura degli Elaboratori', 24, '10/06/2025', false, 'Superato', 6),
        ('ex-4', 'student-demo', 'Programmazione II', 28, '15/09/2025', false, 'Superato', 9),
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
      'SELECT t.id, t.name FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name = "Informatica"'
    ) as any[];

    // Enrolls student-demo
    const stCountRes = await queryMysql('SELECT COUNT(*) as count FROM student_teachings') as any;
    const stCount = stCountRes[0]?.count || 0;
    if (stCount === 0 && infoTeachings.length > 0) {
      console.log('Enrolling student-demo in teachings in MySQL...');
      for (const t of infoTeachings) {
        if (['Programmazione I', 'Programmazione II', 'Programmazione Mobile', 'Basi di Dati'].includes(t.name)) {
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
        'SELECT t.id, t.name FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name IN ("Informatica", "Informatica (Laurea Magistrale)")'
      ) as any[];

      for (const t of infoAllTeachings) {
        if (['Programmazione Mobile', 'Ingegneria del Software', 'Advanced Mobile Programming', 'Cloud Computing', 'Cybersecurity'].includes(t.name)) {
          await queryMysql(
            'UPDATE teachings SET teacher_id = ? WHERE id = ?',
            ['teacher-demo', t.id]
          );
        }
      }
    }

    // Seed reception slots
    const slotsCountRes = await queryMysql('SELECT COUNT(*) as count FROM reception_slots') as any;
    const slotsCount = slotsCountRes[0]?.count || 0;
    if (slotsCount === 0) {
      console.log('Seeding teacher reception slots in MySQL...');
      const teacherMobileTeaching = await queryMysql(
        'SELECT id FROM teachings WHERE name = "Programmazione Mobile" LIMIT 1'
      ) as any[];
      const teachingId = teacherMobileTeaching[0]?.id;

      if (teachingId) {
        await queryMysql(`
          INSERT INTO reception_slots (teacher_id, teaching_id, day, time_slot, status, description, date) VALUES
          (?, ?, 'Lun', '09:00 - 10:00', 'Libero', 'Ricevimento per chiarimenti sul progetto di Programmazione Mobile.', '15/06/2026'),
          (?, ?, 'Mar', '15:00 - 16:00', 'Prenotato', 'Revisione architettura app di Luca Rossi.', '16/06/2026'),
          (?, ?, 'Mer', '11:00 - 12:00', 'Non disponibile', 'Impegni di dipartimento.', '17/06/2026')
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
    matricola, department, degreeCourse, workScope,
    selectedTeachings // Array of teaching IDs (ints) or teaching names
  } = req.body;

  try {
    // Check if email already exists
    const checkUser = await queryPg('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email già registrata.' });
    }

    const passHash = await bcrypt.hash(password, 10);
    const userId = id || `user-${Date.now()}`;

    // Save in PostgreSQL
    await queryPg(`
      INSERT INTO users (id, name, surname, email, phone, role, matricola, department, degree_course, work_scope, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      userId, name, surname, email, phone, role,
      matricola || null, department || null, degreeCourse || null, workScope || null,
      passHash
    ]);

    // Handle student/teacher associations in MySQL
    if (role === 'Docente' && Array.isArray(selectedTeachings)) {
      // Clear previous teaching ties
      await queryMysql('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = ?', [userId]);

      // Set teacher_id to current user for teachings
      for (const tId of selectedTeachings) {
        await queryMysql('UPDATE teachings SET teacher_id = ? WHERE id = ?', [userId, tId]);
      }
    } else if (role === 'Studente' && Array.isArray(selectedTeachings)) {
      // Clear previous student enrollments
      await queryMysql('DELETE FROM student_teachings WHERE student_id = ?', [userId]);

      for (const tId of selectedTeachings) {
        await queryMysql('INSERT INTO student_teachings (student_id, teaching_id) VALUES (?, ?)', [userId, tId]);
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
      matricola, department, degreeCourse, workScope,
      teachings: selectedTeachings || []
    };

    res.status(201).json(registeredUser);
  } catch (err: any) {
    console.error('Registration failed:', err);
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
      degreeCourses: user.role === 'Docente' ? degreeCourses : undefined,
      teachings: teachings
    };

    res.json(userProfile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
app.put('/api/profile', async (req, res) => {
  const {
    id, name, surname, phone, matricola, department, degreeCourse, workScope,
    selectedTeachings, selectedCourses
  } = req.body;

  try {
    // Update user table in Postgres
    await queryPg(`
      UPDATE users 
      SET name = $1, surname = $2, phone = $3, matricola = $4, department = $5, degree_course = $6, work_scope = $7, updated_at = NOW()
      WHERE id = $8
    `, [name, surname, phone, matricola || null, department || null, degreeCourse || null, workScope || null, id]);

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

app.post('/api/exams', async (req, res) => {
  const { id, student_id, name, grade, date, lode, status, cfu } = req.body;
  try {
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
    await queryPg(`
      UPDATE exams 
      SET grade = $1, date = $2, lode = $3, status = $4
      WHERE id = $5
    `, [grade, date, lode, status, id]);
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
      // Filter by PTA work scope
      let categoryMatch = '%';
      if (scope === 'Segreteria') categoryMatch = 'Segreteria';
      else if (scope === 'Tasse') categoryMatch = 'Tasse';
      else if (scope === 'CUS') categoryMatch = 'CUS';
      else if (scope === 'Supporto tecnico') categoryMatch = 'Supporto tecnico';

      result = await queryPg(`
        SELECT t.*, u.name as creator_name, u.surname as creator_surname 
        FROM tickets t
        JOIN users u ON t.creator_id = u.id
        WHERE t.category LIKE $1
      `, [categoryMatch]);
    } else {
      // Student only sees their own
      result = await queryPg('SELECT * FROM tickets WHERE creator_id = $1', [creatorId]);
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

// Teacher Reception Slots (MySQL)
app.get('/api/slots', async (req, res) => {
  try {
    // Join with teachings and degree courses
    const results = await queryMysql(`
      SELECT 
        rs.*, t.name as teaching_name, u.name as teacher_name, u.surname as teacher_surname 
      FROM reception_slots rs
      JOIN teachings t ON rs.teaching_id = t.id
      JOIN users u ON rs.teacher_id = u.id
    `) as any[];

    // Map MySQL snake_case fields back to React Native camelCase expectations
    const mapped = results.map(row => ({
      id: row.id.toString(),
      teacherId: row.teacher_id,
      teaching: row.teaching_name,
      day: row.day,
      time: row.time_slot,
      status: row.status,
      desc: row.description || '',
      date: row.date,
      teacherName: `${row.teacher_name} ${row.teacher_surname}`,
      bookedBy: row.status === 'Prenotato' ? 'Studente' : undefined
    }));

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

    const [insertRes] = await queryMysql(`
      INSERT INTO reception_slots (teacher_id, teaching_id, day, time_slot, status, description, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [teacherId, teachingId, day, tSlot, status, dScript || null, date || null]) as any;

    res.status(201).json({ id: insertRes.insertId.toString(), teachingName, status });
  } catch (err: any) {
    console.error('Failed to create slot:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/slots/:id', async (req, res) => {
  const { id } = req.params;
  const { status, description, desc } = req.body;

  try {
    const dScript = description || desc;
    await queryMysql(
      'UPDATE reception_slots SET status = ?, description = ? WHERE id = ?',
      [status, dScript || null, id]
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
