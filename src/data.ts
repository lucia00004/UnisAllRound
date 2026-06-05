import type { CampusPoint, Exam, Lesson, NewsItem, NotificationItem, Role, Ticket, UserProfile } from './types';

export const demoUsers: UserProfile[] = [
  {
    id: 'student-demo',
    name: 'Lucia',
    surname: 'Canzolino',
    email: 'lucia.canzolino@studenti.unisa.it',
    password: 'demo',
    role: 'Studente',
    department: 'Informatica',
    degreeCourse: 'Informatica',
    matricola: '0512106789',
    phone: '+39 333 100 2000',
    language: 'IT',
  },
  {
    id: 'teacher-demo',
    name: 'Mario',
    surname: 'Cucciniello',
    email: 'm.cucciniello@unisa.it',
    password: 'demo',
    role: 'Docente',
    department: 'Ingegneria dell’Informazione',
    phone: '+39 089 960000',
    language: 'IT',
  },
  {
    id: 'pta-demo',
    name: 'Andrea',
    surname: 'Purcaro',
    email: 'a.purcaro@unisa.it',
    password: 'demo',
    role: 'PTA',
    department: 'Supporto tecnico campus',
    phone: '+39 089 961111',
    language: 'IT',
    shifts: ['08:00 - 14:00', '08:00 - 14:00', '14:00 - 20:00', '08:00 - 14:00', ''],
    ptaDomain: 'Tecnico di Laboratiorio (IT)',
  },
];

export const roleCopy: Record<Role, { title: string; subtitle: string; accent: string }> = {
  Studente: {
    title: 'Carriera, didattica e servizi rapidi',
    subtitle: 'Medie, CFU, lezioni, esiti, ricevimenti e risorse per vivere il campus senza saltare tra mille app.',
    accent: '#137C8B',
  },
  Docente: {
    title: 'Corsi, comunicazioni e pubblicazioni',
    subtitle: 'Gestione di lezioni, esiti, avvisi agli studenti e ricevimento in un unico pannello.',
    accent: '#E27E07',
  },
  PTA: {
    title: 'Turni, interventi e ticket',
    subtitle: 'Orario di lavoro, richieste di supporto e presa in carico degli interventi del campus.',
    accent: '#D96C4A',
  },
};

export const initialExams: Exam[] = [
  { id: 'ex-1', course: 'Programmazione Mobile', cfu: 9, grade: 29, date: '20/05/2026', status: 'Accettato' },
  { id: 'ex-2', course: 'Ingegneria del Software', cfu: 6, grade: 27, date: '12/04/2026', status: 'Accettato' },
  { id: 'ex-3', course: 'Basi di Dati', cfu: 9, grade: 30, date: '03/06/2026', status: 'Da valutare' },
];

export const lessons: Lesson[] = [
  { id: 'l-1', course: 'Mobile Programming', day: 'Lunedi', time: '09:00 - 11:00', room: 'Aula F6', teacher: 'Prof. Esposito' },
  { id: 'l-2', course: 'Ingegneria del Software', day: 'Martedi', time: '11:00 - 13:00', room: 'Aula P3', teacher: 'Prof.ssa De Luca' },
  { id: 'l-3', course: 'Basi di Dati', day: 'Giovedi', time: '14:00 - 16:00', room: 'Lab T25', teacher: 'Prof. Romano' },
];

export const teacherCourses = [
  { id: 'tc-1', name: 'Mobile Programming', room: 'Aula F6', students: 86, material: 'Slide, esercitazioni, progetto finale' },
  { id: 'tc-2', name: 'Laboratorio di App', room: 'Lab T25', students: 42, material: 'Repository GitHub e consegne settimanali' },
];

export const notifications: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Nuovo esito disponibile',
    body: 'Basi di Dati ha pubblicato un risultato da accettare o rifiutare.',
    target: 'Studente',
    date: 'Oggi',
  },
  {
    id: 'n-2',
    title: 'Manutenzione aula T25',
    body: 'Richiesto controllo dei proiettori nel laboratorio T25.',
    target: 'PTA',
    date: 'Oggi',
  },
  {
    id: 'n-3',
    title: 'Avviso di ateneo',
    body: 'Domani la mensa centrale chiudera alle 15:00 per manutenzione programmata.',
    target: 'Tutti',
    date: 'Ieri',
  },
];

