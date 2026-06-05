import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  BookOpen,
  Briefcase,
  Bus,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  ClipboardList,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  ChevronDown,
  ChevronRight,
  Edit3,
  ExternalLink,
  GraduationCap,
  Home,
  Languages,
  Library,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sun,
  Ticket,
  Trash2,
  Trophy,
  User,
  Users,
  Utensils,
  XCircle,
  Clock,
  Calculator,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, Dispatch, SetStateAction } from 'react';

import {
  campusPoints,
  cusActivities,
  demoUsers,
  faqRows,
  initialExams,
  initialTickets,
  lessons,
  news,
  notifications,
  roleCopy,
  teacherCourses,
  transportRows,
  weatherRows,
  weeklyMenu,
  enrolledStudentsByCourse,
} from './src/data';
import { colors, radii, shadow } from './src/theme';
import type { CampusPoint, Exam, ExamStatus, Lesson, MainTab, NewsItem, NotificationItem, Role, Ticket as TicketType, UserProfile } from './src/types';


const STORAGE_KEYS = {
  session: 'unisallround.session',
  users: 'unisallround.users',
  exams: 'unisallround.exams',
  tickets: 'unisallround.tickets',
  notifications: 'unisallround.notifications',
};

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type AuthMode = 'login' | 'register';

type DraftProfile = Pick<UserProfile, 'name' | 'surname' | 'email' | 'phone' | 'department' | 'language' | 'degreeCourse' | 'shifts'>;

const totalDegreeCfu = 180;

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const isInstitutionalEmail = (email: string) => /@((studenti\.)?unisa\.it)$/i.test(email.trim());

const capitalizeWords = (str?: string): string => {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const decodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&igrave;/g, 'ì')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&eacute;/g, 'é')
    .replace(/&deg;/g, '°')
    .replace(/&ndash;/g, '–');
};

const fetchUnisaNews = async (fallbackNews: NewsItem[]): Promise<NewsItem[]> => {
  try {
    const response = await fetch('https://www.unisa.it');
    const html = await response.text();
    
    const bachecaStart = html.indexOf('<h2>bacheca</h2>') !== -1 
      ? html.indexOf('<h2>bacheca</h2>') 
      : html.indexOf('data-tts="true">bacheca</h2>');
      
    if (bachecaStart === -1) return fallbackNews;
    
    const bachecaEnd = html.indexOf('</ul>', bachecaStart);
    if (bachecaEnd === -1) return fallbackNews;
    const bachecaHtml = html.substring(bachecaStart, bachecaEnd);
    
    const liRegex = /<li>([\s\S]*?)<\/li>/g;
    const items: NewsItem[] = [];
    let match;
    let idCounter = 1;
    
    while ((match = liRegex.exec(bachecaHtml)) !== null && items.length < 5) {
      const liContent = match[1];
      
      const tagMatch = liContent.match(/<small[^>]*>([\s\S]*?)<\/small>/);
      const tag = tagMatch ? tagMatch[1].trim() : 'Ateneo';
      
      const h3Match = liContent.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (!h3Match) continue;
      
      const aMatch = h3Match[1].match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      if (!aMatch) continue;
      
      const link = aMatch[1].startsWith('http') ? aMatch[1] : `https://www.unisa.it${aMatch[1]}`;
      const title = decodeHtmlEntities(aMatch[2].trim());
      
      const pMatch = liContent.match(/<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/);
      let body = pMatch ? decodeHtmlEntities(pMatch[1].trim()) : '';
      
      if (!body) {
        const generalPMatch = liContent.match(/<p\s+class="hidden-xs"[^>]*>([\s\S]*?)<\/p>/);
        if (generalPMatch) body = decodeHtmlEntities(generalPMatch[1].trim());
      }
      
      if (!body) {
        body = title;
      }
      
      items.push({
        id: `unisa-live-${idCounter++}`,
        title,
        body,
        tag,
        link,
      });
    }
    
    return items.length > 0 ? items : fallbackNews;
  } catch (error) {
    console.error('Error fetching UNISA news:', error);
    return fallbackNews;
  }
};

const formatAverage = (avg: number) => {
  return typeof avg === 'number' && !Number.isNaN(avg) && avg > 0 ? avg.toFixed(2) : '0.00';
};

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const translations = {
  IT: {
    login: 'Login',
    register: 'Registrati',
    email: 'E-mail istituzionale',
    password: 'Password',
    name: 'Nome',
    surname: 'Cognome',
    department: 'Dipartimento / ufficio',
    degreeCourse: 'Corso di laurea',
    phone: 'Telefono',
    role: 'Tipo utenza',
    rememberMe: 'Resta loggato su questo dispositivo',
    submitLogin: 'Accedi',
    submitRegister: 'Crea account',
    demoHint: '',
    loadingSession: 'Caricamento sessione...',
    univSalerno: 'Università di Salerno',
    home: 'Home',
    campus: 'Campus',
    services: 'Servizi',
    profile: 'Profilo',
    searchPlaceholder: 'Cerca servizi, lezioni, ticket...',
    logout: 'Esci',
    deleteAccount: 'Elimina account',
    confirmDeleteTitle: 'Eliminare account?',
    confirmDeleteMsg: 'L’account verrà rimosso dai dati locali del prototipo.',
    cancel: 'Annulla',
    delete: 'Elimina',
    profileUpdated: 'Profilo aggiornato',
    invalidProfile: 'Dati profilo non validi',
    checkProfileFields: 'Controlla nome, cognome e mail istituzionale.',
    linkNotAvailable: 'Collegamento non disponibile',
    linkError: 'Il dispositivo non riesce ad aprire questo collegamento.',
    hello: 'Ciao',
    welcomeBack: 'Bentornato,',
    welcome: 'Benvenuto in UnisAllRound',
    passedExams: 'Esami superati',
    weightedAvg: 'Media ponderata',
    acquiredCfu: 'CFU acquisiti',
    progress: 'Avanzamento',
    activeCourses: 'Corsi attivi',
    supervisedStudents: 'Studenti seguiti',
    announcementsSent: 'Avvisi inviati',
    officeHours: 'Ricevimento',
    openTickets: 'Ticket aperti',
    tasksToday: 'Interventi oggi',
    workShift: 'Turno',
    highPriority: 'Priorità alta',
    notifications: 'Notifiche',
    notifSubtitle: 'Annunci filtrati in base allo status configurato.',
    searchResultTitle: 'Risultati di ricerca',
    searchResultOpen: 'Apri',
    studentCareer: 'Carriera studente',
    careerSubtitle: 'Inserimento dati e statistiche calcolate dal sistema.',
    examsCount: 'Esami',
    arithmeticAvg: 'Media',
    ponderatedAvg: 'Ponderata',
    cfuCount: 'CFU',
    progressText: 'del percorso da 180 CFU',
    insertExam: 'Inserisci risultato accademico',
    courseLabel: 'Corso',
    cfuLabel: 'CFU',
    gradeLabel: 'Voto',
    saveCareerData: 'Salva dati carriera',
    teachingSection: 'Didattica',
    teachingSubtitle: 'Orari, aule, esiti e collegamenti rapidi.',
    publishedResults: 'Esiti pubblicati',
    accept: 'Accetta',
    reject: 'Rifiuta',
    elearning: 'E-learning',
    library: 'Biblioteca',
    appointment: 'Ricevimento',
    quickLinks: 'Collegamenti rapidi',
    invalidExamAlert: 'Dati esame non validi',
    invalidExamMsg: 'Inserisci corso, CFU positivi e voto tra 18 e 30.',
    toastExamSavedMsg: 'Dati carriera salvati',
    toastExamAcceptedMsg: 'Esito accettato',
    toastExamRejectedMsg: 'Esito rifiutato',
    teacherArea: 'Area docente',
    teacherAreaSubtitle: 'Corsi, aule assegnate, risultati e comunicazioni.',
    publishExamResult: 'Pubblica esito esame',
    studentLabel: 'Studente',
    publishResultBtn: 'Pubblica risultato',
    announcementsToStudents: 'Comunicazioni agli studenti',
    messageLabel: 'Messaggio',
    sendAnnouncementBtn: 'Invia comunicazione',
    officeHoursSetup: 'Ricevimento',
    hoursAndLocationLabel: 'Orari e luogo',
    updateHoursBtn: 'Aggiorna bacheca',
    invalidPublishAlert: 'Pubblicazione non valida',
    invalidPublishMsg: 'Inserisci studente e voto tra 18 e 30.',
    emptyMessageAlert: 'Messaggio vuoto',
    emptyMessageMsg: 'Scrivi una comunicazione da inviare agli studenti.',
    hoursUpdatedAlert: 'Ricevimento aggiornato',
    toastResultPublished: 'Esito pubblicato agli studenti',
    toastAnnouncementSent: 'Comunicazione inviata',
    ptaArea: 'Area PTA',
    ptaAreaSubtitle: 'Orario di lavoro e gestione ticket di supporto.',
    weeklyShift: 'Turno settimanale',
    shiftSubtitle: 'Presidio tecnico-amministrativo campus',
    pendingRequests: 'Richieste in sospeso',
    pendingRequestsSubtitle: 'Accetta, rifiuta o chiudi gli interventi generati dagli utenti.',
    takeTicket: 'Prendi',
    closeTicket: 'Chiudi',
    toastTicketAssigned: 'Ticket in carico',
    toastTicketClosed: 'Ticket chiuso',
    campusTitle: 'Campus',
    campusSubtitle: 'News, meteo, mensa, trasporti e mappa interattiva Fisciano-Baronissi.',
    canteenTitle: 'Mensa',
    canteenSubtitle: 'Menù settimanale e fasce orarie pranzo/cena.',
    weatherTitle: 'Meteo',
    weatherSubtitle: 'Dati in tempo reale dalle sedi dell\'ateneo.',
    weatherLoading: 'Caricamento meteo...',
    weatherError: 'Errore nel caricamento dei dati meteo',
    weatherWind: 'Vento',
    transportTitle: 'Trasporti pubblici',
    transportSubtitle: 'Orari navetta e collegamenti bus per Fisciano e Baronissi.',
    cusTitle: 'CUS Salerno',
    cusSubtitle: 'Attività sportive, orari campi e contatti della segreteria.',
    mapTitle: 'Mappa del Campus',
    mapSubtitle: 'Seleziona i punti d\'interesse sulla mappa.',
    vegLabel: 'Veg',
    newsLabel: 'News di ateneo',
    newsSubtitle: 'Avvisi e comunicazioni ufficiali.',
    servicesTitle: 'Servizi',
    servicesSubtitle: 'Ticket, FAQ, feedback e collegamenti rapidi.',
    bookLibrarySeat: 'Posto biblioteca',
    bookLibrarySeatDetail: 'Apri prenotazione',
    elearningDetail: 'Piattaforma corsi',
    requestPtaSupport: 'Richiedi supporto PTA',
    ticketTitleLabel: 'Titolo',
    ticketLocationLabel: 'Luogo',
    ticketDescLabel: 'Descrizione',
    ticketPriorityLabel: 'Priorità',
    ticketLow: 'Bassa',
    ticketMedium: 'Media',
    ticketHigh: 'Alta',
    submitTicketBtn: 'Invia ticket',
    feedbackTitle: 'Feedback agli sviluppatori',
    feedbackPlaceholder: 'Segnalazione o suggerimento',
    submitFeedbackBtn: 'Invia feedback',
    faqTitle: 'FAQ',
    faqSubtitle: 'Risposte rapide alle domande ricorrenti.',
    ticketIncompleteAlert: 'Ticket incompleto',
    ticketIncompleteMsg: 'Inserisci titolo, luogo e descrizione della richiesta.',
    feedbackEmptyAlert: 'Segnalazione vuota',
    feedbackEmptyMsg: 'Descrivi il problema o il suggerimento per gli sviluppatori.',
    toastTicketCreated: 'Ticket inviato al PTA',
    toastFeedbackSent: 'Feedback inviato agli sviluppatori',
    profileTitle: 'Profilo',
    profileSubtitle: 'Modifica dei dati personali salvati in fase di registrazione.',
    personalDataTitle: 'Dati personali',
    langLabel: 'Lingua',
    saveChangesBtn: 'Salva modifiche',
    authSubtitleText: 'L’app unica per studenti, docenti e personale tecnico-amministrativo dell’Università degli Studi di Salerno.',
    loginFailedText: 'Accesso non riuscito',
    invalidCredentialsText: 'Credenziali errate. Riprova.',
    missingDataText: 'Dati mancanti',
    enterDetailsText: 'Inserisci nome, cognome e password.',
    invalidEmailText: 'E-mail non valida',
    useInstEmailText: 'Usa una mail istituzionale @unisa.it o @studenti.unisa.it.',
    accountExistsText: 'Account già presente',
    emailExistsText: 'Questo indirizzo e-mail risulta già registrato.',
    registrationCompleteText: 'Registrazione completata',
    sessionSavedText: 'Accesso effettuato e sessione salvata',
    noNotifications: 'Nessuna notifica presente',
    studentRole: 'Studente',
    teacherRole: 'Docente',
    ptaRole: 'PTA',
  },
  EN: {
    login: 'Login',
    register: 'Register',
    email: 'Institutional Email',
    password: 'Password',
    name: 'First Name',
    surname: 'Last Name',
    department: 'Department / Office',
    degreeCourse: 'Degree Course',
    phone: 'Phone Number',
    role: 'User Type',
    rememberMe: 'Keep me logged in on this device',
    submitLogin: 'Login',
    submitRegister: 'Create Account',
    demoHint: '',
    loadingSession: 'Loading session...',
    univSalerno: 'University of Salerno',
    home: 'Home',
    campus: 'Campus',
    services: 'Services',
    profile: 'Profile',
    searchPlaceholder: 'Search services, schedules, tickets...',
    logout: 'Logout',
    deleteAccount: 'Delete Account',
    confirmDeleteTitle: 'Delete Account?',
    confirmDeleteMsg: 'The account will be removed from local database.',
    cancel: 'Cancel',
    delete: 'Delete',
    profileUpdated: 'Profile updated',
    invalidProfile: 'Invalid profile data',
    checkProfileFields: 'Check first name, last name and institutional email.',
    linkNotAvailable: 'Link not available',
    linkError: 'The device cannot open this link.',
    hello: 'Hello',
    welcomeBack: 'Welcome back,',
    welcome: 'Welcome to UnisAllRound',
    passedExams: 'Passed exams',
    weightedAvg: 'Weighted average',
    acquiredCfu: 'Acquired CFU',
    progress: 'Progress',
    activeCourses: 'Active courses',
    supervisedStudents: 'Supervised students',
    announcementsSent: 'Announcements sent',
    officeHours: 'Office Hours',
    openTickets: 'Open tickets',
    tasksToday: 'Tasks today',
    workShift: 'Shift',
    highPriority: 'High priority',
    notifications: 'Notifications',
    notifSubtitle: 'Announcements filtered by role.',
    searchResultTitle: 'Search Results',
    searchResultOpen: 'Open',
    studentCareer: 'Student Career',
    careerSubtitle: 'Data entry and statistics calculated by the system.',
    examsCount: 'Exams',
    arithmeticAvg: 'Average',
    ponderatedAvg: 'Weighted',
    cfuCount: 'CFU',
    progressText: 'of the 180 CFU journey',
    insertExam: 'Insert Academic Result',
    courseLabel: 'Course',
    cfuLabel: 'CFU',
    gradeLabel: 'Grade',
    saveCareerData: 'Save Career Data',
    teachingSection: 'Teaching',
    teachingSubtitle: 'Schedules, rooms, results and quick links.',
    publishedResults: 'Published Results',
    accept: 'Accept',
    reject: 'Reject',
    elearning: 'E-learning',
    library: 'Library',
    appointment: 'Office Hours',
    quickLinks: 'Quick Links',
    invalidExamAlert: 'Invalid Exam Data',
    invalidExamMsg: 'Please enter course, positive CFU, and grade between 18 and 30.',
    toastExamSavedMsg: 'Career data saved',
    toastExamAcceptedMsg: 'Result accepted',
    toastExamRejectedMsg: 'Result rejected',
    teacherArea: 'Teacher Area',
    teacherAreaSubtitle: 'Courses, assigned rooms, results and announcements.',
    publishExamResult: 'Publish Exam Result',
    studentLabel: 'Student',
    publishResultBtn: 'Publish Result',
    announcementsToStudents: 'Announcements to Students',
    messageLabel: 'Message',
    sendAnnouncementBtn: 'Send Announcement',
    officeHoursSetup: 'Office Hours',
    hoursAndLocationLabel: 'Hours and Location',
    updateHoursBtn: 'Update Board',
    invalidPublishAlert: 'Invalid Publication',
    invalidPublishMsg: 'Please enter student and grade between 18 and 30.',
    emptyMessageAlert: 'Empty Message',
    emptyMessageMsg: 'Please write an announcement to send to students.',
    hoursUpdatedAlert: 'Office hours updated',
    toastResultPublished: 'Result published to students',
    toastAnnouncementSent: 'Announcement sent',
    ptaArea: 'Staff Area',
    ptaAreaSubtitle: 'Working hours and support ticket management.',
    weeklyShift: 'Weekly Shift',
    shiftSubtitle: 'Campus technical-administrative shift',
    pendingRequests: 'Pending Requests',
    pendingRequestsSubtitle: 'Accept, assign, or close support tickets.',
    takeTicket: 'Assign to me',
    closeTicket: 'Close',
    toastTicketAssigned: 'Ticket assigned',
    toastTicketClosed: 'Ticket closed',
    campusTitle: 'Campus',
    campusSubtitle: 'News, weather, canteen, transport and interactive map.',
    canteenTitle: 'Canteen',
    canteenSubtitle: 'Weekly menu and lunch/dinner hours.',
    weatherTitle: 'Weather',
    weatherSubtitle: 'Real-time weather data from campus sites.',
    weatherLoading: 'Loading weather...',
    weatherError: 'Error loading weather data',
    weatherWind: 'Wind',
    transportTitle: 'Public Transport',
    transportSubtitle: 'Bus and shuttle connection schedules.',
    cusTitle: 'CUS Salerno',
    cusSubtitle: 'Sports activities, court hours and office contacts.',
    mapTitle: 'Campus Map',
    mapSubtitle: 'Select points of interest on the map.',
    vegLabel: 'Veg',
    newsLabel: 'University News',
    newsSubtitle: 'Official notices and announcements.',
    servicesTitle: 'Services',
    servicesSubtitle: 'Tickets, FAQ, feedback and quick links.',
    bookLibrarySeat: 'Library Seat',
    bookLibrarySeatDetail: 'Open booking',
    elearningDetail: 'Course platform',
    requestPtaSupport: 'Request support',
    ticketTitleLabel: 'Title',
    ticketLocationLabel: 'Location',
    ticketDescLabel: 'Description',
    ticketPriorityLabel: 'Priority',
    ticketLow: 'Low',
    ticketMedium: 'Medium',
    ticketHigh: 'High',
    submitTicketBtn: 'Submit Ticket',
    feedbackTitle: 'Developer Feedback',
    feedbackPlaceholder: 'Bug report or suggestion',
    submitFeedbackBtn: 'Submit Feedback',
    faqTitle: 'FAQ',
    faqSubtitle: 'Quick answers to common questions.',
    ticketIncompleteAlert: 'Incomplete Ticket',
    ticketIncompleteMsg: 'Please enter a title, location, and description.',
    feedbackEmptyAlert: 'Empty Feedback',
    feedbackEmptyMsg: 'Please describe the problem or suggestion for developers.',
    toastTicketCreated: 'Ticket submitted to PTA',
    toastFeedbackSent: 'Feedback sent to developers',
    profileTitle: 'Profile',
    profileSubtitle: 'Edit personal details saved during registration.',
    personalDataTitle: 'Personal Data',
    langLabel: 'Language',
    saveChangesBtn: 'Save Changes',
    authSubtitleText: 'The unified app for students, teachers, and technical-administrative staff of the University of Salerno.',
    loginFailedText: 'Login failed',
    invalidCredentialsText: 'Invalid credentials. Please try again.',
    missingDataText: 'Missing data',
    enterDetailsText: 'Please enter first name, last name, and password.',
    invalidEmailText: 'Invalid email',
    useInstEmailText: 'Use an institutional email @unisa.it or @studenti.unisa.it.',
    accountExistsText: 'Account already exists',
    emailExistsText: 'This email address is already registered.',
    registrationCompleteText: 'Registration completed',
    sessionSavedText: 'Login successful and session saved',
    noNotifications: 'No notifications available',
    studentRole: 'Student',
    teacherRole: 'Teacher',
    ptaRole: 'PTA',
  },
};

