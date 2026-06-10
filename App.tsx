import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  CheckCircle2,
  Save,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react-native';

import { colors } from './src/theme';
import { styles } from './src/styles';
import type {
  CampusPoint,
  Exam,
  ExamStatus,
  Lesson,
  MainTab,
  NewsItem,
  NotificationItem,
  Role,
  Ticket as TicketType,
  UserProfile,
  ReceptionSlot,
  DraftProfile,
} from './src/types';

import { STORAGE_KEYS, translations } from './src/constants';

import {
  makeId,
  isInstitutionalEmail,
  isNameValid,
  isPasswordValid,
  getDegreeCfu,
  parsePhone,
  capitalizeWords,
  fetchUnisaNews,
  safeParse,
  getRoleLabel,
  getRoleCopy,
  getNotificationText,
  roleIcon,
} from './src/utils';

import {
  demoUsers,
  initialExams,
  initialTickets,
  campusPoints,
  news,
  notifications,
  UNISA_DEPARTMENTS,
  PHONE_PREFIXES,
  getCoursesForDepartment,
  getTeachingsForDegrees,
  lessons,
  getTeachingCfu,
} from './src/data';

import {
  BottomNav,
  Field,
  CustomPicker,
  DomainPicker,
  MultiSelectPicker,
  RolePicker,
  SegmentedControl,
  ListRow,
  ActionButton,
} from './src/components';

import HomeScreen from './src/screens/HomeScreen';
import CampusScreen from './src/screens/CampusScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { api } from './src/api';

type AuthMode = 'login' | 'register';