export const news: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Open day dei corsi magistrali',
    body: 'Aula Magna di Fisciano, stand informativi e colloqui con i referenti dei corsi.',
    tag: 'Didattica',
  },
  {
    id: 'news-2',
    title: 'Nuovo calendario CUS',
    body: 'Pubblicati orari aggiornati per calcetto, tennis, basket e sala pesi.',
    tag: 'Campus',
  },
  {
    id: 'news-3',
    title: 'Borse di studio e bandi',
    body: 'Disponibili nuovi avvisi per mobilita internazionale e tutorato.',
    tag: 'Opportunita',
  },
];

export const campusPoints: CampusPoint[] = [
  { id: 'p-1', name: 'Mensa centrale', type: 'Mensa', detail: 'Menu settimanale e fasce orarie pranzo/cena.', x: 18, y: 32 },
  { id: 'p-2', name: 'Biblioteca scientifica', type: 'Studio', detail: 'Postazioni prenotabili e sale studio silenziose.', x: 62, y: 24 },
  { id: 'p-3', name: 'Aule F', type: 'Didattica', detail: 'Blocco lezioni per area informatica e ingegneria.', x: 43, y: 56 },
  { id: 'p-4', name: 'CUS Salerno', type: 'Sport', detail: 'Campi, palestre e segreteria sportiva.', x: 76, y: 68 },
  { id: 'p-5', name: 'Campus Baronissi', type: 'Sede', detail: 'Distaccamento con collegamenti bus dedicati.', x: 28, y: 72 },
];

export const transportRows = [
  { line: '7', route: 'Stazione Salerno - Campus Fisciano', next: '12 min', platform: 'Terminal bus' },
  { line: '17', route: 'Baronissi - Fisciano', next: '24 min', platform: 'Fermata Medicina' },
  { line: '10', route: 'Mercato S. Severino - Campus', next: '31 min', platform: 'Ingresso Nord' },
];

export const weatherRows = [
  { site: 'Fisciano', condition: 'Soleggiato', temp: '24°C', note: 'Vento leggero' },
  { site: 'Baronissi', condition: 'Variabile', temp: '22°C', note: 'Possibili nuvole nel pomeriggio' },
];

export const weeklyMenu = [
  { day: 'Lun', first: 'Pasta al pomodoro', second: 'Pollo alla griglia', veg: 'Burger di ceci' },
  { day: 'Mar', first: 'Riso primavera', second: 'Merluzzo al forno', veg: 'Insalata greca' },
  { day: 'Mer', first: 'Gnocchi al pesto', second: 'Tacchino e verdure', veg: 'Parmigiana light' },
  { day: 'Gio', first: 'Pasta e lenticchie', second: 'Frittata', veg: 'Cous cous vegetale' },
  { day: 'Ven', first: 'Lasagna', second: 'Pesce spada', veg: 'Tofu speziato' },
];

export const faqRows = [
  { q: 'Posso restare loggato?', a: 'Si. La sessione viene salvata localmente sul dispositivo.' },
  { q: 'Come prenoto un posto in biblioteca?', a: 'Dalla sezione Servizi puoi aprire il collegamento dedicato alla prenotazione.' },
  { q: 'I dati carriera sono calcolati?', a: 'L’app calcola esami superati, CFU, media aritmetica, ponderata e avanzamento.' },
];

export const initialTickets: Ticket[] = [
  {
    id: 't-1',
    title: 'Proiettore non funzionante',
    requester: 'Aula F6',
    location: 'Blocco F',
    body: 'Il proiettore non rileva HDMI durante le lezioni mattutine.',
    status: 'Aperto',
    priority: 'Alta',
    date: '2026-06-04',
    domain: 'Tecnico di Laboratiorio (IT)',
  },
  {
    id: 't-2',
    title: 'Postazioni biblioteca',
    requester: 'Biblioteca scientifica',
    location: 'Piano 2',
    body: 'Tre postazioni risultano prenotate ma non disponibili.',
    status: 'In carico',
    priority: 'Media',
    date: '2026-06-03',
    domain: 'Bibliotecario',
  },
];

