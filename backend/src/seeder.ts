import bcrypt from 'bcryptjs';
import { queryPg } from './db_pg';
import { queryMysql, mysqlPool } from './db_mysql';

// Seeder function to populate PostgreSQL and MySQL
export async function seedDatabase() {
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

    // Add assigned_to column to tickets table if it doesn't exist
    await queryPg(`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('PostgreSQL schema migration completed: language, profile_picture columns, notifications table and tickets assigned_to column verified.');
  } catch (err) {
    console.error('Failed to run schema migration on PostgreSQL:', err);
  }
  try {
    // 1. Check and seed MySQL academic hierarchy if empty
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

    console.log('Database verification checks finished.');
  } catch (err) {
    console.error('Seeding database failed:', err);
  }
}