function toProfileDraft(user: UserProfile): DraftProfile {
  return {
    name: user.name,
    surname: user.surname,
    email: user.email,
    phone: user.phone,
    department: user.department,
    degreeCourse: user.degreeCourse || '',
    matricola: user.matricola || '',
    language: user.language,
    shifts: user.shifts || ['', '', '', '', ''],
    ptaDomain: user.ptaDomain || '',
    teacherDegrees: user.teacherDegrees || [],
    teachings: user.teachings || [],
  };
}

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
    matricola: '',
    ptaDomain: '',
    teacherDegrees: [] as string[],
    teachings: [] as string[],
  });
  const [authPhonePrefix, setAuthPhonePrefix] = useState('🇮🇹 +39');

  const [profileDraft, setProfileDraft] = useState<DraftProfile>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    department: '',
    degreeCourse: '',
    matricola: '',
    language: 'IT',
    ptaDomain: '',
    teacherDegrees: [] as string[],
    teachings: [] as string[],
  });

  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [newExam, setNewExam] = useState({ course: '', cfu: '6', grade: '27', lode: false });
  const [tickets, setTickets] = useState<TicketType[]>(initialTickets);
  const [ticketDraft, setTicketDraft] = useState({
    title: '',
    location: '',
    body: '',
    priority: 'Media' as TicketType['priority'],
    ptaDomain: '',
  });
  const [customNotifications, setCustomNotifications] = useState<NotificationItem[]>([]);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [teacherResult, setTeacherResult] = useState({ students: [] as string[], course: '', grade: '28', lode: false });
  const [reception, setReception] = useState('Mercoledì 15:00 - 16:00 (Studio F3. Prenotazione via mail.)');
  const [receptionSlots, setReceptionSlots] = useState<ReceptionSlot[]>([]);
  const [feedback, setFeedback] = useState('');
  const [selectedPointId, setSelectedPointId] = useState(campusPoints[0].id);

  useEffect(() => {
    const load = async () => {
      const [[, storedUsers], [, storedSession], [, storedExams], [, storedTickets], [, storedNotifications], [, storedSlots]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.users,
        STORAGE_KEYS.session,
        STORAGE_KEYS.exams,
        STORAGE_KEYS.tickets,
        STORAGE_KEYS.notifications,
        'unisallround.slots',
      ]);

      const sessionId = safeParse<string | null>(storedSession, null);
      const isDemo = sessionId && sessionId.endsWith('-demo');

      const hydratedUsers = safeParse<UserProfile[]>(storedUsers, demoUsers);
      const hydratedExams = safeParse<Exam[]>(storedExams, isDemo ? initialExams : []);
      const hydratedTickets = safeParse<TicketType[]>(storedTickets, isDemo ? initialTickets : []);
      const hydratedNotifications = safeParse<NotificationItem[]>(storedNotifications, []);
      const hydratedSlots = safeParse<ReceptionSlot[]>(storedSlots, isDemo ? [
        { id: 'slot-1', day: 'Mercoledì', time: '15:00 - 16:00', desc: 'Studio F3. Prenotazione via mail.' }
      ] : []);

      let finalUsers = hydratedUsers;
      let finalExams = hydratedExams;
      let finalTickets = hydratedTickets;
      let finalSlots = hydratedSlots;
      let loggedInUser: UserProfile | null = null;

      try {
        const dbUsers = await api.getUsers();
        if (dbUsers && dbUsers.length > 0) {
          finalUsers = dbUsers;
        }
      } catch (err) {
        console.warn('Backend connection failed to fetch users, using offline fallback.', err);
      }

      try {
        if (sessionId) {
          const sessionUserLocal = finalUsers.find((user) => user.id === sessionId);
          if (sessionUserLocal) {
            const dbSlots = await api.getSlots();
            if (dbSlots) {
              finalSlots = dbSlots;
            }

            if (sessionUserLocal.role === 'Studente') {
              const dbExams = await api.getExams(sessionUserLocal.id);
              if (dbExams) {
                finalExams = dbExams;
              }
            }

            const dbTickets = await api.getTickets(sessionUserLocal.id, sessionUserLocal.role, sessionUserLocal.ptaDomain);
            if (dbTickets) {
              finalTickets = dbTickets;
            }

            loggedInUser = sessionUserLocal;
          }
        }
      } catch (err) {
        console.warn('Backend connection failed on startup, using offline fallback data.', err);
      }

      setUsers(finalUsers);
      setExams(finalExams);
      setTickets(finalTickets);
      setCustomNotifications(hydratedNotifications);
      setReceptionSlots(finalSlots);

      if (sessionId && loggedInUser) {
        setCurrentUser(loggedInUser);
        setProfileDraft(toProfileDraft(loggedInUser));
        setAppLanguage(loggedInUser.language || 'IT');
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

  useEffect(() => {
    if (!booting) {
      AsyncStorage.setItem('unisallround.slots', JSON.stringify(receptionSlots));
    }
  }, [booting, receptionSlots]);

  useEffect(() => {
    if (!booting) {
      const currentLang = currentUser ? currentUser.language : appLanguage;
      if (receptionSlots.length === 0) {
        setReception(currentLang === 'IT' ? 'Nessun ricevimento programmato' : 'No office hours scheduled');
      } else {
        const sorted = [...receptionSlots].sort((a, b) => {
          const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
          return days.indexOf(a.day) - days.indexOf(b.day) || a.time.localeCompare(b.time);
        });
        const summary = sorted.map(s => `${s.day} ${s.time} (${s.desc}${s.bookedBy ? ` - Prenotato da: ${s.bookedBy}` : ''})`).join(' · ');
        setReception(summary);
      }
    }
  }, [booting, receptionSlots, currentUser, appLanguage]);

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
    const targetCfu = getDegreeCfu(currentUser?.degreeCourse);
    const completed = acceptedExams.length;
    const cfu = acceptedExams.reduce((sum, exam) => sum + exam.cfu, 0);
    const sumGrades = acceptedExams.reduce((sum, exam) => sum + (exam.grade === 30 && exam.lode ? 31 : exam.grade), 0);
    const sumWeighted = acceptedExams.reduce((sum, exam) => sum + (exam.grade === 30 && exam.lode ? 31 : exam.grade) * exam.cfu, 0);
    const arithmetic = completed ? Number((sumGrades / completed).toFixed(2)) : 0;
    const weighted = cfu ? Number((sumWeighted / cfu).toFixed(2)) : 0;
    const progress = Math.min(100, Math.round((cfu / targetCfu) * 100));

    return { completed, cfu, arithmetic, weighted, progress };
  }, [acceptedExams, currentUser]);

  const roleNotifications = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const isDemo = currentUser.id.endsWith('-demo');

    return [...customNotifications, ...notifications].filter((item) => {
      // System/university news (target: 'Tutti') are shown to everyone
      if (item.target === 'Tutti') {
        return true;
      }
      
      // Role-specific notifications
      if (item.target === currentUser.role) {
        // Only show mock notifications (n-1, n-2) if it's a demo user
        if (['n-1', 'n-2'].includes(item.id)) {
          return isDemo;
        }
        return true;
      }
      
      return false;
    });
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

  const syncUser = async (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setProfileDraft(toProfileDraft(updatedUser));
    setUsers((previous) => previous.map((user) => (user.id === updatedUser.id ? updatedUser : user)));

    try {
      await api.updateProfile({
        id: updatedUser.id,
        name: updatedUser.name,
        surname: updatedUser.surname,
        phone: updatedUser.phone,
        matricola: updatedUser.matricola,
        department: updatedUser.department,
        degreeCourse: updatedUser.degreeCourse,
        workScope: updatedUser.ptaDomain,
        selectedTeachings: updatedUser.teachings,
        selectedCourses: updatedUser.teacherDegrees
      });
    } catch (err: any) {
      console.warn('Backend update profile failed, saved locally only.', err.message);
    }
  };

  const handleLogin = async (userOverride?: UserProfile) => {
    if (!userOverride) {
      try {
        const loggedUser = await api.login(authDraft.email.trim(), authDraft.password);
        if (loggedUser) {
          setCurrentUser(loggedUser);
          setProfileDraft(toProfileDraft(loggedUser));
          setActiveTab('home');
          setAppLanguage(loggedUser.language || 'IT');

          const dbSlots = await api.getSlots();
          if (dbSlots) setReceptionSlots(dbSlots);

          try {
            const dbUsers = await api.getUsers();
            if (dbUsers) setUsers(dbUsers);
          } catch (usersErr) {
            console.warn('Failed to fetch users list on login', usersErr);
          }

          if (loggedUser.role === 'Studente') {
            const dbExams = await api.getExams(loggedUser.id);
            if (dbExams) setExams(dbExams);
          }

          const dbTickets = await api.getTickets(loggedUser.id, loggedUser.role, loggedUser.ptaDomain);
          if (dbTickets) setTickets(dbTickets);

          if (rememberSession) {
            await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(loggedUser.id));
            showNotice(loggedUser.language === 'IT' ? 'Accesso effettuato e sessione salvata' : 'Login successful and session saved');
          } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.session);
            showNotice(loggedUser.language === 'IT' ? `Accesso effettuato come ${loggedUser.role}` : `Logged in as ${loggedUser.role}`);
          }
          return;
        }
      } catch (err: any) {
        console.warn('Backend login failed, falling back to local storage authentication.', err.message);
        if (err.message === 'Credenziali non valide.') {
          Alert.alert(t('loginFailedText'), t('invalidCredentialsText'));
          return;
        }
      }
    }

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

    const isDemo = loginUser.id.endsWith('-demo');
    setExams(isDemo ? initialExams : []);
    setTickets(isDemo ? initialTickets : []);
    setReceptionSlots(isDemo ? [
      { id: 'slot-1', day: 'Mercoledì', time: '15:00 - 16:00', desc: 'Studio F3. Prenotazione via mail.' }
    ] : []);

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
    const isPTA = authDraft.role === 'PTA';
    if (
      !authDraft.name.trim() ||
      !authDraft.surname.trim() ||
      !authDraft.email.trim() ||
      !authDraft.password.trim() ||
      !authDraft.phone.trim() ||
      (!isPTA && !authDraft.department.trim()) ||
      (isStudent && !authDraft.degreeCourse.trim()) ||
      (isStudent && !authDraft.matricola.trim()) ||
      (isPTA && !authDraft.ptaDomain)
    ) {
      Alert.alert(
        appLanguage === 'IT' ? 'Campi obbligatori mancanti' : 'Missing mandatory fields',
        appLanguage === 'IT'
          ? "Compila tutti i campi contrassegnati con l'asterisco (*)."
          : 'Please fill in all fields marked with an asterisk (*).'
      );
      return;
    }

    const phoneDigits = authDraft.phone.replace(/\D/g, '');
    if (phoneDigits.length === 0 || phoneDigits.length > 11) {
      Alert.alert(
        appLanguage === 'IT' ? 'Telefono non valido' : 'Invalid phone number',
        appLanguage === 'IT'
          ? 'Il numero di telefono deve contenere solo cifre (massimo 11).'
          : 'The phone number must contain only digits (maximum 11).'
      );
      return;
    }

    if (isStudent) {
      const matricolaDigits = authDraft.matricola.replace(/\D/g, '');
      if (matricolaDigits.length !== 10 || authDraft.matricola.length !== 10) {
        Alert.alert(
          appLanguage === 'IT' ? 'Matricola non valida' : 'Invalid Student ID',
          appLanguage === 'IT'
            ? 'La matricola deve essere composta da esattamente 10 cifre.'
            : 'The Student ID must consist of exactly 10 digits.'
        );
        return;
      }
    }

    if (!isNameValid(authDraft.name) || !isNameValid(authDraft.surname)) {
      Alert.alert(
        appLanguage === 'IT' ? 'Nome o Cognome non valido' : 'Invalid Name or Surname',
        appLanguage === 'IT'
          ? 'Il nome e il cognome possono contenere solo lettere, spazi e apostrofi. I numeri e altri caratteri speciali non sono consentiti.'
          : 'Name and Surname can only contain letters, spaces, and apostrophes. Numbers and other special characters are not allowed.'
      );
      return;
    }

    if (!isPasswordValid(authDraft.password)) {
      Alert.alert(
        appLanguage === 'IT' ? 'Password non valida' : 'Invalid Password',
        appLanguage === 'IT'
          ? 'La password deve contenere tra 8 e 16 caratteri, con almeno una lettera maiuscola e un carattere speciale.'
          : 'The password must be between 8 and 16 characters, and contain at least one uppercase letter and one special character.'
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

    const isTeacher = authDraft.role === 'Docente';
    if (isTeacher && (!authDraft.teachings || authDraft.teachings.length === 0)) {
      Alert.alert(
        appLanguage === 'IT' ? 'Insegnamenti mancanti' : 'Missing teachings',
        appLanguage === 'IT'
          ? 'Seleziona almeno un insegnamento che tieni.'
          : 'Please select at least one teaching you hold.'
      );
      return;
    }

    const registerId = makeId('user');
    const userToRegister = {
      id: registerId,
      name: capitalizeWords(authDraft.name),
      surname: capitalizeWords(authDraft.surname),
      email: authDraft.email.trim(),
      password: authDraft.password,
      role: authDraft.role,
      department: isPTA ? 'Supporto tecnico' : authDraft.department,
      degreeCourse: isStudent ? authDraft.degreeCourse : undefined,
      matricola: isStudent ? authDraft.matricola.trim() : undefined,
      phone: `${authPhonePrefix} ${phoneDigits}`,
      language: appLanguage,
      ptaDomain: isPTA ? authDraft.ptaDomain : undefined,
      teacherDegrees: isTeacher ? authDraft.teacherDegrees : undefined,
      selectedTeachings: isTeacher ? authDraft.teachings : undefined
    };

    let registeredUser: UserProfile = {
      ...userToRegister,
      password: authDraft.password,
      teachings: authDraft.teachings
    };

    try {
      const dbUser = await api.register(userToRegister);
      if (dbUser) {
        registeredUser = {
          ...dbUser,
          password: authDraft.password
        };
      }
    } catch (err: any) {
      console.warn('Backend registration failed, running local storage simulation.', err.message);
      if (err.message.includes('già registrata') || err.message.includes('already registered')) {
        Alert.alert(t('accountExistsText'), t('emailExistsText'));
        return;
      }
    }

    try {
      const dbUsers = await api.getUsers();
      if (dbUsers && dbUsers.length > 0) {
        setUsers(dbUsers);
      } else {
        const updatedUsers = [registeredUser, ...users];
        setUsers(updatedUsers);
      }
    } catch {
      const updatedUsers = [registeredUser, ...users];
      setUsers(updatedUsers);
    }
    
    // Clear state for new user
    setExams([]);
    setTickets([]);
    setReceptionSlots([]);

    setCurrentUser(registeredUser);
    setProfileDraft(toProfileDraft(registeredUser));
    setActiveTab('home');

    if (rememberSession) {
      await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(registeredUser.id));
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
    setExams([]);
    setTickets([]);
    setReceptionSlots([]);
  };

  const handleAddExam = async () => {
    const cfu = Number.parseInt(newExam.cfu, 10);
    const grade = Number.parseInt(newExam.grade, 10);

    if (!newExam.course.trim() || Number.isNaN(cfu) || Number.isNaN(grade) || cfu <= 0 || grade < 18 || grade > 30) {
      Alert.alert(t('invalidExamAlert'), t('invalidExamMsg'));
      return;
    }

    const courseNameClean = newExam.course.trim();

    // Check if the student already has an exam for this course
    const alreadyExists = exams.some(
      (e) =>
        e.course.trim().toLowerCase() === courseNameClean.toLowerCase() &&
        ['Accettato', 'Da valutare', 'Superato'].includes(e.status)
    );

    if (alreadyExists) {
      Alert.alert(
        appLanguage === 'IT' ? 'Esame già presente' : 'Exam already exists',
        appLanguage === 'IT'
          ? 'Hai già un esito in corso o registrato per questo insegnamento.'
          : 'You already have a pending or registered grade for this teaching.'
      );
      return;
    }

    const examId = makeId('exam');
    const examObj: Exam = {
      id: examId,
      course: courseNameClean,
      cfu,
      grade,
      date: 'Oggi',
      status: 'Accettato',
      lode: grade === 30 ? !!newExam.lode : false,
    };

    try {
      if (currentUser) {
        await api.addExam({
          ...examObj,
          student_id: currentUser.id,
          name: examObj.course,
          lode: examObj.lode
        } as any);
      }
      setExams((previous) => [examObj, ...previous]);
      setNewExam({ course: '', cfu: '6', grade: '27', lode: false });
      showNotice(t('toastExamSavedMsg'));
    } catch (err: any) {
      console.warn('Backend add exam failed:', err.message);
      if (err.message.includes('già un esito') || err.message.includes('already has') || err.message.includes('failed') || err.message.includes('400')) {
        Alert.alert(
          appLanguage === 'IT' ? 'Impossibile aggiungere' : 'Could not add',
          appLanguage === 'IT'
            ? 'Hai già un esito in corso o registrato per questo insegnamento.'
            : 'You already have a pending or registered grade for this teaching.'
        );
      } else {
        setExams((previous) => [examObj, ...previous]);
        setNewExam({ course: '', cfu: '6', grade: '27', lode: false });
        showNotice(t('toastExamSavedMsg'));
      }
    }
  };

  const updateExamStatus = async (id: string, status: ExamStatus) => {
    if (status === 'Accettato') {
      const examToAccept = exams.find(e => e.id === id);
      if (examToAccept) {
        const alreadyAccepted = exams.some(
          (e) =>
            e.id !== id &&
            e.course.trim().toLowerCase() === examToAccept.course.trim().toLowerCase() &&
            ['Accettato', 'Superato'].includes(e.status)
        );

        if (alreadyAccepted) {
          Alert.alert(
            appLanguage === 'IT' ? 'Esame già registrato' : 'Exam already registered',
            appLanguage === 'IT'
              ? `Hai già registrato un voto per l'insegnamento di ${examToAccept.course}.`
              : `You have already registered a grade for the course ${examToAccept.course}.`
          );
          return;
        }
      }
    }

    setExams((previous) => previous.map((exam) => (exam.id === id ? { ...exam, status } : exam)));

    try {
      await api.updateExam(id, { status });
    } catch (err: any) {
      console.warn('Backend update exam status failed, updated locally only.', err.message);
    }

    showNotice(status === 'Accettato' ? t('toastExamAcceptedMsg') : t('toastExamRejectedMsg'));
  };

  const addNotification = (notif: NotificationItem) => {
    setCustomNotifications((previous) => [notif, ...previous]);
  };

  const publishTeacherResult = async () => {
    const grade = Number.parseInt(teacherResult.grade, 10);

    if (teacherResult.students.length === 0 || Number.isNaN(grade) || grade < 18 || grade > 30) {
      Alert.alert(t('invalidPublishAlert'), t('invalidPublishMsg'));
      return;
    }

    const hasLode = grade === 30 && !!teacherResult.lode;

    const newExams = teacherResult.students.map((st) => {
      // st is like "Lucia Canzolino (0512106789)"
      const match = st.match(/\((\d+)\)/);
      const matricola = match ? match[1] : '';
      const student = users.find((u) => u.matricola === matricola);
      const studentId = student ? student.id : 'student-demo';

      return {
        id: makeId('published'),
        course: teacherResult.course,
        cfu: getTeachingCfu(teacherResult.course, student?.degreeCourse),
        grade,
        date: 'Oggi',
        status: 'Da valutare' as const,
        lode: hasLode,
        student_id: studentId,
      };
    });

    const successfulExams: any[] = [];
    const failedStudentNames: string[] = [];

    // Save to backend database
    for (const ex of newExams) {
      const studentNameStr = teacherResult.students.find(s => {
        const match = s.match(/\((\d+)\)/);
        return match && match[1] === users.find(u => u.id === ex.student_id)?.matricola;
      }) || 'Studente';

      try {
        await api.addExam({
          id: ex.id,
          course: ex.course,
          cfu: ex.cfu,
          grade: ex.grade,
          date: ex.date,
          status: ex.status,
          lode: ex.lode,
          student_id: ex.student_id,
          name: ex.course
        } as any);
        successfulExams.push(ex);
      } catch (err: any) {
        console.warn('Backend publish result failed:', err.message);
        failedStudentNames.push(studentNameStr);
      }
    }

    if (failedStudentNames.length > 0) {
      Alert.alert(
        appLanguage === 'IT' ? 'Impossibile registrare alcuni voti' : 'Could not record some grades',
        appLanguage === 'IT'
          ? `I seguenti studenti hanno già un esito in corso o superato per questo insegnamento:\n\n${failedStudentNames.map(s => `• ${s}`).join('\n')}`
          : `The following students already have a pending or passed grade for this teaching:\n\n${failedStudentNames.map(s => `• ${s}`).join('\n')}`
      );
    }

    if (successfulExams.length === 0) {
      setTeacherResult({ students: [], course: teacherResult.course, grade: '28', lode: false });
      return;
    }

    setExams((previous) => [...successfulExams, ...previous]);

    const newNotifs = successfulExams.map((ex) => {
      const studentFullName = teacherResult.students.find(s => {
        const match = s.match(/\((\d+)\)/);
        return match && match[1] === users.find(u => u.id === ex.student_id)?.matricola;
      }) || 'Studente';

      return {
        id: makeId('notif'),
        title: 'Esito pubblicato',
        body: `${teacherResult.course}: pubblicato voto ${grade}${hasLode ? ' e lode' : ''} per ${capitalizeWords(studentFullName)}.`,
        target: 'Studente' as const,
        date: 'Oggi',
      };
    });

    setCustomNotifications((previous) => [...newNotifs, ...previous]);
    setTeacherResult({ students: [], course: teacherResult.course, grade: '28', lode: false });
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

  const createTicket = async () => {
    if (!ticketDraft.title.trim() || !ticketDraft.location.trim() || !ticketDraft.body.trim() || !ticketDraft.ptaDomain) {
      Alert.alert(
        appLanguage === 'IT' ? 'Richiesta incompleta' : 'Incomplete request',
        appLanguage === 'IT'
          ? 'Inserisci titolo, luogo, descrizione e ambito della richiesta.'
          : 'Please enter a title, location, description, and select a request scope.'
      );
      return;
    }

    const ticketId = makeId('ticket');
    const newTicket = {
      id: ticketId,
      title: ticketDraft.title.trim(),
      requester: currentUser ? `${capitalizeWords(currentUser.name)} ${capitalizeWords(currentUser.surname)}` : 'Utente',
      location: ticketDraft.location.trim(),
      body: ticketDraft.body.trim(),
      status: 'Aperto' as const,
      priority: ticketDraft.priority,
      date: new Date().toISOString().split('T')[0],
      domain: ticketDraft.ptaDomain,
    };

    setTickets((previous) => [newTicket, ...previous]);

    try {
      if (currentUser) {
        await api.createTicket({
          id: ticketId,
          creator_id: currentUser.id,
          title: newTicket.title,
          description: `${newTicket.location} - ${newTicket.body}`,
          category: newTicket.domain,
          status: newTicket.status,
          priority: newTicket.priority,
          created_at: newTicket.date
        } as any);
      }
    } catch (err: any) {
      console.warn('Backend ticket creation failed, saved locally only.', err.message);
    }

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
    setTicketDraft({ title: '', location: '', body: '', priority: 'Media', ptaDomain: '' });
    showNotice(t('toastTicketCreated'));
  };

  const updateTicketStatus = async (id: string, status: TicketType['status']) => {
    setTickets((previous) => previous.map((ticketItem) => (ticketItem.id === id ? { ...ticketItem, status } : ticketItem)));

    try {
      await api.updateTicket(id, status);
    } catch (err: any) {
      console.warn('Backend ticket status update failed, updated locally only.', err.message);
    }

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
    } else if (titleLower.includes('ricevimento') || bodyLower.includes('ricevimento') || titleLower.includes('prenotazione') || bodyLower.includes('prenotazione')) {
      targetTab = 'home';
      targetSection = 'ricevimenti';
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
    const isPTA = currentUser.role === 'PTA';

    const phoneInfo = parsePhone(profileDraft.phone);
    const phoneDigits = phoneInfo.number.replace(/\D/g, '');

    if (
      !profileDraft.name.trim() ||
      !profileDraft.surname.trim() ||
      !profileDraft.email.trim() ||
      !phoneDigits.trim() ||
      (!isPTA && !profileDraft.department.trim()) ||
      (isStudent && !profileDraft.degreeCourse?.trim()) ||
      (isPTA && !profileDraft.ptaDomain)
    ) {
      Alert.alert(
        appLanguage === 'IT' ? 'Dati incompleti' : 'Incomplete data',
        appLanguage === 'IT'
          ? 'Compila tutti i campi obbligatori, compreso il telefono.'
          : 'Please fill in all mandatory fields, including the phone number.'
      );
      return;
    }

    if (phoneDigits.length > 11) {
      Alert.alert(
        appLanguage === 'IT' ? 'Telefono non valido' : 'Invalid phone number',
        appLanguage === 'IT'
          ? 'Il numero di telefono deve contenere al massimo 11 cifre.'
          : 'The phone number must contain at most 11 digits.'
      );
      return;
    }

    if (!isNameValid(profileDraft.name) || !isNameValid(profileDraft.surname)) {
      Alert.alert(
        appLanguage === 'IT' ? 'Nome o Cognome non valido' : 'Invalid Name or Surname',
        appLanguage === 'IT'
          ? 'Il nome e il cognome possono contenere solo lettere, spazi e apostrofi. I numeri e altri caratteri speciali non sono consentiti.'
          : 'Name and Surname can only contain letters, spaces, and apostrophes. Numbers and other special characters are not allowed.'
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

    const isTeacher = currentUser.role === 'Docente';
    if (isTeacher && (!profileDraft.teachings || profileDraft.teachings.length === 0)) {
      Alert.alert(
        appLanguage === 'IT' ? 'Insegnamenti mancanti' : 'Missing teachings',
        appLanguage === 'IT'
          ? 'Seleziona almeno un insegnamento che tieni.'
          : 'Please select at least one teaching you hold.'
      );
      return;
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      name: capitalizeWords(profileDraft.name),
      surname: capitalizeWords(profileDraft.surname),
      email: profileDraft.email.trim(),
      phone: `${phoneInfo.prefix} ${phoneDigits}`,
      department: isPTA ? 'Supporto tecnico' : profileDraft.department,
      degreeCourse: isStudent ? profileDraft.degreeCourse || undefined : undefined,
      matricola: isStudent ? profileDraft.matricola : undefined,
      language: profileDraft.language,
      shifts: currentUser.role === 'PTA' ? profileDraft.shifts : undefined,
      ptaDomain: isPTA ? profileDraft.ptaDomain : undefined,
      teacherDegrees: isTeacher ? profileDraft.teacherDegrees : undefined,
      teachings: isTeacher ? profileDraft.teachings : undefined,
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
          try {
            await api.deleteProfile(currentUser.id);
          } catch (err: any) {
            console.warn('Backend delete profile failed, deleted locally only.', err.message);
          }
          await handleLogout();
          showNotice(t('delete'));
        },
      },
    ]);
  };

  const syncSlots = async (newSlots: ReceptionSlot[]) => {
    const removed = receptionSlots.filter(oldS => !newSlots.some(newS => newS.id === oldS.id));
    const added = newSlots.filter(newS => !receptionSlots.some(oldS => oldS.id === newS.id));
    const modified = newSlots.filter(newS => {
      const oldS = receptionSlots.find(o => o.id === newS.id);
      return oldS && (oldS.status !== newS.status || oldS.desc !== newS.desc || oldS.bookedBy !== newS.bookedBy);
    });

    setReceptionSlots(newSlots);

    try {
      if (currentUser) {
        for (const rem of removed) {
          if (!isNaN(Number(rem.id))) {
            await api.deleteSlot(rem.id);
          }
        }
        for (const add of added) {
          await api.createSlot({
            teacherId: currentUser.id,
            teachingName: add.teaching || (currentUser.teachings ? currentUser.teachings[0] : 'Programmazione Mobile'),
            day: add.day,
            timeSlot: add.time,
            status: add.status || 'Libero',
            description: add.desc,
            date: add.date || 'Oggi'
          });
        }
        for (const mod of modified) {
          if (!isNaN(Number(mod.id))) {
            await api.updateSlot(mod.id, mod.status || 'Libero', mod.desc);
          }
        }
      }
    } catch (err: any) {
      console.warn('Backend sync slots failed, saved locally only.', err.message);
    }
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
                <Image source={require('./assets/logo.png')} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 14 }} />
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
                  onHelpPress={authMode === 'register' ? () => {
                    Alert.alert(
                      appLanguage === 'IT' ? 'Requisiti Password' : 'Password Requirements',
                      appLanguage === 'IT'
                        ? 'La password deve rispettare i seguenti criteri:\n\n• Minimo 8 caratteri\n• Massimo 16 caratteri\n• Almeno una letteral MAIUSCOLA\n• Almeno un carattere speciale (es. !, @, #, $, %, ^, &, *, ?)'
                        : 'The password must meet the following criteria:\n\n• Minimum 8 characters\n• Maximum 16 characters\n• At least one UPPERCASE letter\n• At least one special character (e.g. !, @, #, $, %, ^, &, *, ?)'
                    );
                  } : undefined}
                />

                {authMode === 'register' ? (
                  <>
                    {authDraft.role !== 'PTA' ? (
                      <CustomPicker
                        label={authDraft.role === 'Studente' ? (appLanguage === 'IT' ? 'Dipartimento' : 'Department') : t('department')}
                        value={authDraft.department}
                        options={UNISA_DEPARTMENTS}
                        onSelect={(value) => setAuthDraft((draft) => {
                          const validCourses = getCoursesForDepartment(value).map(c => c.name);
                          const isCourseValid = validCourses.includes(draft.degreeCourse);
                          const filteredDegrees = draft.teacherDegrees.filter(d => validCourses.includes(d));
                          const filteredTeachings = draft.teachings.filter(t => getTeachingsForDegrees(filteredDegrees).includes(t));
                          return {
                            ...draft,
                            department: value,
                            degreeCourse: isCourseValid ? draft.degreeCourse : '',
                            teacherDegrees: filteredDegrees,
                            teachings: filteredTeachings
                          };
                        })}
                        required={true}
                        lang={appLanguage}
                      />
                    ) : null}
                    {authDraft.role === 'Studente' ? (
                      <>
                        <CustomPicker
                          label={appLanguage === 'IT' ? 'Corso di laurea' : 'Degree Course'}
                          value={authDraft.degreeCourse}
                          options={getCoursesForDepartment(authDraft.department).map((c) => c.name)}
                          onSelect={(value) => setAuthDraft((draft) => ({ ...draft, degreeCourse: value }))}
                          required={true}
                          lang={appLanguage}
                        />
                        <Field
                          label={appLanguage === 'IT' ? 'Matricola' : 'Student ID'}
                          required={true}
                          value={authDraft.matricola}
                          onChangeText={(value) => {
                            const filtered = value.replace(/\D/g, '');
                            setAuthDraft((draft) => ({ ...draft, matricola: filtered }));
                          }}
                          keyboardType="number-pad"
                          maxLength={10}
                          placeholder="0512106789"
                          onHelpPress={() =>
                            Alert.alert(
                              appLanguage === 'IT' ? 'Requisiti Matricola' : 'Student ID Requirements',
                              appLanguage === 'IT'
                                ? 'La matricola deve essere composta da esattamente 10 cifre.'
                                : 'The Student ID must consist of exactly 10 digits.'
                            )
                          }
                        />
                      </>
                    ) : null}
                    {authDraft.role === 'PTA' ? (
                      <DomainPicker
                        label={appLanguage === 'IT' ? 'Ambito lavorativo' : 'Work Scope'}
                        value={authDraft.ptaDomain}
                        onSelect={(value) => setAuthDraft((draft) => ({ ...draft, ptaDomain: value }))}
                        required={true}
                        lang={appLanguage}
                      />
                    ) : null}
                    {authDraft.role === 'Docente' ? (
                      <>
                        <MultiSelectPicker
                          label={appLanguage === 'IT' ? 'Corsi di laurea di riferimento' : 'Reference Degree Courses'}
                          values={authDraft.teacherDegrees}
                          options={getCoursesForDepartment(authDraft.department).map((c) => c.name)}
                          onSelect={(value) => setAuthDraft((draft) => ({ 
                            ...draft, 
                            teacherDegrees: value,
                            teachings: draft.teachings.filter((t) => getTeachingsForDegrees(value).includes(t))
                          }))}
                          lang={appLanguage}
                        />
                        <MultiSelectPicker
                          label={appLanguage === 'IT' ? 'Insegnamenti tenuti' : 'Teachings Held'}
                          values={authDraft.teachings}
                          options={getTeachingsForDegrees(authDraft.teacherDegrees)}
                          onSelect={(value) => setAuthDraft((draft) => ({ ...draft, teachings: value }))}
                          lang={appLanguage}
                        />
                      </>
                    ) : null}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ width: 100 }}>
                        <CustomPicker
                          label={appLanguage === 'IT' ? 'Prefisso' : 'Prefix'}
                          value={authPhonePrefix}
                          options={PHONE_PREFIXES}
                          onSelect={(value) => setAuthPhonePrefix(value)}
                          lang={appLanguage}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Field
                          label={t('phone')}
                          required
                          keyboardType="phone-pad"
                          value={authDraft.phone}
                          onChangeText={(value) => {
                            const digits = value.replace(/\D/g, '').slice(0, 11);
                            setAuthDraft((draft) => ({ ...draft, phone: digits }));
                          }}
                        />
                      </View>
                    </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Image source={require('./assets/logo.png')} style={{ width: 34, height: 34, borderRadius: 17 }} />
            <View style={styles.topTitleBlock}>
              <Text style={styles.smallCaps}>{t('univSalerno')}</Text>
              <Text style={styles.appTitle} numberOfLines={1} ellipsizeMode="tail">UnisAllRound</Text>
            </View>
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
              lessons={(() => {
                // Return current user's lessons based on their department or settings
                // Let's filter lessons by the user's department
                const dept = currentUser.department;
                return lessons.filter(l => l.teacher === `${currentUser.name} ${currentUser.surname}` || (currentUser.role === 'Studente' && (currentUser.degreeCourse ? getCoursesForDepartment(dept).map(c => c.name).includes(currentUser.degreeCourse) : false)));
              })()}
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
              receptionSlots={receptionSlots}
              onSyncSlots={syncSlots}
              onAddNotification={addNotification}
              users={users}
              customNotifications={customNotifications}
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