export const cusActivities = [
  { name: 'Calcetto', when: 'Lun/Mer 18:00 - 22:00', contact: 'cus@unisa.it' },
  { name: 'Tennis', when: 'Mar/Gio 16:00 - 20:00', contact: 'tennis.cus@unisa.it' },
  { name: 'Sala pesi', when: 'Lun-Ven 09:00 - 21:00', contact: 'fitness.cus@unisa.it' },
];

export const enrolledStudentsByCourse: Record<string, { name: string; surname: string; matricola: string }[]> = {
  'tc-1': [
    { name: 'Lucia', surname: 'Canzolino', matricola: '0512106789' },
    { name: 'Giovanni', surname: 'Lupo', matricola: '0512101234' },
    { name: 'Antonio', surname: 'Purcaro', matricola: '0512105678' },
    { name: 'Marco', surname: 'Rossi', matricola: '0512104321' },
    { name: 'Francesca', surname: 'Bianchi', matricola: '0512109876' }
  ],
  'tc-2': [
    { name: 'Lucia', surname: 'Canzolino', matricola: '0512106789' },
    { name: 'Giovanni', surname: 'Lupo', matricola: '0512101234' },
    { name: 'Andrea', surname: 'Verdi', matricola: '0512101111' },
    { name: 'Chiara', surname: 'Neri', matricola: '0512102222' }
  ]
};

export const UNISA_DEPARTMENTS = [
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

export const UNISA_COURSES = [
  // Laurea Magistrale a Ciclo Unico di 6 Anni (360 CFU)
  { name: 'Medicina e Chirurgia', cfu: 360 },
  { name: 'Odontoiatria e Protesi Dentaria', cfu: 360 },

  // Laurea Magistrale a Ciclo Unico di 5 Anni (300 CFU)
  { name: 'Giurisprudenza', cfu: 300 },
  { name: 'Farmacia', cfu: 300 },
  { name: 'Chimica e Tecnologia Farmaceutiche (CTF)', cfu: 300 },
  { name: 'Ingegneria Edile-Architettura', cfu: 300 },
  { name: 'Scienze della Formazione Primaria', cfu: 300 },

  // Laurea Triennale (180 CFU)
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

  // Laurea Magistrale di 2 Anni (120 CFU)
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
  
  // Nuovi Corsi di Laurea Aggiunti
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

export const PHONE_PREFIXES = [
  '🇮🇹 +39',
  '🇺🇸 +1',
  '🇬🇧 +44',
  '🇫🇷 +33',
  '🇩🇪 +49',
  '🇪🇸 +34',
  '🇨🇭 +41',
  '🇦🇹 +43',
  '🇷🇴 +40',
  '🇦🇱 +355',
  '🇺🇦 +380',
  '🇵🇹 +351',
  '🇳🇱 +31',
  '🇧🇪 +32',
  '🇬🇷 +30',
  '🇮🇪 +353',
  '🇸🇪 +46',
  '🇵🇱 +48'
];

export const DEGREE_TEACHINGS: Record<string, string[]> = {
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

export const getTeachingsForDegrees = (degrees: string[]): string[] => {
  if (!degrees || degrees.length === 0) return [];
  const list: string[] = [];
  degrees.forEach(deg => {
    const predefined = DEGREE_TEACHINGS[deg];
    if (predefined) {
      predefined.forEach(t => {
        if (!list.includes(t)) list.push(t);
      });
    } else {
      const fallbacks = [
        `Fondamenti di ${deg}`,
        `Laboratorio di ${deg}`,
        `Corso Avanzato di ${deg}`,
        `Seminario Specialistico di ${deg}`
      ];
      fallbacks.forEach(t => {
        if (!list.includes(t)) list.push(t);
      });
    }
  });
  return list.sort();
};

export const DEPARTMENT_COURSES: Record<string, string[]> = {
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

export const getCoursesForDepartment = (deptName?: string): { name: string; cfu: number }[] => {
  if (!deptName) return UNISA_COURSES;
  const courseNames = DEPARTMENT_COURSES[deptName];
  if (!courseNames) return UNISA_COURSES;
  return UNISA_COURSES.filter(c => courseNames.includes(c.name));
};