const getWeatherInfo = (code: number, lang: 'IT' | 'EN') => {
  if (code === 0) {
    return {
      text: lang === 'IT' ? 'Soleggiato' : 'Sunny',
      icon: Sun,
    };
  } else if (code >= 1 && code <= 3) {
    return {
      text: lang === 'IT' ? 'Variabile' : 'Partly Cloudy',
      icon: CloudSun,
    };
  } else if (code === 45 || code === 48) {
    return {
      text: lang === 'IT' ? 'Nebbia' : 'Foggy',
      icon: Cloud,
    };
  } else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
    return {
      text: lang === 'IT' ? 'Pioggia' : 'Rainy',
      icon: CloudRain,
    };
  } else if (code >= 71 && code <= 77) {
    return {
      text: lang === 'IT' ? 'Neve' : 'Snowy',
      icon: CloudSnow,
    };
  } else if (code >= 95) {
    return {
      text: lang === 'IT' ? 'Temporale' : 'Thunderstorm',
      icon: CloudLightning,
    };
  }
  return {
    text: lang === 'IT' ? 'Variabile' : 'Partly Cloudy',
    icon: CloudSun,
  };
};

const getRoleLabel = (r: Role, lang: 'IT' | 'EN') => {
  if (r === 'Studente') return lang === 'IT' ? 'Studente' : 'Student';
  if (r === 'Docente') return lang === 'IT' ? 'Docente' : 'Professor';
  if (r === 'PTA') return lang === 'IT' ? 'PTA' : 'Staff';
  return r;
};

const getRoleCopy = (role: Role, lang: 'IT' | 'EN') => {
  if (role === 'Studente') {
    return {
      title: lang === 'IT' ? 'Carriera, didattica e servizi rapidi' : 'Career, teaching and quick services',
      subtitle: lang === 'IT' 
        ? 'Medie, CFU, lezioni, esiti, ricevimenti e risorse per vivere il campus senza saltare tra mille app.'
        : 'Averages, CFU, classes, results, office hours and resources to experience the campus without jumping between apps.',
      accent: '#137C8B',
    };
  }
  if (role === 'Docente') {
    return {
      title: lang === 'IT' ? 'Corsi, comunicazioni e pubblicazioni' : 'Courses, communications and publications',
      subtitle: lang === 'IT'
        ? 'Gestione di lezioni, esiti, avvisi agli studenti e ricevimento in un unico pannello.'
        : 'Management of classes, results, announcements to students and office hours in a single panel.',
      accent: '#0F5132',
    };
  }
  if (role === 'PTA') {
    return {
      title: lang === 'IT' ? 'Turni, interventi e ticket' : 'Shifts, tasks and tickets',
      subtitle: lang === 'IT'
        ? 'Orario di lavoro, richieste di supporto e presa in carico degli interventi del campus.'
        : 'Working hours, support requests and taking charge of campus interventions.',
      accent: '#D96C4A',
    };
  }
  return {
    title: '',
    subtitle: '',
    accent: '#137C8B',
  };
};

const getNotificationText = (id: string, title: string, body: string, lang: 'IT' | 'EN') => {
  if (id === 'n-1') {
    return {
      title: lang === 'IT' ? 'Nuovo esito disponibile' : 'New result available',
      body: lang === 'IT' ? 'Basi di Dati ha pubblicato un risultato da accettare o rifiutare.' : 'Basi di Dati has published a grade to accept or reject.',
    };
  }
  if (id === 'n-2') {
    return {
      title: lang === 'IT' ? 'Manutenzione aula T25' : 'Room T25 maintenance',
      body: lang === 'IT' ? 'Richiesto controllo dei proiettori nel laboratorio T25.' : 'Projector check requested in Lab T25.',
    };
  }
  if (id === 'n-3') {
    return {
      title: lang === 'IT' ? 'Avviso di ateneo' : 'University notice',
      body: lang === 'IT' ? 'Domani la mensa centrale chiuderà alle 15:00 per manutenzione programmata.' : 'Tomorrow the main canteen will close at 15:00 for scheduled maintenance.',
    };
  }
  return { title, body };
};

