import type { CampusPoint, Exam, Lesson, NewsItem, NotificationItem, Role, Ticket, UserProfile } from './types';

export const demoUsers: UserProfile[] = [
  {
    id: 'student-demo',
    name: 'Lucia',
    surname: 'Canzolino',
    email: 'lucia.canzolino@studenti.unisa.it',
    password: 'demo',
    role: 'Studente',
    department: "Dipartimento di Ingegneria dell'Informazione ed Elettrica e Matematica Applicata",
    degreeCourse: 'Ingegneria Informatica',
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
    department: "Dipartimento di Ingegneria dell'Informazione ed Elettrica e Matematica Applicata",
    phone: '+39 089 960000',
    language: 'IT',
    teacherDegrees: ['Ingegneria Informatica'],
    teachings: ['Ingegneria del Software', 'Programmazione ad Oggetti'],
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
  { id: 'ex-1', course: 'Programmazione ad Oggetti', cfu: 9, grade: 29, date: '20/05/2026', status: 'Accettato' },
  { id: 'ex-2', course: 'Ingegneria del Software', cfu: 9, grade: 27, date: '12/04/2026', status: 'Accettato' },
  { id: 'ex-3', course: 'Basi di Dati', cfu: 9, grade: 30, date: '03/06/2026', status: 'Da valutare' },
];

export const lessons: Lesson[] = [
  { id: 'l-1', course: 'Programmazione ad Oggetti', day: 'Lunedi', time: '09:00 - 11:00', room: 'Aula F6', teacher: 'Prof. Esposito' },
  { id: 'l-2', course: 'Ingegneria del Software', day: 'Martedi', time: '11:00 - 13:00', room: 'Aula P3', teacher: 'Prof.ssa De Luca' },
  { id: 'l-3', course: 'Basi di Dati', day: 'Giovedi', time: '14:00 - 16:00', room: 'Lab T25', teacher: 'Prof. Romano' },
];

export const teacherCourses = [
  { id: 'tc-1', name: 'Ingegneria del Software', room: 'Aula F6', students: 86, material: 'Slide, esercitazioni, progetto finale' },
  { id: 'tc-2', name: 'Programmazione ad Oggetti', room: 'Lab T25', students: 42, material: 'Repository GitHub e consegne settimanali' },
];

export const notifications: NotificationItem[] = [];

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
  { id: 'p-1', name: 'Mensa centrale', type: 'Mensa', detail: 'Menu settimanale e fasce orarie pranzo/cena.', x: 18, y: 32, lat: 40.77195, lng: 14.7907 },
  { id: 'p-2', name: 'Biblioteca scientifica', type: 'Studio', detail: 'Postazioni prenotabili e sale studio silenziose.', x: 62, y: 24, lat: 40.7750, lng: 14.7895 },
  { id: 'p-3', name: 'Aule F', type: 'Didattica', detail: 'Blocco lezioni per area informatica e ingegneria.', x: 43, y: 56, lat: 40.7725, lng: 14.7878 },
  { id: 'p-4', name: 'CUS Salerno', type: 'Sport', detail: 'Campi, palestre e segreteria sportiva.', x: 76, y: 68, lat: 40.7760, lng: 14.7980 },
  { id: 'p-5', name: 'Campus Baronissi', type: 'Sede', detail: 'Distaccamento con collegamenti bus dedicati.', x: 28, y: 72, lat: 40.7516, lng: 14.7915 },
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
  'Dipartimento di Medicina e Chirurgia',
  'Dipartimento di Scienze Giuridiche',
  "Dipartimento di Ingegneria dell'Informazione ed Elettrica e Matematica Applicata"
];

