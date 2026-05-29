import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
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
  CloudSun,
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
  Ticket,
  Trash2,
  Trophy,
  User,
  Users,
  Utensils,
  XCircle,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
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
} from './src/data';
import { colors, radii, shadow } from './src/theme';
import type { CampusPoint, Exam, ExamStatus, MainTab, NotificationItem, Role, Ticket as TicketType, UserProfile } from './src/types';

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

type DraftProfile = Pick<UserProfile, 'name' | 'surname' | 'email' | 'phone' | 'department' | 'language'>;

const totalDegreeCfu = 180;

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const isInstitutionalEmail = (email: string) => /@((studenti\.)?unisa\.it)$/i.test(email.trim());

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

const formatAverage = (value: number) => (Number.isFinite(value) ? value.toFixed(2) : '0.00');

const roleIcon: Record<Role, IconComponent> = {
  Studente: GraduationCap,
  Docente: BookOpen,
  PTA: Briefcase,
};

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  const [booting, setBooting] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [rememberSession, setRememberSession] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>(demoUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [authDraft, setAuthDraft] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    department: 'Informatica',
    role: 'Studente' as Role,
  });

  const [profileDraft, setProfileDraft] = useState<DraftProfile>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    department: '',
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
      Alert.alert('Accesso non riuscito', 'Credenziali errate. Puoi usare password "demo" per gli account dimostrativi.');
      return;
    }

    setCurrentUser(loginUser);
    setProfileDraft(toProfileDraft(loginUser));
    setActiveTab('home');

    if (rememberSession) {
      await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(loginUser.id));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.session);
    }

    showNotice(`Accesso effettuato come ${loginUser.role}`);
  };

  const handleRegister = async () => {
    if (!authDraft.name.trim() || !authDraft.surname.trim() || !authDraft.password.trim()) {
      Alert.alert('Dati mancanti', 'Inserisci nome, cognome e password.');
      return;
    }

    if (!isInstitutionalEmail(authDraft.email)) {
      Alert.alert('E-mail non valida', 'Usa una mail istituzionale @unisa.it o @studenti.unisa.it.');
      return;
    }

    if (users.some((user) => user.email.toLowerCase() === authDraft.email.trim().toLowerCase())) {
      Alert.alert('Account gia presente', 'Questo indirizzo e-mail risulta gia registrato.');
      return;
    }

    const newUser: UserProfile = {
      id: makeId('user'),
      name: authDraft.name.trim(),
      surname: authDraft.surname.trim(),
      email: authDraft.email.trim(),
      password: authDraft.password,
      role: authDraft.role,
      department: authDraft.department.trim() || 'Ateneo',
      phone: authDraft.phone.trim() || 'Non indicato',
      language: 'IT',
    };

    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setProfileDraft(toProfileDraft(newUser));
    setActiveTab('home');

    if (rememberSession) {
      await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(newUser.id));
    }

    showNotice('Registrazione completata');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.session);
    setCurrentUser(null);
    setActiveTab('home');
    setSearchTerm('');
  };

  const handleAddExam = () => {
    const cfu = Number.parseInt(newExam.cfu, 10);
    const grade = Number.parseInt(newExam.grade, 10);

    if (!newExam.course.trim() || Number.isNaN(cfu) || Number.isNaN(grade) || cfu <= 0 || grade < 18 || grade > 30) {
      Alert.alert('Dati esame non validi', 'Inserisci corso, CFU positivi e voto tra 18 e 30.');
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
    showNotice('Dati carriera salvati');
  };

  const updateExamStatus = (id: string, status: ExamStatus) => {
    setExams((previous) => previous.map((exam) => (exam.id === id ? { ...exam, status } : exam)));
    showNotice(status === 'Accettato' ? 'Esito accettato' : 'Esito rifiutato');
  };

  const publishTeacherResult = () => {
    const grade = Number.parseInt(teacherResult.grade, 10);

    if (!teacherResult.student.trim() || Number.isNaN(grade) || grade < 18 || grade > 30) {
      Alert.alert('Pubblicazione non valida', 'Inserisci studente e voto tra 18 e 30.');
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
        body: `${teacherResult.course}: pubblicato voto ${grade} per ${teacherResult.student}.`,
        target: 'Studente',
        date: 'Oggi',
      },
      ...previous,
    ]);
    setTeacherResult({ student: '', course: teacherCourses[0].name, grade: '28' });
    showNotice('Esito pubblicato agli studenti');
  };

  const sendTeacherMessage = () => {
    if (!teacherMessage.trim()) {
      Alert.alert('Messaggio vuoto', 'Scrivi una comunicazione da inviare agli studenti.');
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
    showNotice('Comunicazione inviata');
  };

  const sendFeedback = () => {
    if (!feedback.trim()) {
      Alert.alert('Segnalazione vuota', 'Descrivi il problema o il suggerimento per gli sviluppatori.');
      return;
    }

    setFeedback('');
    showNotice('Feedback inviato agli sviluppatori');
  };

  const createTicket = () => {
    if (!ticketDraft.title.trim() || !ticketDraft.location.trim() || !ticketDraft.body.trim()) {
      Alert.alert('Ticket incompleto', 'Inserisci titolo, luogo e descrizione della richiesta.');
      return;
    }

    setTickets((previous) => [
      {
        id: makeId('ticket'),
        title: ticketDraft.title.trim(),
        requester: currentUser ? `${currentUser.name} ${currentUser.surname}` : 'Utente',
        location: ticketDraft.location.trim(),
        body: ticketDraft.body.trim(),
        status: 'Aperto',
        priority: ticketDraft.priority,
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
    showNotice('Ticket inviato al PTA');
  };

  const updateTicketStatus = (id: string, status: TicketType['status']) => {
    setTickets((previous) => previous.map((ticketItem) => (ticketItem.id === id ? { ...ticketItem, status } : ticketItem)));
    showNotice(`Ticket ${status.toLowerCase()}`);
  };

  const saveProfile = () => {
    if (!currentUser) {
      return;
    }

    if (!profileDraft.name.trim() || !profileDraft.surname.trim() || !isInstitutionalEmail(profileDraft.email)) {
      Alert.alert('Dati profilo non validi', 'Controlla nome, cognome e mail istituzionale.');
      return;
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      name: profileDraft.name.trim(),
      surname: profileDraft.surname.trim(),
      email: profileDraft.email.trim(),
      phone: profileDraft.phone.trim(),
      department: profileDraft.department.trim(),
      language: profileDraft.language,
    };

    syncUser(updatedUser);
    showNotice('Profilo aggiornato');
  };

  const deleteAccount = () => {
    if (!currentUser) {
      return;
    }

    Alert.alert('Eliminare account?', 'L’account verra rimosso dai dati locali del prototipo.', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: async () => {
          setUsers((previous) => previous.filter((user) => user.id !== currentUser.id));
          await handleLogout();
          showNotice('Account eliminato');
        },
      },
    ]);
  };

  const openExternal = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Collegamento non disponibile', 'Il dispositivo non riesce ad aprire questo collegamento.');
    }
  };

  if (booting) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.boot}>
          <StatusBar style="dark" />
          <Text style={styles.brand}>UnisAllRound</Text>
          <Text style={styles.mutedText}>Caricamento sessione...</Text>
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
                <Text style={styles.authSubtitle}>
                  L’app unica per studenti, docenti e personale tecnico-amministrativo dell’Universita degli Studi di Salerno.
                </Text>
              </View>

              <View style={styles.authCard}>
                <SegmentedControl
                  options={[
                    { value: 'login', label: 'Login' },
                    { value: 'register', label: 'Registrati' },
                  ]}
                  value={authMode}
                  onChange={(value) => setAuthMode(value as AuthMode)}
                />

                {authMode === 'register' ? (
                  <View style={styles.formGrid}>
                    <Field label="Nome" value={authDraft.name} onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, name: value }))} />
                    <Field
                      label="Cognome"
                      value={authDraft.surname}
                      onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, surname: value }))}
                    />
                  </View>
                ) : null}

                <Field
                  label="E-mail istituzionale"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={authDraft.email}
                  onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, email: value }))}
                />
                <Field
                  label="Password"
                  secureTextEntry
                  value={authDraft.password}
                  onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, password: value }))}
                />

                {authMode === 'register' ? (
                  <>
                    <Field
                      label="Dipartimento / ufficio"
                      value={authDraft.department}
                      onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, department: value }))}
                    />
                    <Field
                      label="Telefono"
                      keyboardType="phone-pad"
                      value={authDraft.phone}
                      onChangeText={(value) => setAuthDraft((draft) => ({ ...draft, phone: value }))}
                    />
                    <Text style={styles.inputLabel}>Tipo utenza</Text>
                    <RolePicker value={authDraft.role} onChange={(role) => setAuthDraft((draft) => ({ ...draft, role }))} />
                  </>
                ) : null}

                <Pressable style={styles.checkboxRow} onPress={() => setRememberSession((value) => !value)}>
                  <View style={[styles.checkbox, rememberSession && styles.checkboxOn]}>
                    {rememberSession ? <CheckCircle2 color={colors.surface} size={16} /> : null}
                  </View>
                  <Text style={styles.checkboxText}>Resta loggato su questo dispositivo</Text>
                </Pressable>

                <ActionButton
                  label={authMode === 'login' ? 'Accedi' : 'Crea account'}
                  icon={authMode === 'login' ? ShieldCheck : Save}
                  onPress={authMode === 'login' ? () => handleLogin() : handleRegister}
                />

                <View style={styles.demoStrip}>
                  {demoUsers.map((demoUser) => (
                    <Pressable key={demoUser.id} style={styles.demoButton} onPress={() => handleLogin(demoUser)}>
                      <Text style={styles.demoButtonText}>{demoUser.role}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.hintText}>Account demo: scegli un ruolo oppure usa password “demo”.</Text>
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
            <Text style={styles.smallCaps}>Universita di Salerno</Text>
            <Text style={styles.appTitle}>UnisAllRound</Text>
          </View>
          <View style={styles.roleBadge}>
            <ActiveRoleIcon color={roleCopy[currentUser.role].accent} size={18} />
            <Text style={[styles.roleBadgeText, { color: roleCopy[currentUser.role].accent }]}>{currentUser.role}</Text>
          </View>
        </View>

        <View style={styles.searchShell}>
          <Search color={colors.muted} size={18} />
          <TextInput
            placeholder="Cerca servizi, lezioni, ticket..."
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
                  setActiveTab(item.tab);
                  setSearchTerm('');
                }}
              >
                <Text style={styles.searchResultTitle}>{item.title}</Text>
                <Text style={styles.searchResultMeta}>Apri</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <ScrollView contentContainerStyle={[styles.content, isWide && styles.contentWide]} showsVerticalScrollIndicator={false}>
          {activeTab === 'home' ? (
            <HomeScreen
              user={currentUser}
              isWide={isWide}
              careerStats={careerStats}
              notifications={roleNotifications}
              onOpenTab={setActiveTab}
            />
          ) : null}
          {activeTab === 'role' ? (
            <RoleScreen
              user={currentUser}
              stats={careerStats}
              exams={exams}
              newExam={newExam}
              setNewExam={setNewExam}
              lessons={lessons}
              tickets={tickets}
              teacherMessage={teacherMessage}
              setTeacherMessage={setTeacherMessage}
              teacherResult={teacherResult}
              setTeacherResult={setTeacherResult}
              reception={reception}
              setReception={setReception}
              onAddExam={handleAddExam}
              onExamStatus={updateExamStatus}
              onPublishResult={publishTeacherResult}
              onSendTeacherMessage={sendTeacherMessage}
              onTicketStatus={updateTicketStatus}
              onOpenExternal={openExternal}
            />
          ) : null}
          {activeTab === 'campus' ? (
            <CampusScreen
              selectedPoint={selectedPoint}
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              onOpenExternal={openExternal}
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
            />
          ) : null}
          {activeTab === 'profile' ? (
            <ProfileScreen
              user={currentUser}
              draft={profileDraft}
              setDraft={setProfileDraft}
              notifications={roleNotifications}
              onSave={saveProfile}
              onDelete={deleteAccount}
              onLogout={handleLogout}
            />
          ) : null}
        </ScrollView>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} role={currentUser.role} notificationCount={roleNotifications.length} />
        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
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
    language: user.language,
  };
}