const roleIcon: Record<Role, IconComponent> = {
  Studente: GraduationCap,
  Docente: BookOpen,
  PTA: Briefcase,
};

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  const mainScrollRef = useRef<ScrollView>(null);
  const [sectionPositions, setSectionPositions] = useState<Record<string, number>>({});
  const [pendingScrollSection, setPendingScrollSection] = useState<string | null>(null);

  const handleSectionLayout = (name: string, y: number) => {
    setSectionPositions((prev) => {
      const updated = { ...prev, [name]: y };
      if (pendingScrollSection === name) {
        setTimeout(() => {
          mainScrollRef.current?.scrollTo({ y, animated: true });
        }, 100);
        setPendingScrollSection(null);
      }
      return updated;
    });
  };

  const [booting, setBooting] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [rememberSession, setRememberSession] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>(demoUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [appLanguage, setAppLanguage] = useState<'IT' | 'EN'>('IT');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [weatherData, setWeatherData] = useState<{
    Fisciano: { temp: number; code: number; windspeed: number } | null;
    Baronissi: { temp: number; code: number; windspeed: number } | null;
  }>({ Fisciano: null, Baronissi: null });
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [ateneoNews, setAteneoNews] = useState<NewsItem[]>(news);

  useEffect(() => {
    const loadLiveNews = async () => {
      const live = await fetchUnisaNews(news);
      setAteneoNews(live);
    };
    loadLiveNews();
  }, []);

  const t = (key: keyof typeof translations.IT) => {
    const lang = currentUser ? currentUser.language : appLanguage;
    return translations[lang]?.[key] ?? translations.IT[key];
  };

  const [authDraft, setAuthDraft] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    department: 'Informatica',
    role: 'Studente' as Role,
    degreeCourse: '',
  });

  const [profileDraft, setProfileDraft] = useState<DraftProfile>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    department: '',
    degreeCourse: '',
    language: 'IT',
  });

  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [newExam, setNewExam] = useState({ course: '', cfu: '6', grade: '27' });
  const [tickets, setTickets] = useState<TicketType[]>(initialTickets);
  const [ticketDraft, setTicketDraft] = useState({
    title: '',
    location: '',
    body: '',
    priority: 'Media' as TicketType['priority'],
  });
  const [customNotifications, setCustomNotifications] = useState<NotificationItem[]>([]);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [teacherResult, setTeacherResult] = useState({ student: '', course: teacherCourses[0].name, grade: '28' });
  const [reception, setReception] = useState('Mercoledi 15:00 - 17:00, studio F3. Prenotazione via mail.');
  const [feedback, setFeedback] = useState('');
  const [selectedPointId, setSelectedPointId] = useState(campusPoints[0].id);

  useEffect(() => {
    const load = async () => {
      const [[, storedUsers], [, storedSession], [, storedExams], [, storedTickets], [, storedNotifications]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.users,
        STORAGE_KEYS.session,
        STORAGE_KEYS.exams,
        STORAGE_KEYS.tickets,
        STORAGE_KEYS.notifications,
      ]);

      const hydratedUsers = safeParse<UserProfile[]>(storedUsers, demoUsers);
      const hydratedExams = safeParse<Exam[]>(storedExams, initialExams);
      const hydratedTickets = safeParse<TicketType[]>(storedTickets, initialTickets);
      const hydratedNotifications = safeParse<NotificationItem[]>(storedNotifications, []);
      const sessionId = safeParse<string | null>(storedSession, null);

      setUsers(hydratedUsers);
      setExams(hydratedExams);
      setTickets(hydratedTickets);
      setCustomNotifications(hydratedNotifications);

      if (sessionId) {
        const sessionUser = hydratedUsers.find((user) => user.id === sessionId);
        if (sessionUser) {
          setCurrentUser(sessionUser);
          setProfileDraft(toProfileDraft(sessionUser));
          setAppLanguage(sessionUser.language || 'IT');
        }
      }

      setBooting(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!booting) {
      AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    }
  }, [booting, users]);

  useEffect(() => {
    if (!booting) {
      AsyncStorage.setItem(STORAGE_KEYS.exams, JSON.stringify(exams));
    }
  }, [booting, exams]);

  useEffect(() => {
    if (!booting) {
      AsyncStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(tickets));
    }
  }, [booting, tickets]);

  useEffect(() => {
    if (!booting) {
      AsyncStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(customNotifications));
    }
  }, [booting, customNotifications]);

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const resFisciano = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=40.77&longitude=14.80&current_weather=true',
      );
      const dataFisciano = await resFisciano.json();

      const resBaronissi = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=40.75&longitude=14.79&current_weather=true',
      );
      const dataBaronissi = await resBaronissi.json();

      if (dataFisciano?.current_weather && dataBaronissi?.current_weather) {
        setWeatherData({
          Fisciano: {
            temp: Math.round(dataFisciano.current_weather.temperature),
            code: dataFisciano.current_weather.weathercode,
            windspeed: dataFisciano.current_weather.windspeed,
          },
          Baronissi: {
            temp: Math.round(dataBaronissi.current_weather.temperature),
            code: dataBaronissi.current_weather.weathercode,
            windspeed: dataBaronissi.current_weather.windspeed,
          },
        });
      }
    } catch (e) {
      console.log('Error fetching weather:', e);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (!booting) {
      fetchWeather();
    }
  }, [booting]);

  const acceptedExams = useMemo(() => exams.filter((exam) => exam.status === 'Accettato'), [exams]);
  const careerStats = useMemo(() => {
    const completed = acceptedExams.length;
    const cfu = acceptedExams.reduce((sum, exam) => sum + exam.cfu, 0);
    const arithmetic = completed ? acceptedExams.reduce((sum, exam) => sum + exam.grade, 0) / completed : 0;
    const weighted = cfu ? acceptedExams.reduce((sum, exam) => sum + exam.grade * exam.cfu, 0) / cfu : 0;
    const progress = Math.min(100, Math.round((cfu / totalDegreeCfu) * 100));

    return { completed, cfu, arithmetic, weighted, progress };
  }, [acceptedExams]);

  const roleNotifications = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return [...customNotifications, ...notifications].filter(
      (item) => item.target === 'Tutti' || item.target === currentUser.role,
    );
  }, [customNotifications, currentUser]);

  const searchableActions = useMemo(
    () => [
      { title: 'Carriera universitaria', tab: 'role' as MainTab, keywords: 'media cfu esami studente' },
      { title: 'Orari lezioni e aule', tab: 'role' as MainTab, keywords: 'didattica calendario docente' },
      { title: 'Esiti esami', tab: 'role' as MainTab, keywords: 'accetta rifiuta voto risultato' },
      { title: 'News di ateneo', tab: 'campus' as MainTab, keywords: 'avvisi comunicazioni' },
      { title: 'Mensa settimanale', tab: 'campus' as MainTab, keywords: 'menu pasti pranzo cena' },
      { title: 'Mappa campus', tab: 'campus' as MainTab, keywords: 'fisciano baronissi luoghi punti interesse' },
      { title: 'Trasporti pubblici', tab: 'campus' as MainTab, keywords: 'bus fermate orari navetta' },
      { title: 'Ticket supporto', tab: 'services' as MainTab, keywords: 'pta richiesta intervento problema' },
      { title: 'FAQ e feedback', tab: 'services' as MainTab, keywords: 'domande sviluppatori segnalazioni' },
      { title: 'Profilo personale', tab: 'profile' as MainTab, keywords: 'dati account lingua elimina' },
    ],
    [],
  );

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return [];
    }

    return searchableActions.filter((action) => `${action.title} ${action.keywords}`.toLowerCase().includes(term));
  }, [searchTerm, searchableActions]);

  const selectedPoint = campusPoints.find((point) => point.id === selectedPointId) ?? campusPoints[0];

  const showNotice = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  };

  const syncUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setProfileDraft(toProfileDraft(updatedUser));
    setUsers((previous) => previous.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
  };

  const handleLogin = async (userOverride?: UserProfile) => {
    const loginUser =
      userOverride ??
      users.find(
        (user) =>
          user.email.toLowerCase() === authDraft.email.trim().toLowerCase() && user.password === authDraft.password,
      );

    if (!loginUser) {
      Alert.alert(t('loginFailedText'), t('invalidCredentialsText'));
      return;
    }

    setCurrentUser(loginUser);
    setProfileDraft(toProfileDraft(loginUser));
    setActiveTab('home');
    setAppLanguage(loginUser.language || 'IT');

    if (rememberSession) {
      await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(loginUser.id));
      showNotice(loginUser.language === 'IT' ? 'Accesso effettuato e sessione salvata' : 'Login successful and session saved');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.session);
      showNotice(loginUser.language === 'IT' ? `Accesso effettuato come ${loginUser.role}` : `Logged in as ${loginUser.role}`);
    }
  };

  const handleRegister = async () => {
    const isStudent = authDraft.role === 'Studente';
    if (
      !authDraft.name.trim() ||
      !authDraft.surname.trim() ||
      !authDraft.email.trim() ||
      !authDraft.password.trim() ||
      !authDraft.department.trim() ||
      (isStudent && !authDraft.degreeCourse.trim())
    ) {
      Alert.alert(
        appLanguage === 'IT' ? 'Campi obbligatori mancanti' : 'Missing mandatory fields',
        appLanguage === 'IT'
          ? "Compila tutti i campi contrassegnati con l'asterisco (*)."
          : 'Please fill in all fields marked with an asterisk (*).'
      );
      return;
    }

    if (!isInstitutionalEmail(authDraft.email)) {
      Alert.alert(t('invalidEmailText'), t('useInstEmailText'));
      return;
    }

    const emailLower = authDraft.email.trim().toLowerCase();
    if (isStudent && !emailLower.endsWith('@studenti.unisa.it')) {
      Alert.alert(
        appLanguage === 'IT' ? 'Email non valida' : 'Invalid email',
        appLanguage === 'IT'
          ? 'Per registrarsi come studente è obbligatorio utilizzare un indirizzo mail @studenti.unisa.it.'
          : 'To register as a student, you must use a @studenti.unisa.it email address.'
      );
      return;
    }

    if (!isStudent && !emailLower.endsWith('@unisa.it')) {
      Alert.alert(
        appLanguage === 'IT' ? 'Email non valida' : 'Invalid email',
        appLanguage === 'IT'
          ? 'Per registrarsi come docente o PTA è obbligatorio utilizzare un indirizzo mail @unisa.it.'
          : 'To register as a teacher or PTA, you must use a @unisa.it email address.'
      );
      return;
    }

    if (users.some((user) => user.email.toLowerCase() === emailLower)) {
      Alert.alert(t('accountExistsText'), t('emailExistsText'));
      return;
    }

    const newUser: UserProfile = {
      id: makeId('user'),
      name: capitalizeWords(authDraft.name),
      surname: capitalizeWords(authDraft.surname),
      email: authDraft.email.trim(),
      password: authDraft.password,
      role: authDraft.role,
      department: capitalizeWords(authDraft.department),
      degreeCourse: isStudent ? capitalizeWords(authDraft.degreeCourse) : undefined,
      phone: authDraft.phone.trim() || 'Non indicato',
      language: appLanguage,
    };

    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setProfileDraft(toProfileDraft(newUser));
    setActiveTab('home');

    if (rememberSession) {
      await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(newUser.id));
      showNotice(appLanguage === 'IT' ? 'Registrazione completata e sessione salvata' : 'Registration completed and session saved');
    } else {
      showNotice(t('registrationCompleteText'));
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.session);
    setCurrentUser(null);
    setActiveTab('home');
    setSearchTerm('');
    setAppLanguage('IT');
  };

  const handleAddExam = () => {
    const cfu = Number.parseInt(newExam.cfu, 10);
    const grade = Number.parseInt(newExam.grade, 10);

    if (!newExam.course.trim() || Number.isNaN(cfu) || Number.isNaN(grade) || cfu <= 0 || grade < 18 || grade > 30) {
      Alert.alert(t('invalidExamAlert'), t('invalidExamMsg'));
      return;
    }

    setExams((previous) => [
      {
        id: makeId('exam'),
        course: newExam.course.trim(),
        cfu,
        grade,
        date: 'Oggi',
        status: 'Accettato',
      },
      ...previous,
    ]);
    setNewExam({ course: '', cfu: '6', grade: '27' });
    showNotice(t('toastExamSavedMsg'));
  };

  const updateExamStatus = (id: string, status: ExamStatus) => {
    setExams((previous) => previous.map((exam) => (exam.id === id ? { ...exam, status } : exam)));
    showNotice(status === 'Accettato' ? t('toastExamAcceptedMsg') : t('toastExamRejectedMsg'));
  };

  const publishTeacherResult = () => {
    const grade = Number.parseInt(teacherResult.grade, 10);

    if (!teacherResult.student.trim() || Number.isNaN(grade) || grade < 18 || grade > 30) {
      Alert.alert(t('invalidPublishAlert'), t('invalidPublishMsg'));
      return;
    }

    setExams((previous) => [
      {
        id: makeId('published'),
        course: teacherResult.course,
        cfu: 6,
        grade,
        date: 'Oggi',
        status: 'Da valutare',
      },
      ...previous,
    ]);
    setCustomNotifications((previous) => [
      {
        id: makeId('notif'),
        title: 'Esito pubblicato',
        body: `${teacherResult.course}: pubblicato voto ${grade} per ${capitalizeWords(teacherResult.student)}.`,
        target: 'Studente',
        date: 'Oggi',
      },
      ...previous,
    ]);
    setTeacherResult({ student: '', course: teacherCourses[0].name, grade: '28' });
    showNotice(t('toastResultPublished'));
  };

  const sendTeacherMessage = () => {
    if (!teacherMessage.trim()) {
      Alert.alert(t('emptyMessageAlert'), t('emptyMessageMsg'));
      return;
    }

    setCustomNotifications((previous) => [
      {
        id: makeId('notice'),
        title: 'Comunicazione docente',
        body: teacherMessage.trim(),
        target: 'Studente',
        date: 'Oggi',
      },
      ...previous,
    ]);
    setTeacherMessage('');
    showNotice(t('toastAnnouncementSent'));
  };

  const sendFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert(t('feedbackEmptyAlert'), t('feedbackEmptyMsg'));
      return;
    }

    const emails = [
      'm.cucciniello31@studenti.unisa.it',
      'l.canzolino@studenti.unisa.it',
      'g.lupo1@studenti.unisa.it',
      'a.purcaro1@studenti.unisa.it'
    ];
    const subject = encodeURIComponent('Feedback UnisAllRound');
    const body = encodeURIComponent(feedback.trim());
    const mailtoUrl = `mailto:${emails.join(',')}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailtoUrl);
      setFeedback('');
      showNotice(t('toastFeedbackSent'));
    } catch (err) {
      Alert.alert(
        appLanguage === 'IT' ? 'Errore' : 'Error',
        appLanguage === 'IT' 
          ? 'Impossibile aprire l\'applicazione email. Assicurati che un client mail sia configurato.'
          : 'Could not open email client. Make sure an email client is configured.'
      );
    }
  };

  const createTicket = () => {
    if (!ticketDraft.title.trim() || !ticketDraft.location.trim() || !ticketDraft.body.trim()) {
      Alert.alert(t('ticketIncompleteAlert'), t('ticketIncompleteMsg'));
      return;
    }

    setTickets((previous) => [
      {
        id: makeId('ticket'),
        title: ticketDraft.title.trim(),
        requester: currentUser ? `${capitalizeWords(currentUser.name)} ${capitalizeWords(currentUser.surname)}` : 'Utente',
        location: ticketDraft.location.trim(),
        body: ticketDraft.body.trim(),
        status: 'Aperto',
        priority: ticketDraft.priority,
        date: new Date().toISOString().split('T')[0],
      },
      ...previous,
    ]);
    setCustomNotifications((previous) => [
      {
        id: makeId('ticket-notif'),
        title: 'Nuovo ticket di supporto',
        body: `${ticketDraft.title.trim()} - ${ticketDraft.location.trim()}`,
        target: 'PTA',
        date: 'Oggi',
      },
      ...previous,
    ]);
    setTicketDraft({ title: '', location: '', body: '', priority: 'Media' });
    showNotice(t('toastTicketCreated'));
  };

  const updateTicketStatus = (id: string, status: TicketType['status']) => {
    setTickets((previous) => previous.map((ticketItem) => (ticketItem.id === id ? { ...ticketItem, status } : ticketItem)));
    showNotice(status === 'In carico' ? t('toastTicketAssigned') : status === 'Chiuso' ? t('toastTicketClosed') : `Ticket ${status}`);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setShowNotificationsModal(false);
    const titleLower = item.title.toLowerCase();
    const bodyLower = item.body.toLowerCase();
    
    let targetTab: MainTab = 'home';
    let targetSection: string | null = null;
    
    if (titleLower.includes('mensa') || bodyLower.includes('mensa') || item.id === 'n-3') {
      targetTab = 'campus';
      targetSection = 'mensa';
    } else if (titleLower.includes('esito') || bodyLower.includes('esito') || item.id === 'n-1') {
      targetTab = 'home';
      targetSection = 'esiti';
    } else if (titleLower.includes('ticket') || bodyLower.includes('ticket') || item.id === 'n-2') {
      targetTab = 'home';
      targetSection = 'tickets';
    } else {
      targetTab = 'home';
    }
    
    setActiveTab(targetTab);
    
    if (targetSection) {
      setPendingScrollSection(targetSection);
      const y = sectionPositions[targetSection];
      if (typeof y === 'number') {
        setTimeout(() => {
          mainScrollRef.current?.scrollTo({ y, animated: true });
          setPendingScrollSection(null);
        }, 200);
      }
    }
  };

  const saveProfile = () => {
    if (!currentUser) {
      return;
    }

    const isStudent = currentUser.role === 'Studente';

    if (
      !profileDraft.name.trim() ||
      !profileDraft.surname.trim() ||
      !profileDraft.email.trim() ||
      !profileDraft.department.trim() ||
      (isStudent && !profileDraft.degreeCourse?.trim())
    ) {
      Alert.alert(
        appLanguage === 'IT' ? 'Dati incompleti' : 'Incomplete data',
        appLanguage === 'IT'
          ? 'Compila tutti i campi obbligatori.'
          : 'Please fill in all mandatory fields.'
      );
      return;
    }

    if (!isInstitutionalEmail(profileDraft.email)) {
      Alert.alert(t('invalidProfile'), t('checkProfileFields'));
      return;
    }

    const emailLower = profileDraft.email.trim().toLowerCase();
    if (isStudent && !emailLower.endsWith('@studenti.unisa.it')) {
      Alert.alert(
        appLanguage === 'IT' ? 'Email non valida' : 'Invalid email',
        appLanguage === 'IT'
          ? 'Gli studenti devono utilizzare un indirizzo mail @studenti.unisa.it.'
          : 'Students must use a @studenti.unisa.it email address.'
      );
      return;
    }

    if (!isStudent && !emailLower.endsWith('@unisa.it')) {
      Alert.alert(
        appLanguage === 'IT' ? 'Email non valida' : 'Invalid email',
        appLanguage === 'IT'
          ? 'Il personale deve utilizzare un indirizzo mail @unisa.it.'
          : 'Staff must use a @unisa.it email address.'
      );
      return;
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      name: capitalizeWords(profileDraft.name),
      surname: capitalizeWords(profileDraft.surname),
      email: profileDraft.email.trim(),
      phone: profileDraft.phone.trim(),
      department: capitalizeWords(profileDraft.department),
      degreeCourse: isStudent ? capitalizeWords(profileDraft.degreeCourse || '') : undefined,
      language: profileDraft.language,
      shifts: currentUser.role === 'PTA' ? profileDraft.shifts : undefined,
    };

    syncUser(updatedUser);
    showNotice(t('profileUpdated'));
  };

  const deleteAccount = () => {
    if (!currentUser) {
      return;
    }

    Alert.alert(t('confirmDeleteTitle'), t('confirmDeleteMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          setUsers((previous) => previous.filter((user) => user.id !== currentUser.id));
          await handleLogout();
          showNotice(t('delete'));
        },
      },
    ]);
  };

  const openExternal = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(t('linkNotAvailable'), t('linkError'));
    }
  };

  if (booting) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.boot}>
          <StatusBar style="dark" />
          <Text style={styles.brand}>UnisAllRound</Text>
          <Text style={styles.mutedText}>{t('loadingSession')}</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
          <SafeAreaView style={styles.authShell}>
            <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
              <View style={styles.authHeader}>
                <View style={styles.logoMark}>
                  <GraduationCap color={colors.surface} size={28} strokeWidth={2.4} />
                </View>
                <Text style={styles.brand}>UnisAllRound</Text>
                <Text style={styles.authSubtitle}>{t('authSubtitleText')}</Text>
              </View>

              <View style={styles.authCard}>
                <SegmentedControl
                  options={[
                    { value: 'login', label: t('login') },
                    { value: 'register', label: t('register') },
                  ]}
                  value={authMode}
                  onChange={(value) => setAuthMode(value as AuthMode)}
                />

                {authMode === 'register' ? (
                  <View style={styles.formGrid}>
                    <Field label={t('name')} required={true} value={authDraft.name} onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, name: value }))} />
                    <Field
                      label={t('surname')}
                      required={true}
                      value={authDraft.surname}
                      onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, surname: value }))}
                    />
                  </View>
                ) : null}

                <Field
                  label={t('email')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  required={authMode === 'register'}
                  value={authDraft.email}
                  onChangeText={(value) => {
                    setAuthDraft((draft) => {
                      const updated = { ...draft, email: value };
                      if (authMode === 'register') {
                        if (value.toLowerCase().endsWith('@studenti.unisa.it')) {
                          updated.role = 'Studente';
                        } else if (value.toLowerCase().endsWith('@unisa.it')) {
                          if (updated.role === 'Studente') {
                            updated.role = 'Docente';
                          }
                        }
                      }
                      return updated;
                    });
                  }}
                />
                <Field
                  label={t('password')}
                  secureTextEntry
                  required={authMode === 'register'}
                  value={authDraft.password}
                  onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, password: value }))}
                />

                {authMode === 'register' ? (
                  <>
                    <Field
                      label={authDraft.role === 'Studente' ? (appLanguage === 'IT' ? 'Dipartimento' : 'Department') : t('department')}
                      value={authDraft.department}
                      onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, department: value }))}
                      required={true}
                    />
                    {authDraft.role === 'Studente' ? (
                      <Field
                        label={appLanguage === 'IT' ? 'Corso di laurea' : 'Degree Course'}
                        value={authDraft.degreeCourse}
                        onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, degreeCourse: value }))}
                        required={true}
                      />
                    ) : null}
                    <Field
                      label={t('phone')}
                      keyboardType="phone-pad"
                      value={authDraft.phone}
                      onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, phone: value }))}
                    />
                    <Text style={styles.inputLabel}>{t('role')}<Text style={{ color: colors.danger }}> *</Text></Text>
                    <RolePicker value={authDraft.role} onChange={(role) => setAuthDraft((draft) => ({ ...draft, role }))} />
                  </>
                ) : null}

                <Pressable style={styles.checkboxRow} onPress={() => setRememberSession((value) => !value)}>
                  <View style={[styles.checkbox, rememberSession && styles.checkboxOn]}>
                    {rememberSession ? <CheckCircle2 color={colors.surface} size={16} /> : null}
                  </View>
                  <Text style={styles.checkboxText}>{t('rememberMe')}</Text>
                </Pressable>

                <ActionButton
                  label={authMode === 'login' ? t('submitLogin') : t('submitRegister')}
                  icon={authMode === 'login' ? ShieldCheck : Save}
                  onPress={authMode === 'login' ? () => handleLogin() : handleRegister}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    );
  }

  const ActiveRoleIcon = roleIcon[currentUser.role];

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.appShell}>
        <View style={styles.topBar}>
          <View style={styles.topTitleBlock}>
            <Text style={styles.smallCaps}>{t('univSalerno')}</Text>
            <Text style={styles.appTitle}>UnisAllRound</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setShowNotificationsModal(true)} style={styles.bellButton}>
              <Bell color={colors.ink} size={20} />
              {roleNotifications.length > 0 ? (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{roleNotifications.length}</Text>
                </View>
              ) : null}
            </Pressable>
            <View style={styles.roleBadge}>
              <ActiveRoleIcon color={getRoleCopy(currentUser.role, currentUser?.language || appLanguage).accent} size={18} />
              <Text style={[styles.roleBadgeText, { color: getRoleCopy(currentUser.role, currentUser?.language || appLanguage).accent }]}>
                {getRoleLabel(currentUser.role, currentUser?.language || appLanguage)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.searchShell}>
          <Search color={colors.muted} size={18} />
          <TextInput
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {searchResults.length ? (
          <View style={styles.searchResults}>
            {searchResults.map((item) => (
              <Pressable
                key={item.title}
                style={styles.searchResultRow}
                onPress={() => {
                  if (item.tab === 'role') {
                    setActiveTab('home');
                  } else {
                    setActiveTab(item.tab);
                  }
                  setSearchTerm('');
                }}
              >
                <Text style={styles.searchResultTitle}>{item.title}</Text>
                <Text style={styles.searchResultMeta}>{t('searchResultOpen')}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <ScrollView ref={mainScrollRef} contentContainerStyle={[styles.content, isWide && styles.contentWide]} showsVerticalScrollIndicator={false}>
          {activeTab === 'home' ? (
            <HomeScreen
              user={currentUser}
              isWide={isWide}
              careerStats={careerStats}
              onOpenTab={setActiveTab}
              exams={exams}
              newExam={newExam}
              setNewExam={setNewExam}
              lessons={lessons}
              onAddExam={handleAddExam}
              onExamStatus={updateExamStatus}
              onOpenExternal={openExternal}
              t={t}
              teacherMessage={teacherMessage}
              setTeacherMessage={setTeacherMessage}
              teacherResult={teacherResult}
              setTeacherResult={setTeacherResult}
              reception={reception}
              setReception={setReception}
              onPublishResult={publishTeacherResult}
              onSendTeacherMessage={sendTeacherMessage}
              tickets={tickets}
              onTicketStatus={updateTicketStatus}
              onSectionLayout={handleSectionLayout}
            />
          ) : null}
          {activeTab === 'campus' ? (
            <CampusScreen
              news={ateneoNews}
              selectedPoint={selectedPoint}
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              onOpenExternal={openExternal}
              weatherData={weatherData}
              loadingWeather={loadingWeather}
              t={t}
              lang={currentUser?.language || appLanguage}
              onSectionLayout={handleSectionLayout}
            />
          ) : null}
          {activeTab === 'services' ? (
            <ServicesScreen
              feedback={feedback}
              setFeedback={setFeedback}
              ticketDraft={ticketDraft}
              setTicketDraft={setTicketDraft}
              onFeedback={sendFeedback}
              onCreateTicket={createTicket}
              onOpenExternal={openExternal}
              t={t}
            />
          ) : null}
          {activeTab === 'profile' ? (
            <ProfileScreen
              user={currentUser}
              draft={profileDraft}
              setDraft={setProfileDraft}
              onLanguageChange={(newLang) => {
                setProfileDraft((current) => ({ ...current, language: newLang }));
                if (currentUser) {
                  const updated = { ...currentUser, language: newLang };
                  setCurrentUser(updated);
                  setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
                  AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users.map((u) => (u.id === currentUser.id ? updated : u))));
                }
                setAppLanguage(newLang);
                showNotice(newLang === 'IT' ? 'Lingua impostata su Italiano' : 'Language set to English');
              }}
              onSave={saveProfile}
              onDelete={deleteAccount}
              onLogout={handleLogout}
              t={t}
            />
          ) : null}
        </ScrollView>

        <BottomNav
          activeTab={activeTab}
          onChange={setActiveTab}
          role={currentUser.role}
          t={t}
          lang={currentUser?.language || appLanguage}
        />
        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}

        {/* Notifications Modal */}
        <Modal
          visible={showNotificationsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotificationsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('notifications')}</Text>
                <Pressable style={styles.modalCloseBtn} onPress={() => setShowNotificationsModal(false)}>
                  <XCircle color={colors.ink} size={24} />
                </Pressable>
              </View>
              <ScrollView style={styles.modalScroll}>
                {roleNotifications.length === 0 ? (
                  <Text style={styles.emptyNotificationsText}>{t('noNotifications')}</Text>
                ) : (
                  roleNotifications.map((item) => {
                    const translated = getNotificationText(item.id, item.title, item.body, currentUser?.language || appLanguage);
                    return (
                      <ListRow
                        key={item.id}
                        icon={Bell}
                        title={translated.title}
                        subtitle={translated.body}
                        meta={item.date}
                        compact
                        onPress={() => handleNotificationClick(item)}
                      />
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function toProfileDraft(user: UserProfile): DraftProfile {
  return {
    name: user.name,
    surname: user.surname,
    email: user.email,
    phone: user.phone,
    department: user.department,
    degreeCourse: user.degreeCourse || '',
    language: user.language,
    shifts: user.shifts || ['', '', '', '', ''],
  };
}

function HomeScreen({
  user,
  isWide,
  careerStats,
  onOpenTab,
  exams,
  newExam,
  setNewExam,
  lessons,
  onAddExam,
  onExamStatus,
  onOpenExternal,
  t,
  teacherMessage,
  setTeacherMessage,
  teacherResult,
  setTeacherResult,
  reception,
  setReception,
  onPublishResult,
  onSendTeacherMessage,
  tickets,
  onTicketStatus,
  onSectionLayout,
}: {
  user: UserProfile;
  isWide: boolean;
  careerStats: { completed: number; cfu: number; arithmetic: number; weighted: number; progress: number };
  onOpenTab: (tab: MainTab) => void;
  exams: Exam[];
  newExam: { course: string; cfu: string; grade: string };
  setNewExam: Dispatch<SetStateAction<{ course: string; cfu: string; grade: string }>>;
  lessons: Lesson[];
  onAddExam: () => void;
  onExamStatus: (id: string, status: ExamStatus) => void;
  onOpenExternal: (url: string) => void;
  t: (key: keyof typeof translations.IT) => string;
  teacherMessage: string;
  setTeacherMessage: (value: string) => void;
  teacherResult: { student: string; course: string; grade: string };
  setTeacherResult: Dispatch<SetStateAction<{ student: string; course: string; grade: string }>>;
  reception: string;
  setReception: (value: string) => void;
  onPublishResult: () => void;
  onSendTeacherMessage: () => void;
  tickets: TicketType[];
  onTicketStatus: (id: string, status: TicketType['status']) => void;
  onSectionLayout?: (name: string, y: number) => void;
}) {
  const RoleIcon = roleIcon[user.role];
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<'Lunedì' | 'Martedì' | 'Mercoledì' | 'Giovedì' | 'Venerdì'>('Lunedì');
  const [slots, setSlots] = useState<Array<{ day: string; time: string; desc: string }>>(() => {
    return [
      { day: 'Mercoledì', time: '15:00', desc: 'Studio F3. Prenotazione via mail.' }
    ];
  });
  const [editingSlot, setEditingSlot] = useState<{ day: string; time: string; desc: string } | null>(null);
  const [editDesc, setEditDesc] = useState('');

  const syncSlotsToParent = (updatedSlots: Array<{ day: string; time: string; desc: string }>) => {
    setSlots(updatedSlots);
    if (updatedSlots.length === 0) {
      setReception(user.language === 'IT' ? 'Nessun ricevimento programmato' : 'No office hours scheduled');
    } else {
      const sorted = [...updatedSlots].sort((a, b) => {
        const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
        const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.time.localeCompare(b.time);
      });
      const summary = sorted.map(s => `${s.day} ${s.time} (${s.desc})`).join(' · ');
      setReception(summary);
    }
  };

  const [archiveExpanded, setArchiveExpanded] = useState(false);
  const [filterDay, setFilterDay] = useState('Tutti');
  const [filterMonth, setFilterMonth] = useState('Tutti');
  const [filterYear, setFilterYear] = useState('Tutti');
  const [pickerConfig, setPickerConfig] = useState<{ visible: boolean; type: 'day' | 'month' | 'year'; options: string[] } | null>(null);
  return (
    <View>
      <View style={styles.cleanGreeting}>
        <Text style={styles.greetingKicker}>{t('welcomeBack')}</Text>
        <Text style={styles.greetingName}>{capitalizeWords(user.name)} {capitalizeWords(user.surname)}</Text>
      </View>

      <View style={[styles.quickGrid, isWide && styles.quickGridWide]}>
        {user.role === 'Studente' ? (
          <>
            <StatCard label={t('passedExams')} value={`${careerStats.completed}`} icon={CheckCircle2} tone="green" />
            <StatCard label={t('weightedAvg')} value={formatAverage(careerStats.weighted)} icon={GraduationCap} tone="blue" />
            <StatCard label={t('arithmeticAvg')} value={formatAverage(careerStats.arithmetic)} icon={Calculator} tone="purple" />
            <StatCard label={t('acquiredCfu')} value={`${careerStats.cfu}/${totalDegreeCfu}`} icon={BookOpen} tone="amber" />
            <StatCard label={t('progress')} value={`${careerStats.progress}%`} icon={Trophy} tone="coral" />
          </>
        ) : null}
        {user.role === 'Docente' ? (
          <>
            <StatCard label={t('activeCourses')} value={`${teacherCourses.length}`} icon={BookOpen} tone="green" />
            <StatCard label={t('supervisedStudents')} value="128" icon={Users} tone="blue" />
            <StatCard label={t('announcementsSent')} value="4" icon={Megaphone} tone="amber" />
            <StatCard label={t('officeHours')} value="2h" icon={CalendarDays} tone="coral" />
          </>
        ) : null}
        {user.role === 'PTA' ? (
          <>
            <StatCard label={t('openTickets')} value="2" icon={Ticket} tone="coral" />
            <StatCard label={t('tasksToday')} value="5" icon={ClipboardList} tone="blue" />
            <StatCard
              label={t('workShift')}
              value={(() => {
                if (!user.shifts || !user.shifts.some(s => s.trim())) return '-';
                const dayIdx = new Date().getDay();
                if (dayIdx >= 1 && dayIdx <= 5) {
                  return user.shifts[dayIdx - 1] || '-';
                }
                return '-';
              })()}
              icon={Briefcase}
              tone="green"
            />
          </>
        ) : null}
      </View>

      {user.role === 'Studente' ? (
        <View style={{ marginTop: 10 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('insertExam')}</Text>
            <Field
              label={t('courseLabel')}
              value={newExam.course}
              onChangeText={(value) => setNewExam((draft) => ({ ...draft, course: value }))}
            />
            <View style={styles.formGrid}>
              <Field
                label={t('cfuLabel')}
                keyboardType="number-pad"
                value={newExam.cfu}
                onChangeText={(value) => setNewExam((draft) => ({ ...draft, cfu: value }))}
              />
              <Field
                label={t('gradeLabel')}
                keyboardType="number-pad"
                value={newExam.grade}
                onChangeText={(value) => setNewExam((draft) => ({ ...draft, grade: value }))}
              />
            </View>
            <ActionButton label={t('saveCareerData')} icon={Plus} onPress={onAddExam} />
          </View>

          <SectionTitle title={t('teachingSection')} subtitle={t('teachingSubtitle')} />
          {lessons.map((lesson) => {
            let dayTrans = lesson.day;
            const lang = user.language || 'IT';
            if (lang === 'EN') {
              if (lesson.day === 'Lunedi') dayTrans = 'Monday';
              if (lesson.day === 'Martedi') dayTrans = 'Tuesday';
              if (lesson.day === 'Giovedi') dayTrans = 'Thursday';
            }
            return (
              <ListRow
                key={lesson.id}
                icon={CalendarDays}
                title={`${dayTrans} - ${lesson.course}`}
                subtitle={`${lesson.time} · ${lesson.room} · ${lesson.teacher}`}
              />
            );
          })}

          <View style={styles.card} onLayout={(e) => onSectionLayout?.('esiti', e.nativeEvent.layout.y)}>
            <Text style={styles.cardTitle}>{t('publishedResults')}</Text>
            {exams.map((exam) => (
              <View key={exam.id} style={styles.examRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.rowTitle}>{exam.course}</Text>
                  <Text style={styles.rowSubtitle}>
                    {exam.grade}/30 · {exam.cfu} CFU · {exam.status === 'Da valutare' ? t('accept') + '/' + t('reject') : exam.status}
                  </Text>
                </View>
                {exam.status === 'Da valutare' ? (
                  <View style={styles.rowActions}>
                    <IconButton label={t('accept')} icon={CheckCircle2} onPress={() => onExamStatus(exam.id, 'Accettato')} />
                    <IconButton label={t('reject')} icon={XCircle} onPress={() => onExamStatus(exam.id, 'Rifiutato')} danger />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {user.role === 'Docente' ? (
        <View style={{ marginTop: 10 }}>
          <SectionTitle title={t('teacherArea')} subtitle={t('teacherAreaSubtitle')} />
          {teacherCourses.map((course) => (
            <ListRow
              key={course.id}
              icon={BookOpen}
              title={course.name}
              subtitle={`${course.students} ${user.language === 'IT' ? 'studenti' : 'students'} · ${user.language === 'IT' ? 'Materiale' : 'Materials'}: ${course.material}`}
            />
          ))}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('publishExamResult')}</Text>
            
            <Text style={styles.inputLabel}>{t('courseLabel')}</Text>
            <SegmentedControl
              options={teacherCourses.map((c) => ({ value: c.name, label: c.name }))}
              value={teacherResult.course}
              onChange={(value) => {
                setTeacherResult((prev) => ({ ...prev, course: value, student: '' }));
              }}
            />

            {(() => {
              const currentCourseId = teacherCourses.find(c => c.name === teacherResult.course)?.id || 'tc-1';
              const enrolledStudents = enrolledStudentsByCourse[currentCourseId] || [];
              return (
                <>
                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                    {user.language === 'IT' ? 'Studente (Matricola) *' : 'Student (Matricola) *'}
                  </Text>
                  <View style={{ maxHeight: 150, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.background, padding: 8, marginVertical: 8 }}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 130 }}>
                      {enrolledStudents.map((st) => {
                        const studentFullName = `${st.name} ${st.surname}`;
                        const isSelected = teacherResult.student === `${studentFullName} (${st.matricola})`;
                        return (
                          <Pressable
                            key={st.matricola}
                            onPress={() => {
                              setTeacherResult((prev) => ({ ...prev, student: `${studentFullName} (${st.matricola})` }));
                            }}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingVertical: 8,
                              paddingHorizontal: 10,
                              backgroundColor: isSelected ? colors.mint : 'transparent',
                              borderRadius: radii.sm,
                              marginBottom: 4
                            }}
                          >
                            <Text style={{ color: colors.ink, fontWeight: isSelected ? '700' : '400' }}>
                              {studentFullName} ({st.matricola})
                            </Text>
                            {isSelected ? <CheckCircle2 color={colors.forest} size={16} /> : null}
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                </>
              );
            })()}

            <Field
              label={t('gradeLabel')}
              keyboardType="number-pad"
              value={teacherResult.grade}
              onChangeText={(value) => setTeacherResult((draft) => ({ ...draft, grade: value }))}
            />
            <ActionButton label={t('publishResultBtn')} icon={Send} onPress={onPublishResult} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('announcementsToStudents')}</Text>
            <Field label={t('messageLabel')} multiline value={teacherMessage} onChangeText={setTeacherMessage} />
            <ActionButton label={t('sendAnnouncementBtn')} icon={Megaphone} onPress={onSendTeacherMessage} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('officeHoursSetup')}</Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 12, lineHeight: 20 }}>
              {reception}
            </Text>
            <ActionButton
              label={user.language === 'IT' ? 'Gestisci Ricevimenti (Calendario)' : 'Manage Office Hours (Calendar)'}
              icon={CalendarDays}
              onPress={() => setCalendarVisible(true)}
            />
          </View>

          {/* Office Hours Calendar Modal */}
          <Modal visible={calendarVisible} animationType="slide" transparent={false} onRequestClose={() => setCalendarVisible(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
              <View style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>
                  {user.language === 'IT' ? 'Calendario Ricevimenti' : 'Office Hours Calendar'}
                </Text>
                <Pressable onPress={() => setCalendarVisible(false)} style={{ padding: 6 }}>
                  <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 15 }}>
                    {user.language === 'IT' ? 'Chiudi' : 'Close'}
                  </Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={{ padding: 18 }}>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
                  {user.language === 'IT' 
                    ? 'Seleziona un giorno della settimana e fai clic su una fascia oraria per aggiungere o modificare una sessione di ricevimento.'
                    : 'Select a day of the week and click on a time slot to add or update an office hours session.'}
                </Text>

                {/* Days Tabs Selector */}
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
                  {(['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'] as const).map((day) => {
                    const isActive = selectedDayTab === day;
                    const scheduledCount = slots.filter(s => s.day === day).length;
                    return (
                      <Pressable
                        key={day}
                        onPress={() => setSelectedDayTab(day)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: radii.md,
                          backgroundColor: isActive ? colors.forest : colors.surface,
                          borderWidth: 1.5,
                          borderColor: isActive ? colors.forest : colors.border,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Text style={{ color: isActive ? colors.surface : colors.ink, fontWeight: '700', fontSize: 13 }}>
                          {day.substring(0, 3)}
                        </Text>
                        {scheduledCount > 0 ? (
                          <View style={{ backgroundColor: isActive ? colors.surface : colors.forest, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                            <Text style={{ color: isActive ? colors.forest : colors.surface, fontSize: 10, fontWeight: '800' }}>
                              {scheduledCount}
                            </Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Hours Slots List */}
                <View style={{ gap: 10 }}>
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((hour) => {
                    const currentSlot = slots.find(s => s.day === selectedDayTab && s.time === hour);
                    return (
                      <Pressable
                        key={hour}
                        onPress={() => {
                          setEditingSlot({ day: selectedDayTab, time: hour, desc: currentSlot?.desc || '' });
                          setEditDesc(currentSlot?.desc || '');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 14,
                          borderRadius: radii.md,
                          backgroundColor: currentSlot ? colors.mint : colors.surface,
                          borderWidth: 1.5,
                          borderColor: currentSlot ? colors.forest : colors.border,
                        }}
                      >
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                            {hour}
                          </Text>
                          {currentSlot ? (
                            <Text style={{ fontSize: 14, color: colors.forest, marginTop: 4, fontWeight: '600' }}>
                              {currentSlot.desc}
                            </Text>
                          ) : (
                            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                              {user.language === 'IT' ? 'Libero (Clicca per aggiungere)' : 'Free (Click to add)'}
                            </Text>
                          )}
                        </View>
                        {currentSlot ? (
                          <CheckCircle2 color={colors.forest} size={20} />
                        ) : (
                          <Plus color={colors.muted} size={18} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </SafeAreaView>

            {/* Edit Slot Sub-Modal */}
            {editingSlot ? (
              <Modal transparent visible animationType="fade" onRequestClose={() => setEditingSlot(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 18 }}>
                  <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: 20, borderWidth: 1.5, borderColor: colors.border }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 4 }}>
                      {user.language === 'IT' ? 'Configura Ricevimento' : 'Configure Office Hours'}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
                      {editingSlot.day} - {editingSlot.time}
                    </Text>

                    <Field
                      label={user.language === 'IT' ? 'Breve descrizione' : 'Short description'}
                      placeholder="e.g. Studio F3, Blocco F o Online"
                      value={editDesc}
                      onChangeText={setEditDesc}
                    />

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                      <Pressable
                        onPress={() => {
                          const filtered = slots.filter(s => !(s.day === editingSlot.day && s.time === editingSlot.time));
                          syncSlotsToParent(filtered);
                          setEditingSlot(null);
                        }}
                        style={{ flex: 1, padding: 12, borderRadius: radii.md, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ color: colors.danger, fontWeight: '700' }}>
                          {user.language === 'IT' ? 'Rimuovi' : 'Remove'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setEditingSlot(null);
                        }}
                        style={{ padding: 12, borderRadius: radii.md, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ color: colors.ink, fontWeight: '700' }}>
                          {user.language === 'IT' ? 'Annulla' : 'Cancel'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (!editDesc.trim()) {
                            Alert.alert(
                              user.language === 'IT' ? 'Descrizione vuota' : 'Empty description',
                              user.language === 'IT' ? 'Inserisci una breve nota per gli studenti.' : 'Please enter a short note for the students.'
                            );
                            return;
                          }
                          const filtered = slots.filter(s => !(s.day === editingSlot.day && s.time === editingSlot.time));
                          const newSlots = [...filtered, { day: editingSlot.day, time: editingSlot.time, desc: editDesc.trim() }];
                          syncSlotsToParent(newSlots);
                          setEditingSlot(null);
                        }}
                        style={{ flex: 1, padding: 12, borderRadius: radii.md, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ color: colors.surface, fontWeight: '700' }}>
                          {user.language === 'IT' ? 'Salva' : 'Save'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>
            ) : null}
          </Modal>
        </View>
      ) : null}

      {user.role === 'PTA' ? (
        <View style={{ marginTop: 10 }}>
          <SectionTitle title={t('ptaArea')} subtitle={t('ptaAreaSubtitle')} />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('weeklyShift')}</Text>
            {user.shifts && user.shifts.some(s => s.trim()) ? (
              ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'].map((day, idx) => {
                const shiftVal = user.shifts?.[idx];
                if (!shiftVal?.trim()) return null;
                return (
                  <ListRow key={day} icon={CalendarDays} title={`${day}: ${shiftVal}`} subtitle={t('shiftSubtitle')} compact />
                );
              })
            ) : (
              <Text style={{ color: colors.muted, fontStyle: 'italic', paddingVertical: 8 }}>
                {user.language === 'IT' ? 'Nessun turno di lavoro inserito.' : 'No work shifts configured.'}
              </Text>
            )}
          </View>

          <View onLayout={(e) => onSectionLayout?.('tickets', e.nativeEvent.layout.y)}>
            <SectionTitle title={t('pendingRequests')} subtitle={t('pendingRequestsSubtitle')} />
            {tickets.filter((t) => t.status !== 'Chiuso').map((ticketItem) => (
              <View key={ticketItem.id} style={styles.card}>
                <View style={styles.ticketHeader}>
                  <View style={styles.flexOne}>
                    <Text style={styles.cardTitle}>{ticketItem.title}</Text>
                    <Text style={styles.rowSubtitle}>{ticketItem.location} · {t('ticketPriorityLabel')} {ticketItem.priority}</Text>
                  </View>
                  <StatusBadge value={ticketItem.status} />
                </View>
                <Text style={styles.bodyText}>{ticketItem.body}</Text>
                <View style={styles.rowActions}>
                  <IconButton label={t('takeTicket')} icon={CheckCircle2} onPress={() => onTicketStatus(ticketItem.id, 'In carico')} />
                  <IconButton label={user.language === 'IT' ? 'Sospendi' : 'Suspend'} icon={Clock} onPress={() => onTicketStatus(ticketItem.id, 'In sospeso')} />
                  <IconButton label={t('closeTicket')} icon={ShieldCheck} onPress={() => onTicketStatus(ticketItem.id, 'Chiuso')} />
                </View>
              </View>
            ))}
          </View>

          {/* Ticket Archive Section */}
          <View style={{ marginTop: 16 }}>
            <Pressable
              style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, marginVertical: 0 }]}
              onPress={() => setArchiveExpanded(!archiveExpanded)}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                {user.language === 'IT' ? '📁 Archivio Storico Richieste' : '📁 Request History Archive'}
              </Text>
              {archiveExpanded ? <ChevronDown color={colors.forest} size={20} /> : <ChevronRight color={colors.forest} size={20} />}
            </Pressable>

            {archiveExpanded ? (
              <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: 12, marginTop: 4, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 8 }}>
                  {user.language === 'IT' ? 'FILTRA PER DATA:' : 'FILTER BY DATE:'}
                </Text>
                
                {/* Filter Controls Row */}
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                  {/* Day Picker */}
                  <Pressable
                    onPress={() => setPickerConfig({
                      visible: true,
                      type: 'day',
                      options: ['Tutti', ...Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))]
                    })}
                    style={{ flex: 1, padding: 10, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }} numberOfLines={1}>
                      {user.language === 'IT' ? `GG: ${filterDay}` : `Day: ${filterDay}`}
                    </Text>
                  </Pressable>

                  {/* Month Picker */}
                  <Pressable
                    onPress={() => setPickerConfig({
                      visible: true,
                      type: 'month',
                      options: ['Tutti', ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))]
                    })}
                    style={{ flex: 1, padding: 10, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }} numberOfLines={1}>
                      {user.language === 'IT' ? `MM: ${filterMonth}` : `Month: ${filterMonth}`}
                    </Text>
                  </Pressable>

                  {/* Year Picker */}
                  <Pressable
                    onPress={() => setPickerConfig({
                      visible: true,
                      type: 'year',
                      options: ['Tutti', '2025', '2026', '2027']
                    })}
                    style={{ flex: 1, padding: 10, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }} numberOfLines={1}>
                      {user.language === 'IT' ? `AA: ${filterYear}` : `Year: ${filterYear}`}
                    </Text>
                  </Pressable>
                </View>

                {/* Filtered Tickets List */}
                <View style={{ gap: 8 }}>
                  {(() => {
                    const filtered = tickets.filter((ticket) => {
                      if (!ticket.date) return false;
                      const y = ticket.date.substring(0, 4);
                      const m = ticket.date.substring(5, 7);
                      const d = ticket.date.substring(8, 10);
                      
                      if (filterYear !== 'Tutti' && y !== filterYear) return false;
                      if (filterMonth !== 'Tutti' && m !== filterMonth) return false;
                      if (filterDay !== 'Tutti' && d !== filterDay) return false;
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <Text style={{ color: colors.muted, fontStyle: 'italic', paddingVertical: 10, textAlign: 'center' }}>
                          {user.language === 'IT' ? 'Nessun ticket corrispondente ai filtri.' : 'No tickets matching filters.'}
                        </Text>
                      );
                    }

                    return filtered.map((ticketItem) => (
                      <View key={ticketItem.id} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '700', color: colors.ink, fontSize: 14, flex: 1, marginRight: 8 }} numberOfLines={1}>
                            {ticketItem.title}
                          </Text>
                          <StatusBadge value={ticketItem.status} />
                        </View>
                        <Text style={{ fontSize: 12, color: colors.muted }}>
                          {ticketItem.location} · {ticketItem.date.split('-').reverse().join('/')}
                        </Text>
                      </View>
                    ));
                  })()}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Picker Modal for Archive Filters */}
      {pickerConfig && pickerConfig.visible ? (
        <Modal transparent visible animationType="fade" onRequestClose={() => setPickerConfig(null)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }} onPress={() => setPickerConfig(null)}>
            <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, maxHeight: 400, padding: 18, borderWidth: 1.5, borderColor: colors.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 12 }}>
                {pickerConfig.type === 'day' ? (user.language === 'IT' ? 'Filtra per Giorno' : 'Filter by Day') :
                 pickerConfig.type === 'month' ? (user.language === 'IT' ? 'Filtra per Mese' : 'Filter by Month') :
                 (user.language === 'IT' ? 'Filtra per Anno' : 'Filter by Year')}
              </Text>
              <ScrollView>
                {pickerConfig.options.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      if (pickerConfig.type === 'day') setFilterDay(opt);
                      if (pickerConfig.type === 'month') setFilterMonth(opt);
                      if (pickerConfig.type === 'year') setFilterYear(opt);
                      setPickerConfig(null);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border
                    }}
                  >
                    <Text style={{ fontSize: 16, color: colors.ink, fontWeight: '500' }}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}


function CampusScreen({
  news,
  selectedPoint,
  selectedPointId,
  onSelectPoint,
  onOpenExternal,
  weatherData,
  loadingWeather,
  t,
  lang,
  onSectionLayout,
}: {
  news: NewsItem[];
  selectedPoint: CampusPoint;
  selectedPointId: string;
  onSelectPoint: (id: string) => void;
  onOpenExternal: (url: string) => void;
  weatherData: {
    Fisciano: { temp: number; code: number; windspeed: number } | null;
    Baronissi: { temp: number; code: number; windspeed: number } | null;
  };
  loadingWeather: boolean;
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
  onSectionLayout?: (name: string, y: number) => void;
}) {
  const getFiscianoWeather = () => {
    if (weatherData.Fisciano) {
      const info = getWeatherInfo(weatherData.Fisciano.code, lang);
      return {
        temp: `${weatherData.Fisciano.temp}°C`,
        condition: info.text,
        Icon: info.icon,
        note: `${t('weatherWind')}: ${weatherData.Fisciano.windspeed} km/h`,
      };
    }
    return {
      temp: '24°C',
      condition: lang === 'IT' ? 'Soleggiato' : 'Sunny',
      Icon: Sun,
      note: lang === 'IT' ? 'Vento leggero' : 'Light wind',
    };
  };

  const getBaronissiWeather = () => {
    if (weatherData.Baronissi) {
      const info = getWeatherInfo(weatherData.Baronissi.code, lang);
      return {
        temp: `${weatherData.Baronissi.temp}°C`,
        condition: info.text,
        Icon: info.icon,
        note: `${t('weatherWind')}: ${weatherData.Baronissi.windspeed} km/h`,
      };
    }
    return {
      temp: '22°C',
      condition: lang === 'IT' ? 'Variabile' : 'Partly Cloudy',
      Icon: CloudSun,
      note: lang === 'IT' ? 'Vento moderato' : 'Moderate wind',
    };
  };

  const getWeeklyMenu = (currentLang: 'IT' | 'EN') => {
    const menuIT = [
      { day: 'Lun', first: 'Pasta al pomodoro', second: 'Pollo alla griglia', veg: 'Burger di ceci' },
      { day: 'Mar', first: 'Riso primavera', second: 'Merluzzo al forno', veg: 'Insalata greca' },
      { day: 'Mer', first: 'Gnocchi al pesto', second: 'Tacchino e verdure', veg: 'Parmigiana light' },
      { day: 'Gio', first: 'Pasta e lenticchie', second: 'Frittata', veg: 'Cous cous vegetale' },
      { day: 'Ven', first: 'Lasagna', second: 'Pesce spada', veg: 'Tofu speziato' },
    ];

    const menuEN = [
      { day: 'Mon', first: 'Pasta with tomato sauce', second: 'Grilled chicken', veg: 'Chickpea burger' },
      { day: 'Tue', first: 'Spring rice', second: 'Baked cod', veg: 'Greek salad' },
      { day: 'Wed', first: 'Gnocchi with pesto', second: 'Turkey and vegetables', veg: 'Light eggplant parmigiana' },
      { day: 'Thu', first: 'Pasta and lentils', second: 'Omelette', veg: 'Vegetable couscous' },
      { day: 'Fri', first: 'Lasagna', second: 'Swordfish', veg: 'Spiced tofu' },
    ];

    return currentLang === 'IT' ? menuIT : menuEN;
  };

  const getCusActivities = (currentLang: 'IT' | 'EN') => {
    const actIT = [
      { name: 'Calcetto', when: 'Lun/Mer 18:00 - 22:00', contact: 'cus@unisa.it' },
      { name: 'Tennis', when: 'Mar/Gio 16:00 - 20:00', contact: 'tennis.cus@unisa.it' },
      { name: 'Sala pesi', when: 'Lun-Ven 09:00 - 21:00', contact: 'fitness.cus@unisa.it' },
    ];

    const actEN = [
      { name: 'Futsal / Soccer', when: 'Mon/Wed 18:00 - 22:00', contact: 'cus@unisa.it' },
      { name: 'Tennis', when: 'Tue/Thu 16:00 - 20:00', contact: 'tennis.cus@unisa.it' },
      { name: 'Gym / Weight room', when: 'Mon-Fri 09:00 - 21:00', contact: 'fitness.cus@unisa.it' },
    ];

    return currentLang === 'IT' ? actIT : actEN;
  };

  const getPointDetails = (point: CampusPoint, currentLang: 'IT' | 'EN') => {
    if (currentLang === 'EN') {
      if (point.id === 'p-1') return { name: 'Main Canteen', type: 'Canteen', detail: 'Weekly menu and lunch/dinner hours.' };
      if (point.id === 'p-2') return { name: 'Science Library', type: 'Study', detail: 'Bookable seats and quiet study rooms.' };
      if (point.id === 'p-3') return { name: 'F Classrooms', type: 'Teaching', detail: 'Lecture block for computer science and engineering.' };
      if (point.id === 'p-4') return { name: 'CUS Salerno', type: 'Sport', detail: 'Courts, gyms and sports registration office.' };
      if (point.id === 'p-5') return { name: 'Baronissi Campus', type: 'Branch Campus', detail: 'Branch campus with dedicated bus connections.' };
    }
    return point;
  };

  const transPoint = getPointDetails(selectedPoint, lang);
  const fiscianoW = getFiscianoWeather();
  const baronissiW = getBaronissiWeather();

  return (
    <View>
      <SectionTitle title={t('campusTitle')} subtitle={t('campusSubtitle')} />
      
      <SectionTitle title={t('newsLabel')} subtitle={t('newsSubtitle')} />
      {news.map((item) => {
        let title = item.title;
        let body = item.body;
        let tag = item.tag;
        if (lang === 'EN') {
          if (item.id === 'news-1') {
            title = 'Master courses open day';
            body = 'Aula Magna in Fisciano, info desks and meetings with course coordinators.';
            tag = 'Academics';
          } else if (item.id === 'news-2') {
            title = 'New CUS schedule';
            body = 'Published updated hours for futsal, tennis, basketball and weight room.';
            tag = 'Campus';
          } else if (item.id === 'news-3') {
            title = 'Scholarships and notices';
            body = 'New notices available for international mobility and tutoring.';
            tag = 'Opportunities';
          }
        }
        return (
          <ListRow
            key={item.id}
            icon={Megaphone}
            title={title}
            subtitle={body}
            meta={tag}
            onPress={item.link ? () => onOpenExternal(item.link as string) : undefined}
          />
        );
      })}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('mapTitle')}</Text>
        <View style={styles.mapCanvas}>
          <View style={styles.mapBandHorizontal} />
          <View style={styles.mapBandVertical} />
          {campusPoints.map((point) => (
            <Pressable
              key={point.id}
              style={[
                styles.mapPin,
                { left: `${point.x}%`, top: `${point.y}%` },
                selectedPointId === point.id && styles.mapPinActive,
              ]}
              onPress={() => onSelectPoint(point.id)}
            >
              <MapPin color={selectedPointId === point.id ? colors.surface : colors.forest} size={18} />
            </Pressable>
          ))}
        </View>
        <View style={styles.mapDetail}>
          <Text style={styles.cardTitle}>{transPoint.name}</Text>
          <Text style={styles.rowSubtitle}>{transPoint.type}</Text>
          <Text style={styles.bodyText}>{transPoint.detail}</Text>
        </View>
      </View>

      <View onLayout={(e) => onSectionLayout?.('mensa', e.nativeEvent.layout.y)}>
        <SectionTitle title={t('canteenTitle')} subtitle={t('canteenSubtitle')} />
        {getWeeklyMenu(lang).map((day) => (
          <ListRow key={day.day} icon={Utensils} title={`${day.day}: ${day.first}`} subtitle={`${day.second} · ${t('vegLabel')}: ${day.veg}`} compact />
        ))}
      </View>

      <SectionTitle title={t('weatherTitle')} subtitle={t('weatherSubtitle')} />
      {loadingWeather && !weatherData.Fisciano ? (
        <View style={styles.card}>
          <ActivityIndicator color={colors.forest} size="small" />
          <Text style={[styles.mutedText, { textAlign: 'center', marginTop: 8 }]}>{t('weatherLoading')}</Text>
        </View>
      ) : (
        <View style={styles.weatherGrid}>
          {/* Fisciano Weather Card */}
          <View style={styles.weatherCard}>
            <Text style={styles.weatherSite}>{lang === 'IT' ? 'Sede Fisciano' : 'Fisciano Campus'}</Text>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherTemp}>{fiscianoW.temp}</Text>
              <View style={styles.weatherIconWrap}>
                <fiscianoW.Icon color={colors.forest} size={24} />
              </View>
            </View>
            <Text style={styles.weatherCondition}>{fiscianoW.condition}</Text>
            <Text style={styles.weatherNote}>{fiscianoW.note}</Text>
          </View>

          {/* Baronissi Weather Card */}
          <View style={styles.weatherCard}>
            <Text style={styles.weatherSite}>{lang === 'IT' ? 'Sede Baronissi' : 'Baronissi Campus'}</Text>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherTemp}>{baronissiW.temp}</Text>
              <View style={styles.weatherIconWrap}>
                <baronissiW.Icon color={colors.forest} size={24} />
              </View>
            </View>
            <Text style={styles.weatherCondition}>{baronissiW.condition}</Text>
            <Text style={styles.weatherNote}>{baronissiW.note}</Text>
          </View>
        </View>
      )}

      <SectionTitle title={t('transportTitle')} subtitle={t('transportSubtitle')} />
      {transportRows.map((row) => {
        let routeTrans = row.route;
        let nextTrans = row.next;
        let platformTrans = row.platform;
        if (lang === 'EN') {
          if (row.line === '7') {
            routeTrans = 'Salerno Station - Fisciano Campus';
            nextTrans = '12 min';
            platformTrans = 'Bus Terminal';
          } else if (row.line === '17') {
            routeTrans = 'Baronissi - Fisciano';
            nextTrans = '24 min';
            platformTrans = 'Medicine Stop';
          } else if (row.line === '10') {
            routeTrans = 'Mercato S. Severino - Campus';
            nextTrans = '31 min';
            platformTrans = 'North Entrance';
          }
        }
        return (
          <ListRow key={row.line} icon={Bus} title={`Linea ${row.line}`} subtitle={`${routeTrans} · ${platformTrans}`} compact />
        );
      })}

      <SectionTitle title={t('cusTitle')} subtitle={t('cusSubtitle')} />
      {getCusActivities(lang).map((activity) => (
        <ListRow
          key={activity.name}
          icon={Trophy}
          title={activity.name}
          subtitle={lang === 'IT' ? 'CUS Salerno' : 'Salerno CUS'}
          compact
          actionLabel={lang === 'IT' ? 'Contatta' : 'Contact'}
          onPress={() => {
            Alert.alert(
              lang === 'IT' ? 'Contatta CUS Salerno' : 'Contact CUS Salerno',
              lang === 'IT' ? 'Scegli la modalità di contatto:' : 'Choose contact method:',
              [
                { text: 'WhatsApp', onPress: () => onOpenExternal('https://wa.me/393483161449') },
                { text: lang === 'IT' ? 'Telefono' : 'Phone', onPress: () => onOpenExternal('tel:+39089969166') },
                { text: 'Email', onPress: () => onOpenExternal('mailto:info@cussalerno.com') },
                { text: t('cancel'), style: 'cancel' }
              ]
            );
          }}
        />
      ))}
    </View>
  );
}

function ServicesScreen({
  feedback,
  setFeedback,
  ticketDraft,
  setTicketDraft,
  onFeedback,
  onCreateTicket,
  onOpenExternal,
  t,
}: {
  feedback: string;
  setFeedback: (value: string) => void;
  ticketDraft: { title: string; location: string; body: string; priority: TicketType['priority'] };
  setTicketDraft: Dispatch<SetStateAction<{ title: string; location: string; body: string; priority: TicketType['priority'] }>>;
  onFeedback: () => void;
  onCreateTicket: () => void;
  onOpenExternal: (url: string) => void;
  t: (key: keyof typeof translations.IT) => string;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const isEnglish = t('langLabel') === 'Language';

  const faqCategories = isEnglish ? [
    {
      id: 'academics',
      title: '📚 Academics & Career',
      items: [
        { q: 'Are career statistics calculated automatically?', a: 'Yes. The app calculates passed exams, acquired CFU, arithmetic/weighted averages, and course progress percentage.' },
        { q: 'How do I add a passed exam?', a: 'On the Home tab, fill in the Course Name, CFU, and Grade in the "Add Exam" section and press "Save".' },
        { q: 'Can I view class schedules?', a: 'Yes, class schedules for your department are listed in the Academics section of the Home tab.' },
        { q: 'How do I accept or reject an exam grade?', a: 'In the "Published Results" section on the Home tab, tap the green checkmark to accept or the red cross to reject a grade.' },
        { q: 'As a professor, how do I publish an exam result?', a: 'On the Home tab, fill in the "Publish Exam Result" form with student name, course, and grade, then press publish.' }
      ]
    },
    {
      id: 'campus',
      title: '🌳 Campus & Services',
      items: [
        { q: 'How do I book a seat in the library?', a: 'In the Services tab, tap the "Book Library Seat" tile to be redirected to the official UNISA library booking portal.' },
        { q: 'Where can I find the canteen menu?', a: 'On the Campus tab, under "Main Canteen", you can see the daily menu, including traditional and vegetarian options.' },
        { q: 'What sports activities are available at CUS?', a: 'CUS Salerno offers activities like futsal, tennis, and gym. You can contact them directly using the quick links on the Campus tab.' },
        { q: 'How can I contact CUS Salerno?', a: 'Click the "Contact" button on any sports activity under the Campus tab to call them, write on WhatsApp, or send an email.' },
        { q: 'How do I access the University E-Learning platform?', a: 'In the Services section, tap the "UNISA E-Learning" shortcut to open the official university portal for course materials.' }
      ]
    },
    {
      id: 'support',
      title: '⚙️ Support & Account',
      items: [
        { q: 'Can I stay logged in on this device?', a: 'Yes. By checking the "Keep me logged in" option during login, your session will be securely stored on this device.' },
        { q: 'How do I report a campus maintenance issue?', a: 'In the Services tab, you can fill out the "Request PTA Support" form with a title, location, and description to open a ticket.' },
        { q: 'How do I change the app language?', a: 'In your Profile, you can switch between Italian and English using the selector at the bottom.' },
        { q: 'As PTA staff, how do I manage support tickets?', a: 'On your Home tab, you will see a list of open tickets. You can mark them "In Progress" or "Resolved" using the buttons.' },
        { q: 'How do I send feedback to the developers?', a: 'Fill in the "Send feedback to developers" field in the Services tab and press submit. It will open your mail client with a pre-filled message.' }
      ]
    }
  ] : [
    {
      id: 'academics',
      title: '📚 Didattica e Carriera',
      items: [
        { q: 'I dati carriera sono calcolati automaticamente?', a: 'Sì. L\'app calcola esami superati, CFU acquisiti, medie aritmetica e ponderata, e percentuale di avanzamento del corso.' },
        { q: 'Come inserisco un esame superato?', a: 'Dalla Home, nella sezione "Inserisci Esame", compila i campi relativi a Nome Corso, CFU e Voto e premi "Salva in Carriera".' },
        { q: 'Posso visualizzare gli orari delle lezioni?', a: 'Sì, gli orari delle lezioni per il tuo dipartimento sono elencati nella sezione Didattica della Home.' },
        { q: 'Come posso accettare o rifiutare un voto d\'esame?', a: 'Nella sezione "Esiti Pubblicati" della Home, tocca il dispensatore verde di spunta per accettare o la croce rossa per rifiutarlo.' },
        { q: 'Come docente, come posso caricare un esame?', a: 'Dalla Home, compila il modulo "Pubblica Esito Esame" inserendo nome dello studente, insegnamento e voto, quindi premi invia.' }
      ]
    },
    {
      id: 'campus',
      title: '🌳 Campus e Servizi',
      items: [
        { q: 'Come posso prenotare un posto in biblioteca?', a: 'Nella sezione Servizi, premi sulla tile "Prenota Posto Biblioteca" per essere reindirizzato al portale ufficiale delle biblioteche UNISA.' },
        { q: 'Dove trovo il menu della mensa centrale?', a: 'Nella sezione Campus, sotto la voce "Mensa Centrale", trovi il menu del giorno con piatti tradizionali e vegetariani.' },
        { q: 'Quali attività sportive sono disponibili al CUS?', a: 'Il CUS Salerno offre attività come calcetto, tennis, sala pesi e altro. Puoi contattarli direttamente tramite i pulsanti nella sezione Campus.' },
        { q: 'Come posso contattare il CUS Salerno?', a: 'Fai clic sul pulsante "Contatta" su qualsiasi attività sportiva nella scheda Campus per telefonare, scrivere su WhatsApp o inviare un\'e-mail.' },
        { q: 'Come posso accedere all\'E-Learning di Ateneo?', a: 'Nella sezione Servizi, tocca la scorciatoia "E-Learning UNISA" per aprire direttamente la piattaforma istituzionale per le lezioni.' }
      ]
    },
    {
      id: 'support',
      title: '⚙️ Supporto e Account',
      items: [
        { q: 'Posso restare loggato su questo dispositivo?', a: 'Sì, selezionando l\'opzione "Resta loggato" durante l\'accesso, la tua sessione verrà salvata sul dispositivo in modo sicuro.' },
        { q: 'Come segnalo un malfunzionamento nel campus?', a: 'Nella sezione Servizi, puoi compilare il form "Richiedi supporto PTA" inserendo titolo, luogo e descrizione per aprire un ticket.' },
        { q: 'Come cambio la lingua dell\'applicazione?', a: 'Nel tuo Profilo, puoi selezionare la lingua desiderata (Italiano o Inglese) tramite il controllo in fondo alla pagina.' },
        { q: 'Come PTA, come posso gestire i ticket assegnati?', a: 'Nella tua Home compare la lista dei ticket aperti. Puoi modificarne lo stato in "In carico" o "Risolto" con i relativi pulsanti.' },
        { q: 'Come posso inviare un feedback o un suggerimento agli sviluppatori?', a: 'Compila il campo "Invia feedback agli sviluppatori" nel tab Servizi e premi invia: aprirà il tuo client mail precompilato per i 4 sviluppatori.' }
      ]
    }
  ];

  return (
    <View>
      <SectionTitle title={t('servicesTitle')} subtitle={t('servicesSubtitle')} />
      <View style={styles.tileGrid}>
        <ServiceTile label={t('bookLibrarySeat')} detail={t('bookLibrarySeatDetail')} icon={Library} onPress={() => onOpenExternal('https://biblioteche.unisa.it/')} />
        <ServiceTile label={t('elearning')} detail={t('elearningDetail')} icon={ExternalLink} onPress={() => onOpenExternal('https://elearning.unisa.it/')} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('requestPtaSupport')}</Text>
        <Field label={t('ticketTitleLabel')} value={ticketDraft.title} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, title: value }))} />
        <Field label={t('ticketLocationLabel')} value={ticketDraft.location} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, location: value }))} />
        <Field label={t('ticketDescLabel')} multiline value={ticketDraft.body} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, body: value }))} />
        <Text style={styles.inputLabel}>{t('ticketPriorityLabel')}</Text>
        <SegmentedControl
          options={[
            { value: 'Bassa', label: t('ticketLow') },
            { value: 'Media', label: t('ticketMedium') },
            { value: 'Alta', label: t('ticketHigh') },
          ]}
          value={ticketDraft.priority}
          onChange={(value) => setTicketDraft((draft) => ({ ...draft, priority: value as TicketType['priority'] }))}
        />
        <ActionButton label={t('submitTicketBtn')} icon={Ticket} onPress={onCreateTicket} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('feedbackTitle')}</Text>
        <Field label={t('feedbackPlaceholder')} multiline value={feedback} onChangeText={setFeedback} />
        <ActionButton label={t('submitFeedbackBtn')} icon={MessageSquare} onPress={onFeedback} />
      </View>

      <SectionTitle title={t('faqTitle')} subtitle={t('faqSubtitle')} />
      {faqCategories.map((cat) => {
        const isExpanded = expandedCategory === cat.id;
        const ToggleIcon = isExpanded ? ChevronDown : ChevronRight;
        return (
          <View key={cat.id} style={{ marginBottom: 10 }}>
            <Pressable
              style={[
                styles.card,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  marginVertical: 0,
                }
              ]}
              onPress={() => {
                setExpandedCategory(isExpanded ? null : cat.id);
                setExpandedQuestion(null);
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                {cat.title}
              </Text>
              <ToggleIcon color={colors.teal} size={20} />
            </Pressable>
            
            {isExpanded ? (
              <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4, borderWidth: 1, borderColor: colors.border }}>
                {cat.items.map((row, index) => {
                  const isQExpanded = expandedQuestion === row.q;
                  const QToggleIcon = isQExpanded ? ChevronDown : ChevronRight;
                  return (
                    <View key={row.q} style={{ borderBottomWidth: index === cat.items.length - 1 ? 0 : 1, borderBottomColor: colors.border }}>
                      <Pressable
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
                        onPress={() => setExpandedQuestion(isQExpanded ? null : row.q)}
                      >
                        <Text style={{ fontWeight: '600', color: colors.ink, fontSize: 14, flex: 1, paddingRight: 8 }}>{row.q}</Text>
                        <QToggleIcon color={colors.muted} size={16} />
                      </Pressable>
                      {isQExpanded ? (
                        <View style={{ paddingBottom: 12, paddingTop: 2 }}>
                          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>{row.a}</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function ProfileScreen({
  user,
  draft,
  setDraft,
  onLanguageChange,
  onSave,
  onDelete,
  onLogout,
  t,
}: {
  user: UserProfile;
  draft: DraftProfile;
  setDraft: Dispatch<SetStateAction<DraftProfile>>;
  onLanguageChange: (lang: 'IT' | 'EN') => void;
  onSave: () => void;
  onDelete: () => void;
  onLogout: () => void;
  t: (key: keyof typeof translations.IT) => string;
}) {
  const getRoleLabelForProfile = (roleName: Role, currentLang: 'IT' | 'EN') => {
    if (roleName === 'Studente') return currentLang === 'IT' ? 'Studente' : 'Student';
    if (roleName === 'Docente') return currentLang === 'IT' ? 'Docente' : 'Professor';
    if (roleName === 'PTA') return currentLang === 'IT' ? 'PTA' : 'Staff';
    return roleName;
  };

  const lang = draft.language;

  return (
    <View>
      <SectionTitle title={t('profileTitle')} subtitle={t('profileSubtitle')} />
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <User color={colors.surface} size={28} />
        </View>
        <View style={styles.flexOne}>
          <Text style={styles.profileName}>
            {capitalizeWords(user.name)} {capitalizeWords(user.surname)}
          </Text>
          <Text style={styles.rowSubtitle}>
            {getRoleLabelForProfile(user.role, lang)} · {capitalizeWords(user.department)}{user.role === 'Studente' && user.degreeCourse ? ` · ${capitalizeWords(user.degreeCourse)}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('personalDataTitle')}</Text>
        <View style={styles.formGrid}>
          <Field label={t('name')} value={draft.name} onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))} />
          <Field label={t('surname')} value={draft.surname} onChangeText={(value) => setDraft((current) => ({ ...current, surname: value }))} />
        </View>
        <Field label={t('email')} autoCapitalize="none" value={draft.email} onChangeText={(value) => setDraft((current) => ({ ...current, email: value }))} />
        <Field label={t('phone')} value={draft.phone} onChangeText={(value) => setDraft((current) => ({ ...current, phone: value }))} />
        <Field
          label={user.role === 'Studente' ? (draft.language === 'IT' ? 'Dipartimento' : 'Department') : t('department')}
          value={draft.department}
          onChangeText={(value) => setDraft((current) => ({ ...current, department: value }))}
        />
        {user.role === 'Studente' ? (
          <Field
            label={draft.language === 'IT' ? 'Corso di laurea' : 'Degree Course'}
            value={draft.degreeCourse || ''}
            onChangeText={(value) => setDraft((current) => ({ ...current, degreeCourse: value }))}
          />
        ) : null}
        {user.role === 'PTA' ? (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.cardTitle, { fontSize: 15, marginTop: 8 }]}>
              {draft.language === 'IT' ? 'Orario di lavoro (Turni)' : 'Work Schedule (Shifts)'}
            </Text>
            {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'].map((day, index) => (
              <Field
                key={day}
                label={day}
                value={draft.shifts?.[index] || ''}
                placeholder="e.g. 08:00 - 14:00"
                onChangeText={(val) => {
                  setDraft((curr) => {
                    const newShifts = [...(curr.shifts || ['', '', '', '', ''])];
                    newShifts[index] = val;
                    return { ...curr, shifts: newShifts };
                  });
                }}
              />
            ))}
          </View>
        ) : null}
        <Text style={styles.inputLabel}>{t('langLabel')}</Text>
        <SegmentedControl
          options={[
            { value: 'IT', label: 'IT' },
            { value: 'EN', label: 'EN' },
          ]}
          value={draft.language}
          onChange={(value) => onLanguageChange(value as 'IT' | 'EN')}
        />
        <ActionButton label={t('saveChangesBtn')} icon={Save} onPress={onSave} />
      </View>

      <View style={styles.dangerZone}>
        <ActionButton label={t('logout')} icon={LogOut} onPress={onLogout} secondary />
        <ActionButton label={t('deleteAccount')} icon={Trash2} onPress={onDelete} danger />
      </View>
    </View>
  );
}

