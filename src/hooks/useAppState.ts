import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, ScrollView, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS, translations } from '../constants';
import { api } from '../api';
import type {
  DraftProfile,
  Exam,
  ExamStatus,
  MainTab,
  NewsItem,
  NotificationItem,
  Role,
  Ticket as TicketType,
  UserProfile,
  ReceptionSlot,
} from '../types';
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
} from '../utils';
import {
  campusPoints,
  news,
  getCoursesForDepartment,
  getTeachingCfu,
  getTeachingsForDegrees,
} from '../data';

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

export default function useAppState() {
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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [appLanguage, setAppLanguage] = useState<'IT' | 'EN'>('IT');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [archivedNotifIds, setArchivedNotifIds] = useState<string[]>([]);
  const [deletedNotifIds, setDeletedNotifIds] = useState<string[]>([]);
  const [activeNotifTab, setActiveNotifTab] = useState<'active' | 'archived'>('active');
  const [archivedTicketIds, setArchivedTicketIds] = useState<string[]>([]);
  const [deletedTicketIds, setDeletedTicketIds] = useState<string[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
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
    const lang = currentUser ? (currentUser.language || 'IT') : appLanguage;
    return translations[lang]?.[key] ?? translations.IT[key];
  };

  const [authDraft, setAuthDraft] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    department: '',
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

  const [exams, setExams] = useState<Exam[]>([]);
  const [newExam, setNewExam] = useState({ course: '', cfu: '', grade: '27', lode: false });
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [ticketDraft, setTicketDraft] = useState({
    title: '',
    location: '',
    body: '',
    priority: 'Media' as TicketType['priority'],
    ptaDomain: '',
  });
  const [customNotifications, setCustomNotifications] = useState<NotificationItem[]>([]);
  const loadedNotificationsUserId = useRef<string | null>(null);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [teacherResult, setTeacherResult] = useState({ students: [] as string[], course: '', grade: '28', lode: false });
  const [reception, setReception] = useState('');
  const [receptionSlots, setReceptionSlots] = useState<ReceptionSlot[]>([]);
  const [feedback, setFeedback] = useState('');
  const [selectedPointId, setSelectedPointId] = useState(campusPoints[0].id);

  useEffect(() => {
    const load = async () => {
      const [[, storedUsers], [, storedSession], [, storedExams], [, storedTickets], [, storedSlots]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.users,
        STORAGE_KEYS.session,
        STORAGE_KEYS.exams,
        STORAGE_KEYS.tickets,
        'unisallround.slots',
      ]);

      const sessionId = safeParse<string | null>(storedSession, null);

      const hydratedUsers = safeParse<UserProfile[]>(storedUsers, []);
      const hydratedExams = safeParse<Exam[]>(storedExams, []);
      const hydratedTickets = safeParse<TicketType[]>(storedTickets, []);
      
      let hydratedNotifications: NotificationItem[] = [];
      let hydratedArchived: string[] = [];
      let hydratedDeleted: string[] = [];
      if (sessionId) {
        const userNotifKey = `${STORAGE_KEYS.notifications}.${sessionId}`;
        const storedNotifications = await AsyncStorage.getItem(userNotifKey);
        hydratedNotifications = safeParse<NotificationItem[]>(storedNotifications, []);
        loadedNotificationsUserId.current = sessionId;

        const archivedKey = `unisallround.notifications.archived.${sessionId}`;
        const deletedKey = `unisallround.notifications.deleted.${sessionId}`;
        const storedArchived = await AsyncStorage.getItem(archivedKey);
        const storedDeleted = await AsyncStorage.getItem(deletedKey);
        hydratedArchived = safeParse<string[]>(storedArchived, []);
        hydratedDeleted = safeParse<string[]>(storedDeleted, []);
      }

      const hydratedSlots = safeParse<ReceptionSlot[]>(storedSlots, []);

      let finalUsers = hydratedUsers;
      let finalExams = hydratedExams;
      let finalTickets = hydratedTickets;
      let finalSlots = hydratedSlots;
      let loggedInUser: UserProfile | null = null;
      let hydratedArchivedTickets: string[] = [];
      let hydratedDeletedTickets: string[] = [];

      try {
        const dbUsers = await api.getUsers();
        if (dbUsers && dbUsers.length > 0) {
          finalUsers = dbUsers.map(dbUser => {
            const localUser = hydratedUsers.find(u => u.id === dbUser.id);
            return {
              ...dbUser,
              password: localUser?.password || 'Password123!'
            };
          });
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

            try {
              const dbNotifs = await api.getNotifications(sessionUserLocal.role, sessionUserLocal.id);
              if (dbNotifs) {
                hydratedNotifications = dbNotifs;
              }
            } catch (notifErr) {
              console.warn('Failed to fetch notifications on startup:', notifErr);
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
      setArchivedNotifIds(hydratedArchived);
      setDeletedNotifIds(hydratedDeleted);
      setArchivedTicketIds(hydratedArchivedTickets);
      setDeletedTicketIds(hydratedDeletedTickets);
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
    if (!booting && currentUser && loadedNotificationsUserId.current === currentUser.id) {
      const userNotifKey = `${STORAGE_KEYS.notifications}.${currentUser.id}`;
      AsyncStorage.setItem(userNotifKey, JSON.stringify(customNotifications));
    }
  }, [booting, customNotifications, currentUser?.id]);

  useEffect(() => {
    if (!booting && currentUser) {
      const archivedKey = `unisallround.notifications.archived.${currentUser.id}`;
      AsyncStorage.setItem(archivedKey, JSON.stringify(archivedNotifIds));
    }
  }, [booting, archivedNotifIds, currentUser?.id]);

  useEffect(() => {
    if (!booting && currentUser) {
      const deletedKey = `unisallround.notifications.deleted.${currentUser.id}`;
      AsyncStorage.setItem(deletedKey, JSON.stringify(deletedNotifIds));
    }
  }, [booting, deletedNotifIds, currentUser?.id]);

  useEffect(() => {
    if (!booting && currentUser) {
      const archivedKey = `unisallround.tickets.archived.${currentUser.id}`;
      AsyncStorage.setItem(archivedKey, JSON.stringify(archivedTicketIds));
    }
  }, [booting, archivedTicketIds, currentUser?.id]);

  useEffect(() => {
    if (!booting && currentUser) {
      const deletedKey = `unisallround.tickets.deleted.${currentUser.id}`;
      AsyncStorage.setItem(deletedKey, JSON.stringify(deletedTicketIds));
    }
  }, [booting, deletedTicketIds, currentUser?.id]);

  useEffect(() => {
    if (!booting) {
      AsyncStorage.setItem('unisallround.slots', JSON.stringify(receptionSlots));
    }
  }, [booting, receptionSlots]);

  useEffect(() => {
    if (!booting) {
      const currentLang = currentUser ? (currentUser.language || 'IT') : appLanguage;
      const visibleSlots = currentUser && currentUser.role === 'Studente'
        ? receptionSlots.filter(s => !s.degreeCourse || s.degreeCourse === currentUser.degreeCourse)
        : receptionSlots;

      if (visibleSlots.length === 0) {
        setReception(currentLang === 'IT' ? 'Nessun ricevimento programmato' : 'No office hours scheduled');
      } else {
        const sorted = [...visibleSlots].sort((a, b) => {
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
    const sumGrades = acceptedExams.reduce((sum, exam) => sum + exam.grade, 0);
    const sumWeighted = acceptedExams.reduce((sum, exam) => sum + exam.grade * exam.cfu, 0);
    const arithmetic = completed ? Number((sumGrades / completed).toFixed(2)) : 0;
    const weighted = cfu ? Number((sumWeighted / cfu).toFixed(2)) : 0;
    const progress = Math.min(100, Math.round((cfu / targetCfu) * 100));

    return { completed, cfu, arithmetic, weighted, progress };
  }, [acceptedExams, currentUser]);

  const roleNotifications = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return customNotifications.filter((item) => {
      if (item.target === 'Tutti') {
        return true;
      }
      if (item.target === currentUser.role || item.target === currentUser.id) {
        return true;
      }
      return false;
    });
  }, [customNotifications, currentUser]);

  const activeNotifications = useMemo(() => {
    return roleNotifications.filter(
      (item) => !deletedNotifIds.includes(item.id) && !archivedNotifIds.includes(item.id)
    );
  }, [roleNotifications, deletedNotifIds, archivedNotifIds]);

  const archivedNotifications = useMemo(() => {
    return roleNotifications.filter(
      (item) => !deletedNotifIds.includes(item.id) && archivedNotifIds.includes(item.id)
    );
  }, [roleNotifications, deletedNotifIds, archivedNotifIds]);

  const searchableActions = useMemo(
    () => [
      { title: 'Carriera universitaria', tab: 'role' as MainTab, keywords: 'media cfu esami studente' },
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
        selectedCourses: updatedUser.teacherDegrees,
        language: updatedUser.language
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
          loggedUser.password = authDraft.password;
          const userNotifKey = `${STORAGE_KEYS.notifications}.${loggedUser.id}`;
          const stored = await AsyncStorage.getItem(userNotifKey);
          let hydrated = safeParse<NotificationItem[]>(stored, []);
          
          const archivedKey = `unisallround.notifications.archived.${loggedUser.id}`;
          const deletedKey = `unisallround.notifications.deleted.${loggedUser.id}`;
          const storedArchived = await AsyncStorage.getItem(archivedKey);
          const storedDeleted = await AsyncStorage.getItem(deletedKey);
          setArchivedNotifIds(safeParse<string[]>(storedArchived, []));
          setDeletedNotifIds(safeParse<string[]>(storedDeleted, []));

          const archivedTicketsKey = `unisallround.tickets.archived.${loggedUser.id}`;
          const deletedTicketsKey = `unisallround.tickets.deleted.${loggedUser.id}`;
          const storedArchivedTickets = await AsyncStorage.getItem(archivedTicketsKey);
          const storedDeletedTickets = await AsyncStorage.getItem(deletedTicketsKey);
          setArchivedTicketIds(safeParse<string[]>(storedArchivedTickets, []));
          setDeletedTicketIds(safeParse<string[]>(storedDeletedTickets, []));
          
          try {
            const dbNotifs = await api.getNotifications(loggedUser.role, loggedUser.id);
            if (dbNotifs) {
              hydrated = dbNotifs;
            }
          } catch (notifErr) {
            console.warn('Failed to fetch notifications on login:', notifErr);
          }

          loadedNotificationsUserId.current = loggedUser.id;
          setCustomNotifications(hydrated);

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
            showNotice((loggedUser.language || 'IT') === 'IT' ? 'Accesso effettuato e sessione salvata' : 'Login successful and session saved');
          } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.session);
            showNotice((loggedUser.language || 'IT') === 'IT' ? `Accesso effettuato come ${loggedUser.role}` : `Logged in as ${loggedUser.role}`);
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

    setExams([]);
    setTickets([]);
    setReceptionSlots([]);

    const userNotifKey = `${STORAGE_KEYS.notifications}.${loginUser.id}`;
    const stored = await AsyncStorage.getItem(userNotifKey);
    const hydrated = safeParse<NotificationItem[]>(stored, []);
    loadedNotificationsUserId.current = loginUser.id;
    setCustomNotifications(hydrated);

    const archivedKey = `unisallround.notifications.archived.${loginUser.id}`;
    const deletedKey = `unisallround.notifications.deleted.${loginUser.id}`;
    const storedArchived = await AsyncStorage.getItem(archivedKey);
    const storedDeleted = await AsyncStorage.getItem(deletedKey);
    setArchivedNotifIds(safeParse<string[]>(storedArchived, []));
    setDeletedNotifIds(safeParse<string[]>(storedDeleted, []));

    setCurrentUser(loginUser);
    setProfileDraft(toProfileDraft(loginUser));
    setActiveTab('home');
    setAppLanguage(loginUser.language || 'IT');

    if (rememberSession) {
      await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(loginUser.id));
      showNotice((loginUser.language || 'IT') === 'IT' ? 'Accesso effettuato e sessione salvata' : 'Login successful and session saved');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.session);
      showNotice((loginUser.language || 'IT') === 'IT' ? `Accesso effettuato come ${loginUser.role}` : `Logged in as ${loginUser.role}`);
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
    
    setExams([]);
    setTickets([]);
    setReceptionSlots([]);
    setCustomNotifications([]);
    setArchivedNotifIds([]);
    setDeletedNotifIds([]);
    loadedNotificationsUserId.current = registeredUser.id;
    await AsyncStorage.setItem(`${STORAGE_KEYS.notifications}.${registeredUser.id}`, JSON.stringify([]));
    await AsyncStorage.setItem(`unisallround.notifications.archived.${registeredUser.id}`, JSON.stringify([]));
    await AsyncStorage.setItem(`unisallround.notifications.deleted.${registeredUser.id}`, JSON.stringify([]));
    await AsyncStorage.setItem(`unisallround.tickets.archived.${registeredUser.id}`, JSON.stringify([]));
    await AsyncStorage.setItem(`unisallround.tickets.deleted.${registeredUser.id}`, JSON.stringify([]));
    setArchivedTicketIds([]);
    setDeletedTicketIds([]);

    setCurrentUser(registeredUser);
    setProfileDraft(toProfileDraft(registeredUser));
    setActiveTab('home');

    try {
      const dbSlots = await api.getSlots();
      if (dbSlots) setReceptionSlots(dbSlots);

      if (registeredUser.role === 'Studente') {
        const dbExams = await api.getExams(registeredUser.id);
        if (dbExams) setExams(dbExams);
      }

      const dbTickets = await api.getTickets(registeredUser.id, registeredUser.role, registeredUser.ptaDomain);
      if (dbTickets) setTickets(dbTickets);

      const dbNotifs = await api.getNotifications(registeredUser.role, registeredUser.id);
      if (dbNotifs) setCustomNotifications(dbNotifs);
    } catch (fetchErr) {
      console.warn('Failed to fetch initial data for registered user:', fetchErr);
    }

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
    setCustomNotifications([]);
    setArchivedNotifIds([]);
    setDeletedNotifIds([]);
    setArchivedTicketIds([]);
    setDeletedTicketIds([]);
    setActiveNotifTab('active');
    loadedNotificationsUserId.current = null;
  };

  const handleAddExam = async () => {
    const standardCfu = getTeachingCfu(newExam.course, currentUser?.degreeCourse);
    const grade = Number.parseInt(newExam.grade, 10);

    if (!newExam.course.trim() || Number.isNaN(standardCfu) || Number.isNaN(grade) || standardCfu <= 0 || grade < 18 || grade > 30) {
      Alert.alert(t('invalidExamAlert'), t('invalidExamMsg'));
      return;
    }

    const courseNameClean = newExam.course.trim();

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
      cfu: standardCfu,
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
      setNewExam({ course: '', cfu: '', grade: '27', lode: false });
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
        setNewExam({ course: '', cfu: '', grade: '27', lode: false });
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

  const addNotification = async (notif: NotificationItem) => {
    setCustomNotifications((previous) => [notif, ...previous]);
    try {
      if (currentUser) {
        await api.createNotification({
          id: notif.id,
          title: notif.title,
          body: notif.body,
          target: notif.target,
          date: notif.date,
          senderId: currentUser.id
        });
      }
    } catch (err: any) {
      console.warn('Backend create notification failed, saved locally only.', err.message);
    }
  };

  const publishTeacherResult = async () => {
    const grade = Number.parseInt(teacherResult.grade, 10);

    if (teacherResult.students.length === 0 || Number.isNaN(grade) || grade < 18 || grade > 30) {
      Alert.alert(t('invalidPublishAlert'), t('invalidPublishMsg'));
      return;
    }

    const hasLode = grade === 30 && !!teacherResult.lode;

    const newExams = teacherResult.students.map((st) => {
      const match = st.match(/\((\d+)\)/);
      const matricola = match ? match[1] : '';
      const student = users.find((u) => u.matricola === matricola);
      if (!student) return null;

      return {
        id: makeId('published'),
        course: teacherResult.course,
        cfu: getTeachingCfu(teacherResult.course, student.degreeCourse),
        grade,
        date: 'Oggi',
        status: 'Da valutare' as const,
        lode: hasLode,
        student_id: student.id,
      };
    }).filter((ex): ex is NonNullable<typeof ex> => ex !== null);

    const successfulExams: any[] = [];
    const failedStudentNames: string[] = [];

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
    for (const notif of newNotifs) {
      try {
        if (currentUser) {
          await api.createNotification({
            id: notif.id,
            title: notif.title,
            body: notif.body,
            target: notif.target,
            date: notif.date,
            senderId: currentUser.id
          });
        }
      } catch (err) {
        console.warn('Failed to sync notification for published result to backend', err);
      }
    }
    setTeacherResult({ students: [], course: teacherResult.course, grade: '28', lode: false });
    showNotice(t('toastResultPublished'));
  };

  const sendTeacherMessage = async (course: string, selectedStudents: string[]) => {
    if (!teacherMessage.trim()) {
      Alert.alert(t('emptyMessageAlert'), t('emptyMessageMsg'));
      return;
    }
    if (selectedStudents.length === 0) {
      Alert.alert(
        appLanguage === 'IT' ? 'Nessuno studente selezionato' : 'No students selected',
        appLanguage === 'IT'
          ? 'Seleziona almeno uno studente a cui inviare la comunicazione.'
          : 'Please select at least one student to send the communication to.'
      );
      return;
    }

    const targetNotifs: NotificationItem[] = [];
    for (const st of selectedStudents) {
      const match = st.match(/\((\d+)\)/);
      const matricola = match ? match[1] : '';
      const student = users.find((u) => u.matricola === matricola);
      if (student) {
        targetNotifs.push({
          id: makeId('notice'),
          title: 'Comunicazione docente',
          body: `${course}: ${teacherMessage.trim()}`,
          target: student.id,
          date: 'Oggi',
        });
      }
    }

    if (targetNotifs.length === 0) {
      return;
    }

    setCustomNotifications((previous) => [...targetNotifs, ...previous]);
    for (const notif of targetNotifs) {
      try {
        if (currentUser) {
          await api.createNotification({
            id: notif.id,
            title: notif.title,
            body: notif.body,
            target: notif.target,
            date: notif.date,
            senderId: currentUser.id
          });
        }
      } catch (err) {
        console.warn('Failed to sync teacher communication notification to backend', err);
      }
    }

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
    const assignedTo = (currentUser && currentUser.role === 'PTA')
      ? (status === 'Aperto' ? null : currentUser.id)
      : undefined;

    setTickets((previous) => previous.map((ticketItem) => (ticketItem.id === id ? { ...ticketItem, status, assignedTo: assignedTo || undefined } : ticketItem)));

    try {
      await api.updateTicket(id, status, assignedTo || undefined);
    } catch (err: any) {
      console.warn('Backend ticket status update failed, updated locally only.', err.message);
    }

    showNotice(status === 'In carico' ? t('toastTicketAssigned') : status === 'Chiuso' ? t('toastTicketClosed') : `Ticket ${status}`);
  };

  const handleArchive = (id: string) => {
    setArchivedNotifIds((prev) => [...prev, id]);
    showNotice(t('notificationArchivedToast'));
  };

  const handleRestore = (id: string) => {
    setArchivedNotifIds((prev) => prev.filter((x) => x !== id));
    showNotice(t('notificationRestoredToast'));
  };

  const handleDelete = (id: string) => {
    setDeletedNotifIds((prev) => [...prev, id]);
    showNotice(t('notificationDeletedToast'));
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

  const handlePasswordChange = async (newPassword: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, password: newPassword };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    
    try {
      await api.updateProfile({
        id: updated.id,
        name: updated.name,
        surname: updated.surname,
        phone: updated.phone,
        matricola: updated.matricola,
        department: updated.department,
        degreeCourse: updated.degreeCourse,
        workScope: updated.ptaDomain,
        selectedTeachings: updated.teachings,
        selectedCourses: updated.teacherDegrees,
        language: updated.language,
        password: newPassword
      });
    } catch (err: any) {
      console.warn('Backend password update failed:', err.message);
    }
  };

  const deleteExam = async (examId: string) => {
    try {
      await api.deleteExam(examId);
      setExams((previous) => previous.filter((e) => e.id !== examId));
      showNotice(appLanguage === 'IT' ? 'Esame rimosso con successo' : 'Exam removed successfully');
    } catch (err: any) {
      console.warn('Backend delete exam failed:', err.message);
      setExams((previous) => previous.filter((e) => e.id !== examId));
      showNotice(appLanguage === 'IT' ? 'Esame rimosso localmente' : 'Exam removed locally');
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
            await api.updateSlot(mod.id, mod.status || 'Libero', mod.desc, mod.bookedByStudentId);
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

  return {
    isWide,
    mainScrollRef,
    sectionPositions,
    pendingScrollSection,
    handleSectionLayout,
    booting,
    authMode,
    setAuthMode,
    rememberSession,
    setRememberSession,
    users,
    setUsers,
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    toast,
    appLanguage,
    setAppLanguage,
    showNotificationsModal,
    setShowNotificationsModal,
    archivedNotifIds,
    setArchivedNotifIds,
    deletedNotifIds,
    setDeletedNotifIds,
    activeNotifTab,
    setActiveNotifTab,
    archivedTicketIds,
    setArchivedTicketIds,
    deletedTicketIds,
    setDeletedTicketIds,
    selectedNotification,
    setSelectedNotification,
    weatherData,
    loadingWeather,
    ateneoNews,
    t,
    authDraft,
    setAuthDraft,
    authPhonePrefix,
    setAuthPhonePrefix,
    profileDraft,
    setProfileDraft,
    careerStats,
    exams,
    newExam,
    setNewExam,
    tickets,
    ticketDraft,
    setTicketDraft,
    customNotifications,
    teacherMessage,
    setTeacherMessage,
    teacherResult,
    setTeacherResult,
    reception,
    setReception,
    receptionSlots,
    feedback,
    setFeedback,
    selectedPointId,
    setSelectedPointId,
    activeNotifications,
    archivedNotifications,
    searchResults,
    showNotice,
    syncUser,
    handleLogin,
    handleRegister,
    handleLogout,
    handleAddExam,
    updateExamStatus,
    addNotification,
    publishTeacherResult,
    sendTeacherMessage,
    sendFeedback,
    createTicket,
    updateTicketStatus,
    handleArchive,
    handleRestore,
    handleDelete,
    handleNotificationClick,
    handlePasswordChange,
    deleteExam,
    saveProfile,
    deleteAccount,
    syncSlots,
    openExternal,
  };
}