function HomeScreen({
  user,
  isWide,
  careerStats,
  notifications: notificationRows,
  onOpenTab,
}: {
  user: UserProfile;
  isWide: boolean;
  careerStats: { completed: number; cfu: number; arithmetic: number; weighted: number; progress: number };
  notifications: NotificationItem[];
  onOpenTab: (tab: MainTab) => void;
}) {
  const RoleIcon = roleIcon[user.role];
  const copy = roleCopy[user.role];

  return (
    <View>
      <View style={[styles.heroPanel, { borderColor: copy.accent }]}>
        <View style={styles.heroIcon}>
          <RoleIcon color={copy.accent} size={30} strokeWidth={2.2} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroKicker}>Ciao {user.name}</Text>
          <Text style={styles.heroTitle}>{copy.title}</Text>
          <Text style={styles.heroSubtitle}>{copy.subtitle}</Text>
        </View>
      </View>

      <View style={[styles.quickGrid, isWide && styles.quickGridWide]}>
        {user.role === 'Studente' ? (
          <>
            <StatCard label="Esami superati" value={`${careerStats.completed}`} icon={CheckCircle2} tone="green" />
            <StatCard label="Media ponderata" value={formatAverage(careerStats.weighted)} icon={GraduationCap} tone="blue" />
            <StatCard label="CFU acquisiti" value={`${careerStats.cfu}/${totalDegreeCfu}`} icon={BookOpen} tone="amber" />
            <StatCard label="Avanzamento" value={`${careerStats.progress}%`} icon={Trophy} tone="coral" />
          </>
        ) : null}
        {user.role === 'Docente' ? (
          <>
            <StatCard label="Corsi attivi" value={`${teacherCourses.length}`} icon={BookOpen} tone="green" />
            <StatCard label="Studenti seguiti" value="128" icon={Users} tone="blue" />
            <StatCard label="Avvisi inviati" value="4" icon={Megaphone} tone="amber" />
            <StatCard label="Ricevimento" value="2h" icon={CalendarDays} tone="coral" />
          </>
        ) : null}
        {user.role === 'PTA' ? (
          <>
            <StatCard label="Ticket aperti" value="2" icon={Ticket} tone="coral" />
            <StatCard label="Interventi oggi" value="5" icon={ClipboardList} tone="blue" />
            <StatCard label="Turno" value="08-14" icon={Briefcase} tone="green" />
            <StatCard label="Priorita alta" value="1" icon={Bell} tone="amber" />
          </>
        ) : null}
      </View>

      <SectionTitle title="Accessi rapidi" subtitle="Le aree principali richieste dall’analisi dei requisiti." />
      <View style={styles.tileGrid}>
        <ServiceTile label="Area ruolo" detail="Funzioni personalizzate" icon={RoleIcon} onPress={() => onOpenTab('role')} />
        <ServiceTile label="Campus" detail="News, mappa, meteo" icon={MapPin} onPress={() => onOpenTab('campus')} />
        <ServiceTile label="Servizi" detail="Ticket, FAQ, feedback" icon={MessageSquare} onPress={() => onOpenTab('services')} />
        <ServiceTile label="Profilo" detail="Dati e sessione" icon={CircleUserRound} onPress={() => onOpenTab('profile')} />
      </View>

      <SectionTitle title="Notifiche" subtitle="Annunci filtrati in base allo status configurato." />
      {notificationRows.slice(0, 3).map((item) => (
        <ListRow key={item.id} icon={Bell} title={item.title} subtitle={item.body} meta={item.date} />
      ))}
    </View>
  );
}