function BottomNav({
  activeTab,
  onChange,
  role,
  t,
  lang,
}: {
  activeTab: MainTab;
  onChange: (tab: MainTab) => void;
  role: Role;
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
}) {
  const RoleNavIcon = roleIcon[role];

  const getRoleLabelForNav = (r: Role, currentLang: 'IT' | 'EN') => {
    if (r === 'Studente') return currentLang === 'IT' ? 'Studente' : 'Student';
    if (r === 'Docente') return currentLang === 'IT' ? 'Docente' : 'Professor';
    if (r === 'PTA') return currentLang === 'IT' ? 'PTA' : 'Staff';
    return r;
  };

  const items: Array<{ key: MainTab; label: string; icon: IconComponent }> = [
    { key: 'home', label: t('home'), icon: Home },
    { key: 'campus', label: t('campus'), icon: MapPin },
    { key: 'services', label: t('services'), icon: ClipboardList },
    { key: 'profile', label: t('profile'), icon: CircleUserRound },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.key;
        return (
          <Pressable key={item.key} style={styles.navItem} onPress={() => onChange(item.key)}>
            <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
              <Icon color={active ? colors.surface : colors.muted} size={19} />
            </View>
            <Text style={[styles.navText, active && styles.navTextActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

function RolePicker({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <View style={styles.rolePicker}>
      {(['Studente', 'Docente', 'PTA'] as Role[]).map((role) => {
        const Icon = roleIcon[role];
        const active = value === role;
        return (
          <Pressable key={role} style={[styles.roleOption, active && styles.roleOptionActive]} onPress={() => onChange(role)}>
            <Icon color={active ? colors.surface : roleCopy[role].accent} size={18} />
            <Text style={[styles.roleOptionText, active && styles.roleOptionTextActive]}>{role}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} style={[styles.segment, active && styles.segmentActive]} onPress={() => onChange(option.value)}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onPress,
  secondary,
  danger,
}: {
  label: string;
  icon: IconComponent;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable style={[styles.actionButton, secondary && styles.actionSecondary, danger && styles.actionDanger]} onPress={onPress}>
      <Icon color={secondary ? colors.forest : colors.surface} size={18} />
      <Text style={[styles.actionText, secondary && styles.actionSecondaryText]}>{label}</Text>
    </Pressable>
  );
}

function IconButton({
  label,
  icon: Icon,
  onPress,
  danger,
}: {
  label: string;
  icon: IconComponent;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={[styles.iconButton, danger && styles.iconButtonDanger]} onPress={onPress}>
      <Icon color={danger ? colors.danger : colors.forest} size={16} />
      <Text style={[styles.iconButtonText, danger && styles.iconButtonTextDanger]}>{label}</Text>
    </Pressable>
  );
}

function ServiceTile({
  label,
  detail,
  icon: Icon,
  onPress,
}: {
  label: string;
  detail: string;
  icon: IconComponent;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.serviceTile} onPress={onPress}>
      <View style={styles.tileIcon}>
        <Icon color={colors.forest} size={22} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileDetail}>{detail}</Text>
    </Pressable>
  );
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: IconComponent; tone: 'green' | 'blue' | 'amber' | 'coral' | 'purple' }) {
  const toneStyles = {
    green: { bg: colors.mint, fg: colors.forest },
    blue: { bg: colors.blueSoft, fg: colors.blue },
    amber: { bg: colors.amberSoft, fg: '#7A4A00' },
    coral: { bg: colors.coralSoft, fg: colors.danger },
    purple: { bg: '#F3E8FF', fg: '#6B21A8' },
  }[tone];

  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: toneStyles.bg }]}>
        <Icon color={toneStyles.fg} size={19} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

function ListRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  compact,
  actionLabel,
  onPress,
}: {
  icon: IconComponent;
  title: string;
  subtitle: string;
  meta?: string;
  compact?: boolean;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.listIcon}>
        <Icon color={colors.forest} size={18} />
      </View>
      <View style={styles.flexOne}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
      {actionLabel ? <Text style={styles.rowActionText}>{actionLabel}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable style={[styles.listRow, compact && styles.listRowCompact]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.listRow, compact && styles.listRowCompact]}>{content}</View>;
}

function StatusBadge({ value }: { value: TicketType['status'] }) {
  const color = value === 'Aperto' ? colors.danger : value === 'In carico' ? colors.blue : colors.forest;
  return (
    <View style={[styles.statusBadge, { borderColor: color }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  authShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  authContent: {
    padding: 20,
    paddingBottom: 34,
  },
  authHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 22,
  },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brand: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: 0,
  },
  mutedText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 8,
  },
  authSubtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 420,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitleBlock: {
    flex: 1,
  },
  smallCaps: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  appTitle: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0,
  },
  roleBadge: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  searchShell: {
    marginHorizontal: 18,
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    paddingVertical: 10,
  },
  searchResults: {
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    zIndex: 3,
  },
  searchResultRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchResultTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  searchResultMeta: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 106,
  },
  contentWide: {
    maxWidth: 880,
    alignSelf: 'center',
    width: '100%',
  },
  heroPanel: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    ...shadow,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroText: {
    flex: 1,
  },
  heroKicker: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 3,
  },
  heroSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  quickGridWide: {
    flexWrap: 'nowrap',
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    justifyContent: 'space-between',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 8,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
  },
  sectionHeading: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceTile: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 122,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
    marginBottom: 12,
  },
  tileLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  tileDetail: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 8,
  },
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  formGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
    marginBottom: 12,
  },
  inputLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    color: colors.ink,
    backgroundColor: '#FBFCFA',
    paddingHorizontal: 12,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 92,
    paddingTop: 12,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  checkboxText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  actionButton: {
    minHeight: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  actionSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.forest,
  },
  actionDanger: {
    backgroundColor: colors.danger,
  },
  actionText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  actionSecondaryText: {
    color: colors.forest,
  },
  demoStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  demoButton: {
    flexGrow: 1,
    minHeight: 38,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  demoButtonText: {
    color: colors.forest,
    fontWeight: '800',
    fontSize: 13,
  },
  hintText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentActive: {
    backgroundColor: colors.forest,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.surface,
  },
  rolePicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  roleOption: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  roleOptionActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  roleOptionText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  roleOptionTextActive: {
    color: colors.surface,
  },
  listRow: {
    minHeight: 72,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listRowCompact: {
    minHeight: 60,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
  },
  flexOne: {
    flex: 1,
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  rowSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  rowMeta: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  rowActionText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  statsLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  statPillValue: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
  },
  statPillLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.teal,
  },
  progressText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  examRow: {
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    minHeight: 34,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  iconButtonDanger: {
    borderColor: colors.coralSoft,
    backgroundColor: colors.coralSoft,
  },
  iconButtonText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '800',
  },
  iconButtonTextDanger: {
    color: colors.danger,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  mapCanvas: {
    height: 230,
    borderRadius: radii.md,
    backgroundColor: colors.sky,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 4,
  },
  mapBandHorizontal: {
    position: 'absolute',
    height: 28,
    left: -20,
    right: -20,
    top: '48%',
    backgroundColor: '#C8D8C4',
    transform: [{ rotate: '-8deg' }],
  },
  mapBandVertical: {
    position: 'absolute',
    width: 28,
    top: -20,
    bottom: -20,
    left: '35%',
    backgroundColor: '#E6DDC9',
    transform: [{ rotate: '12deg' }],
  },
  mapPin: {
    position: 'absolute',
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinActive: {
    backgroundColor: colors.forest,
    transform: [{ scale: 1.12 }],
  },
  mapDetail: {
    marginTop: 12,
  },
  profileHeader: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
  },
  dangerZone: {
    gap: 8,
    marginTop: 12,
  },
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    minHeight: 70,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingVertical: 8,
    ...shadow,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIconWrap: {
    width: 36,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: colors.forest,
  },
  navText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  navTextActive: {
    color: colors.forest,
  },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -5,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '900',
  },
  toast: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 92,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toastText: {
    color: colors.surface,
    fontWeight: '800',
    fontSize: 13,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 34, 28, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...shadow,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    flexGrow: 0,
  },
  emptyNotificationsText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 30,
  },
  cleanGreeting: {
    marginTop: 10,
    marginBottom: 6,
  },
  greetingKicker: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  greetingName: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  weatherGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  weatherCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadow,
  },
  weatherSite: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  weatherTemp: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  weatherIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
  },
  weatherCondition: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  weatherNote: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
});

