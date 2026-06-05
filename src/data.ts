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
    accent: '#0F5132',
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