function RoleScreen({
  user,
  stats,
  exams: examRows,
  newExam,
  setNewExam,
  tickets: ticketRows,
  teacherMessage,
  setTeacherMessage,
  teacherResult,
  setTeacherResult,
  reception,
  setReception,
  onAddExam,
  onExamStatus,
  onPublishResult,
  onSendTeacherMessage,
  onTicketStatus,
  onOpenExternal,
}: {
  user: UserProfile;
  stats: { completed: number; cfu: number; arithmetic: number; weighted: number; progress: number };
  exams: Exam[];
  newExam: { course: string; cfu: string; grade: string };
  setNewExam: Dispatch<SetStateAction<{ course: string; cfu: string; grade: string }>>;
  lessons: typeof lessons;
  tickets: TicketType[];
  teacherMessage: string;
  setTeacherMessage: (value: string) => void;
  teacherResult: { student: string; course: string; grade: string };
  setTeacherResult: Dispatch<SetStateAction<{ student: string; course: string; grade: string }>>;
  reception: string;
  setReception: (value: string) => void;
  onAddExam: () => void;
  onExamStatus: (id: string, status: ExamStatus) => void;
  onPublishResult: () => void;
  onSendTeacherMessage: () => void;
  onTicketStatus: (id: string, status: TicketType['status']) => void;
  onOpenExternal: (url: string) => void;
}) {
  if (user.role === 'Studente') {
    return (
      <View>
        <SectionTitle title="Carriera studente" subtitle="Inserimento dati e statistiche calcolate dal sistema." />
        <View style={styles.card}>
          <View style={styles.statsLine}>
            <StatPill label="Esami" value={`${stats.completed}`} />
            <StatPill label="Media" value={formatAverage(stats.arithmetic)} />
            <StatPill label="Ponderata" value={formatAverage(stats.weighted)} />
            <StatPill label="CFU" value={`${stats.cfu}`} />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${stats.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{stats.progress}% del percorso da {totalDegreeCfu} CFU</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inserisci risultato accademico</Text>
          <Field label="Corso" value={newExam.course} onChangeText={(value) => setNewExam((draft) => ({ ...draft, course: value }))} />
          <View style={styles.formGrid}>
            <Field
              label="CFU"
              keyboardType="number-pad"
              value={newExam.cfu}
              onChangeText={(value) => setNewExam((draft) => ({ ...draft, cfu: value }))}
            />
            <Field
              label="Voto"
              keyboardType="number-pad"
              value={newExam.grade}
              onChangeText={(value) => setNewExam((draft) => ({ ...draft, grade: value }))}
            />
          </View>
          <ActionButton label="Salva dati carriera" icon={Plus} onPress={onAddExam} />
        </View>

        <SectionTitle title="Didattica" subtitle="Orari, aule, esiti e collegamenti rapidi." />
        {lessons.map((lesson) => (
          <ListRow
            key={lesson.id}
            icon={CalendarDays}
            title={`${lesson.day} - ${lesson.course}`}
            subtitle={`${lesson.time} · ${lesson.room} · ${lesson.teacher}`}
          />
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Esiti pubblicati</Text>
          {examRows.map((exam) => (
            <View key={exam.id} style={styles.examRow}>
              <View style={styles.flexOne}>
                <Text style={styles.rowTitle}>{exam.course}</Text>
                <Text style={styles.rowSubtitle}>
                  {exam.grade}/30 · {exam.cfu} CFU · {exam.status}
                </Text>
              </View>
              {exam.status === 'Da valutare' ? (
                <View style={styles.rowActions}>
                  <IconButton label="Accetta" icon={CheckCircle2} onPress={() => onExamStatus(exam.id, 'Accettato')} />
                  <IconButton label="Rifiuta" icon={XCircle} onPress={() => onExamStatus(exam.id, 'Rifiutato')} danger />
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.tileGrid}>
          <ServiceTile label="E-learning" detail="Accesso rapido" icon={ExternalLink} onPress={() => onOpenExternal('https://elearning.unisa.it/')} />
          <ServiceTile label="Biblioteca" detail="Prenota posto" icon={Library} onPress={() => onOpenExternal('https://biblioteche.unisa.it/')} />
          <ServiceTile
            label="Ricevimento"
            detail="Invia e-mail docente"
            icon={Mail}
            onPress={() => onOpenExternal('mailto:docente@unisa.it?subject=Richiesta%20ricevimento')}
          />
        </View>
      </View>
    );
  }

  if (user.role === 'Docente') {
    return (
      <View>
        <SectionTitle title="Area docente" subtitle="Corsi, aule assegnate, risultati e comunicazioni." />
        {teacherCourses.map((course) => (
          <ListRow
            key={course.id}
            icon={BookOpen}
            title={`${course.name} · ${course.room}`}
            subtitle={`${course.students} studenti · Materiale: ${course.material}`}
          />
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pubblica esito esame</Text>
          <Field
            label="Studente"
            value={teacherResult.student}
            onChangeText={(value) => setTeacherResult((draft) => ({ ...draft, student: value }))}
          />
          <Field
            label="Corso"
            value={teacherResult.course}
            onChangeText={(value) => setTeacherResult((draft) => ({ ...draft, course: value }))}
          />
          <Field
            label="Voto"
            keyboardType="number-pad"
            value={teacherResult.grade}
            onChangeText={(value) => setTeacherResult((draft) => ({ ...draft, grade: value }))}
          />
          <ActionButton label="Pubblica risultato" icon={Send} onPress={onPublishResult} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comunicazioni agli studenti</Text>
          <Field label="Messaggio" multiline value={teacherMessage} onChangeText={setTeacherMessage} />
          <ActionButton label="Invia comunicazione" icon={Megaphone} onPress={onSendTeacherMessage} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ricevimento</Text>
          <Field label="Orari e luogo" multiline value={reception} onChangeText={setReception} />
          <ActionButton label="Aggiorna bacheca" icon={Save} onPress={() => Alert.alert('Ricevimento aggiornato', reception)} />
        </View>
      </View>
    );
  }

  return (
    <View>
      <SectionTitle title="Area PTA" subtitle="Orario di lavoro e gestione ticket di supporto." />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Turno settimanale</Text>
        {['Lunedi 08:00 - 14:00', 'Martedi 08:00 - 14:00', 'Mercoledi 14:00 - 20:00', 'Giovedi 08:00 - 14:00'].map((row) => (
          <ListRow key={row} icon={CalendarDays} title={row} subtitle="Presidio tecnico-amministrativo campus" compact />
        ))}
      </View>

      <SectionTitle title="Richieste in sospeso" subtitle="Accetta, rifiuta o chiudi gli interventi generati dagli utenti." />
      {ticketRows.map((ticketItem) => (
        <View key={ticketItem.id} style={styles.card}>
          <View style={styles.ticketHeader}>
            <View style={styles.flexOne}>
              <Text style={styles.cardTitle}>{ticketItem.title}</Text>
              <Text style={styles.rowSubtitle}>{ticketItem.location} · Priorita {ticketItem.priority}</Text>
            </View>
            <StatusBadge value={ticketItem.status} />
          </View>
          <Text style={styles.bodyText}>{ticketItem.body}</Text>
          <View style={styles.rowActions}>
            <IconButton label="Prendi" icon={CheckCircle2} onPress={() => onTicketStatus(ticketItem.id, 'In carico')} />
            <IconButton label="Chiudi" icon={ShieldCheck} onPress={() => onTicketStatus(ticketItem.id, 'Chiuso')} />
          </View>
        </View>
      ))}
    </View>
  );
}

function CampusScreen({
  selectedPoint,
  selectedPointId,
  onSelectPoint,
  onOpenExternal,
}: {
  selectedPoint: CampusPoint;
  selectedPointId: string;
  onSelectPoint: (id: string) => void;
  onOpenExternal: (url: string) => void;
}) {
  return (
    <View>
      <SectionTitle title="Campus" subtitle="News, meteo, mensa, trasporti e mappa interattiva Fisciano-Baronissi." />
      {news.map((item) => (
        <ListRow key={item.id} icon={Megaphone} title={item.title} subtitle={item.body} meta={item.tag} />
      ))}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mappa interattiva del campus</Text>
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
          <Text style={styles.cardTitle}>{selectedPoint.name}</Text>
          <Text style={styles.rowSubtitle}>{selectedPoint.type}</Text>
          <Text style={styles.bodyText}>{selectedPoint.detail}</Text>
        </View>
      </View>

      <SectionTitle title="Mensa e meteo" subtitle="Informazioni settimanali e dati per sede." />
      {weeklyMenu.map((day) => (
        <ListRow key={day.day} icon={Utensils} title={`${day.day}: ${day.first}`} subtitle={`${day.second} · Veg: ${day.veg}`} compact />
      ))}
      {weatherRows.map((weather) => (
        <ListRow
          key={weather.site}
          icon={CloudSun}
          title={`${weather.site}: ${weather.temp}`}
          subtitle={`${weather.condition} · ${weather.note}`}
          compact
        />
      ))}

      <SectionTitle title="Trasporti e CUS" subtitle="Orari bus, fermate e contatti sportivi." />
      {transportRows.map((row) => (
        <ListRow key={row.line} icon={Bus} title={`Linea ${row.line} · ${row.next}`} subtitle={`${row.route} · ${row.platform}`} compact />
      ))}
      {cusActivities.map((activity) => (
        <ListRow
          key={activity.name}
          icon={Trophy}
          title={`${activity.name} · ${activity.when}`}
          subtitle={activity.contact}
          compact
          actionLabel="Mail"
          onPress={() => onOpenExternal(`mailto:${activity.contact}`)}
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
}: {
  feedback: string;
  setFeedback: (value: string) => void;
  ticketDraft: { title: string; location: string; body: string; priority: TicketType['priority'] };
  setTicketDraft: Dispatch<SetStateAction<{ title: string; location: string; body: string; priority: TicketType['priority'] }>>;
  onFeedback: () => void;
  onCreateTicket: () => void;
  onOpenExternal: (url: string) => void;
}) {
  return (
    <View>
      <SectionTitle title="Servizi" subtitle="Ticket, FAQ, feedback e collegamenti richiesti nei casi d’uso generici." />
      <View style={styles.tileGrid}>
        <ServiceTile label="Posto biblioteca" detail="Apri prenotazione" icon={Library} onPress={() => onOpenExternal('https://biblioteche.unisa.it/')} />
        <ServiceTile label="E-learning" detail="Piattaforma corsi" icon={ExternalLink} onPress={() => onOpenExternal('https://elearning.unisa.it/')} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Richiedi supporto PTA</Text>
        <Field label="Titolo" value={ticketDraft.title} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, title: value }))} />
        <Field label="Luogo" value={ticketDraft.location} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, location: value }))} />
        <Field label="Descrizione" multiline value={ticketDraft.body} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, body: value }))} />
        <Text style={styles.inputLabel}>Priorita</Text>
        <SegmentedControl
          options={[
            { value: 'Bassa', label: 'Bassa' },
            { value: 'Media', label: 'Media' },
            { value: 'Alta', label: 'Alta' },
          ]}
          value={ticketDraft.priority}
          onChange={(value) => setTicketDraft((draft) => ({ ...draft, priority: value as TicketType['priority'] }))}
        />
        <ActionButton label="Invia ticket" icon={Ticket} onPress={onCreateTicket} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Feedback agli sviluppatori</Text>
        <Field label="Segnalazione o suggerimento" multiline value={feedback} onChangeText={setFeedback} />
        <ActionButton label="Invia feedback" icon={MessageSquare} onPress={onFeedback} />
      </View>

      <SectionTitle title="FAQ" subtitle="Risposte rapide alle domande ricorrenti." />
      {faqRows.map((row) => (
        <ListRow key={row.q} icon={MessageSquare} title={row.q} subtitle={row.a} compact />
      ))}
    </View>
  );
}

function ProfileScreen({
  user,
  draft,
  setDraft,
  notifications: notificationRows,
  onSave,
  onDelete,
  onLogout,
}: {
  user: UserProfile;
  draft: DraftProfile;
  setDraft: Dispatch<SetStateAction<DraftProfile>>;
  notifications: NotificationItem[];
  onSave: () => void;
  onDelete: () => void;
  onLogout: () => void;
}) {
  return (
    <View>
      <SectionTitle title="Profilo" subtitle="Consultazione e modifica dei dati personali salvati in fase di registrazione." />
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <User color={colors.surface} size={28} />
        </View>
        <View style={styles.flexOne}>
          <Text style={styles.profileName}>
            {user.name} {user.surname}
          </Text>
          <Text style={styles.rowSubtitle}>{user.role} · {user.department}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dati personali</Text>
        <View style={styles.formGrid}>
          <Field label="Nome" value={draft.name} onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))} />
          <Field label="Cognome" value={draft.surname} onChangeText={(value) => setDraft((current) => ({ ...current, surname: value }))} />
        </View>
        <Field label="E-mail" autoCapitalize="none" value={draft.email} onChangeText={(value) => setDraft((current) => ({ ...current, email: value }))} />
        <Field label="Telefono" value={draft.phone} onChangeText={(value) => setDraft((current) => ({ ...current, phone: value }))} />
        <Field
          label="Dipartimento / ufficio"
          value={draft.department}
          onChangeText={(value) => setDraft((current) => ({ ...current, department: value }))}
        />
        <Text style={styles.inputLabel}>Lingua</Text>
        <SegmentedControl
          options={[
            { value: 'IT', label: 'IT' },
            { value: 'EN', label: 'EN' },
          ]}
          value={draft.language}
          onChange={(value) => setDraft((current) => ({ ...current, language: value as DraftProfile['language'] }))}
        />
        <ActionButton label="Salva modifiche" icon={Save} onPress={onSave} />
      </View>

      <SectionTitle title="Centro notifiche" subtitle="Comunicazioni e annunci ricevuti in base al profilo." />
      {notificationRows.map((item) => (
        <ListRow key={item.id} icon={Bell} title={item.title} subtitle={item.body} meta={item.date} compact />
      ))}

      <View style={styles.dangerZone}>
        <ActionButton label="Esci" icon={LogOut} onPress={onLogout} secondary />
        <ActionButton label="Elimina account" icon={Trash2} onPress={onDelete} danger />
      </View>
    </View>
  );
}

function BottomNav({
  activeTab,
  onChange,
  role,
  notificationCount,
}: {
  activeTab: MainTab;
  onChange: (tab: MainTab) => void;
  role: Role;
  notificationCount: number;
}) {
  const RoleNavIcon = roleIcon[role];
  const items: Array<{ key: MainTab; label: string; icon: IconComponent; badge?: number }> = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'role', label: role, icon: RoleNavIcon },
    { key: 'campus', label: 'Campus', icon: MapPin },
    { key: 'services', label: 'Servizi', icon: ClipboardList },
    { key: 'profile', label: 'Profilo', icon: CircleUserRound, badge: notificationCount },
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
              {item.badge ? (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
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
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
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

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: IconComponent; tone: 'green' | 'blue' | 'amber' | 'coral' }) {
  const toneStyles = {
    green: { bg: colors.mint, fg: colors.forest },
    blue: { bg: colors.blueSoft, fg: colors.blue },
    amber: { bg: colors.amberSoft, fg: '#7A4A00' },
    coral: { bg: colors.coralSoft, fg: colors.danger },
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
    padding: 18,
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
});