export const UNISA_COURSES = [
  { name: 'Medicina e Chirurgia', cfu: 360 },
  { name: 'Giurisprudenza', cfu: 300 },
  { name: 'Ingegneria Informatica', cfu: 180 },
  { name: "Ingegneria dell'Informazione per la Medicina Digitale", cfu: 180 },
  { name: 'Electrical Engineering for digital energy', cfu: 120 }
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

export const TEACHING_CFU_MAP: Record<string, Record<string, number> | number> = {
  'Fisica': 6,
  'Chimica e Propedeutica Biochimica': 6,
  'Biologia': 6,
  'AFP 1 Anno - I': 1,
  'Attività Elettiva 1': 1,
  'Attività Elettiva 2': 1,
  'Attività Elettiva 3': 1,
  'Anatomia Umana I': 8,
  'Istologia ed Embriologia Umana': 7,
  'Scienze Umane e della Salute': 9,
  'AFP 1 Anno - II': 2,
  'Anatomia Umana II': 7,
  'AFP 2 Anno - III': 1,
  'Attività Elettiva 4': 1,
  'Attività Elettiva 5': 1,
  'Biochimica e Biologia Molecolare': 16,
  'Fisiologia Umana': 11,
  'Patologia Generale I': 7,
  'Immunologia e Microbiologia': 8,
  'AFP 2 Anno - IV': 4,
  'Patologia Generale II': 4,
  'Metodologia Clinica': 10,
  'Medicina di Laboratorio e Diagnostica Integrata': 8,
  'Attività Elettiva 6': 1,
  'Attività Elettiva 7': 1,
  'AFP 3 Anno - V': 5,
  'Farmacologia e Tossicologia Medica': 8,
  'Anatomia e Istologia Patologica I': 5,
  'Igiene Generale ed Applicata': 6,
  'Oncologia ed Ematologia': 7,
  'AFP 3 Anno - VI': 3,
  'Anatomia e Istologia Patologica II': 6,
  'Malattie del Sistema Endocrino e dell\'Apparato Digerente': 8,
  'Malattie Infettive e Microbiologia Clinica': 8,
  'Attività Elettiva 8': 1,
  'AFP 4 Anno - VII': 5,
  'Malattie dell\'Apparato Urinario': 5,
  'Immunologia Clinica e Allergologia-Reumatologia': 6,
  'Malattie dell\'Apparato Respiratorio-Cardiovascolare': 12,
  'AFP 4 Anno - VIII': 6,
  'Diagnostica per Immagini e Radioterapia': 5,
  'Sanità Pubblica-Medicina Legale e del Lavoro-Sociologia': 8,
  'Scienze Neurologiche e Psichiatriche': 10,
  'Attività Elettiva 9': 1,
  'Pediatria': 8,
  'Medicina Interna-Farmacologia': 9,
  'Malattie del Distretto Cervico-Facciale e degli Organi di Senso': 7,
  'Tirocinio Pratico-Valutativo Area Medica': 5,
  'Chirurgia Plastica-Malattie Cutanee e Veneree-Malattie dell\'Apparato Locomotore': 9,
  'Ginecologia e Ostetricia': 5,
  'Medicina Interna e Intelligenza Artificiale': 11,
  'Chirurgia Generale': 11,
  'AFP 6 Anno - IX': 5,
  'Attività Elettiva 10': 1,
  'Emergenze Mediche e Chirurgiche e Medicina del Territorio': 9,
  'AFP 6 Anno - X': 5,
  'Tirocinio Pratico-Valutativo Area Chirurgica': 5,
  'Tirocinio Pratico-Valutativo Medicina Generale': 5,
  'Tirocinio Pratico-Valutativo Medicina Legale': 6,

  // Giurisprudenza
  'Diritto Costituzionale': 10,
  'Filosofia del Diritto': 9,
  'Istituzioni di Diritto Privato': 13,
  'Storia del Diritto Medievale e Moderno': 9,
  'Esame a scelta 1 Anno': 9,
  'Esame Integrativo 1 Anno': 6,
  'Diritto Commerciale': 9,
  'Diritto dell\'Unione Europea': 9,
  'Diritto Ecclesiastico': 9,
  'Diritto Internazionale': 9,
  'Fondamenti del Diritto Europeo': 6,
  'Sistemi Giuridici Comparati': 9,
  'Esame Integrativo 2 Anno': 6,
  'Diritto Civile': 12,
  'Diritto del Lavoro': 12,
  'Diritto Penale': 9,
  'Storia del Diritto Moderno e Contemporaneo': 6,
  'Teoria del Diritto e dell\'Argomentazione': 6,
  'Prima Lingua Straniera': 6,
  'Esame Integrativo 3 Anno': 6,
  'Diritto Amministrativo': 9,
  'Diritto Processuale Civile': 15,
  'Procedura Penale': 15,
  'Esame a scelta 4 Anno I': 9,
  'Esame a scelta 4 Anno II': 9,
  'Laboratorio di Scrittura Giuridica 4 Anno': 2,
  'Esame Integrativo 4 Anno I': 6,
  'Esame Integrativo 4 Anno II': 6,
  'Esame Integrstivo 4 Anno II': 6,
  'Diritto Penale Parte Speciale': 6,
  'Diritto Processuale Amministrativo': 9,
  'Esame a scelta 5 Anno': 6,
  'Laboratorio di Scrittura Giuridica 5 Anno': 2,
  'Esame Integrativo 5 Anno I': 6,
  'Tirocinio': 0,
  'Seconda Lingua Straniera': 6,
  'Esame Integrativo 5 Anno II': 6,

  // Ingegneria Informatica
  'Fisica I': 6,
  'Analisi Matematica II': 6,
  'Fisica II': 6,
  'Geometria-Algebra-Logica': 9,
  'Analisi dei Segnali': 9,
  'Elettrotecnica': 9,
  'Circuiti e Sistemi Digitali': 6,
  'Idoneità di Inglese': 3,
  'Sistemi Operativi': 6,
  'Ingegneria del Software': 9,
  'Controlli Automatici': 9,
  'Insegnamento di Curriculum 1': 9,
  'Insegnamento di Curriculum 2': 6,

  // Ingegneria dell'Informazione per la Medicina Digitale
  'Analisi Matematica II e Algebra Lineare': 12,
  'Fisica Generale': 9,
  'Elementi di Biochimica e Medicina di Laboratorio': 6,
  'Inglese': 6,
  'Fondamenti di Farmacologia, Clinica e Chirurgia': 9,
  'Circuiti Biomedicali': 9,
  'Elaborazione di Segnali e Dati Biomedici': 8,
  'Dispositivi e Sensori Biomedicali': 8,
  'Teoria dei Sistemi': 6,
  'Sicurezza e Privacy dei Dati Clinici': 6,
  'Sistemi Informativi Sanitari': 9,
  'Tecnologie Informatiche per la Medicina Digitale': 9,
  'Programmazione Web e Mobile per E-Health': 6,

  // Electrical Engineering
  'Programming Techniques': 6,
  'Electric Circuits': 9,
  'Electric Power Systems': 9,
  'Renewable Sources and Power Converters': 12,
  'Electric Machines': 9,
  'Communication Networks': 6,
  'Cybersecurity': 6,
  'Professional Skills and Knowledge': 1,
  'Automation': 9,
  'Batteries and Energy Storage': 6,
  'Smart Grids and Energy Management': 6,
  'Data Science and Machine Learning': 12,
  'Final Examination': 17,

  // Shared / Overlapping teachings
  'Analisi Matematica I': {
    'Ingegneria Informatica': 9,
    "Ingegneria dell'Informazione per la Medicina Digitale": 9,
    'default': 9
  },
  'Fondamenti di Programmazione': {
    'Ingegneria Informatica': 9,
    "Ingegneria dell'Informazione per la Medicina Digitale": 9,
    'default': 9
  },
  'Calcolatori Elettronici': {
    'Ingegneria Informatica': 9,
    "Ingegneria dell'Informazione per la Medicina Digitale": 6,
    'default': 6
  },
  'Algoritmi e Strutture Dati': {
    'Ingegneria Informatica': 9,
    "Ingegneria dell'Informazione per la Medicina Digitale": 6,
    'default': 6
  },
  'Reti di Calcolatori': {
    'Ingegneria Informatica': 9,
    "Ingegneria dell'Informazione per la Medicina Digitale": 6,
    'default': 6
  },
  'Programmazione ad Oggetti': {
    'Ingegneria Informatica': 9,
    "Ingegneria dell'Informazione per la Medicina Digitale": 9,
    'default': 9
  },
  'Basi di Dati': 9,
  'Orientamento al Lavoro': 1,
  'Tirocinio/Academy': 8,

  'Esame a scelta 1': {
    'Ingegneria Informatica': 6,
    "Ingegneria dell'Informazione per la Medicina Digitale": 9,
    'Electrical Engineering for digital energy': 6,
    'default': 6
  },
  'Esame a scelta 2': 6,

  'Prova Finale': {
    'Medicina e Chirurgia': 14,
    'Ingegneria Informatica': 3,
    "Ingegneria dell'Informazione per la Medicina Digitale": 3,
    'default': 3
  }
};

export const getTeachingCfu = (teachingName: string, degreeCourse?: string): number => {
  const entry = TEACHING_CFU_MAP[teachingName];
  if (entry === undefined) return 6;
  if (typeof entry === 'number') return entry;
  if (degreeCourse && entry[degreeCourse] !== undefined) {
    return entry[degreeCourse];
  }
  return entry['default'] || 6;
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

export const getCoursesForDepartment = (deptName?: string): { name: string; cfu: number }[] => {
  if (!deptName) return UNISA_COURSES;
  const courseNames = DEPARTMENT_COURSES[deptName];
  if (!courseNames) return UNISA_COURSES;
  return UNISA_COURSES.filter(c => courseNames.includes(c.name));
};
