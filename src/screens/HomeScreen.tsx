import React, { useState, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { UNISA_COURSES, getTeachingsForDegrees, getTeachingCfu } from '../data';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  CheckCircle2,
  Calculator,
  BookOpen,
  Trophy,
  Users,
  Megaphone,
  CalendarDays,
  Briefcase,
  Ticket,
  Plus,
  XCircle,
  Send,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  Square,
  CheckSquare,
  Archive,
  Trash2,
  RotateCcw,
} from 'lucide-react-native';

import { colors, radii } from '../theme';
import { styles } from '../styles';
import type {
  UserProfile,
  Exam,
  Lesson,
  ReceptionSlot,
  ExamStatus,
  Ticket as TicketType,
  MainTab,
  NotificationItem,
} from '../types';
import { translations } from '../constants';
import {
  capitalizeWords,
  formatAverage,
  getDegreeCfu,
  makeId,
  roleIcon,
} from '../utils';
import {
  StatCard,
  Field,
  ActionButton,
  ListRow,
  IconButton,
  SegmentedControl,
  SectionTitle,
  StatusBadge,
  SwipeableRow,
  CustomPicker,
} from '../components';

export default function HomeScreen({
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
  onDeleteExam,
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
  receptionSlots,
  onSyncSlots,
  onAddNotification,
  users,
  customNotifications,
  archivedTicketIds,
  deletedTicketIds,
  onArchiveTicket,
  onDeleteTicket,
}: {
  user: UserProfile;
  isWide: boolean;
  careerStats: { completed: number; cfu: number; arithmetic: number; weighted: number; progress: number };
  onOpenTab: (tab: MainTab) => void;
  exams: Exam[];
  newExam: { course: string; cfu: string; grade: string; lode: boolean };
  setNewExam: Dispatch<SetStateAction<{ course: string; cfu: string; grade: string; lode: boolean }>>;
  lessons: Lesson[];
  onAddExam: () => void;
  onExamStatus: (id: string, status: ExamStatus) => void;
  onDeleteExam: (id: string) => void;
  onOpenExternal: (url: string) => void;
  t: (key: keyof typeof translations.IT) => string;
  teacherMessage: string;
  setTeacherMessage: (value: string) => void;
  teacherResult: { students: string[]; course: string; grade: string; lode: boolean };
  setTeacherResult: Dispatch<SetStateAction<{ students: string[]; course: string; grade: string; lode: boolean }>>;
  reception: string;
  setReception: (value: string) => void;
  onPublishResult: () => void;
  onSendTeacherMessage: (course: string, students: string[]) => void;
  tickets: TicketType[];
  onTicketStatus: (id: string, status: TicketType['status']) => void;
  onSectionLayout?: (name: string, y: number) => void;
  receptionSlots: ReceptionSlot[];
  onSyncSlots: (slots: ReceptionSlot[]) => void;
  onAddNotification: (notif: NotificationItem) => void;
  users: UserProfile[];
  customNotifications: NotificationItem[];
  archivedTicketIds: string[];
  deletedTicketIds: string[];
  onArchiveTicket: (id: string) => void;
  onDeleteTicket: (id: string) => void;
}) {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const appLang = user?.language || 'IT';
  const [passedExamsModalVisible, setPassedExamsModalVisible] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<'Lunedì' | 'Martedì' | 'Mercoledì' | 'Giovedì' | 'Venerdì'>('Lunedì');
  const [studentDayTab, setStudentDayTab] = useState<'Lunedì' | 'Martedì' | 'Mercoledì' | 'Giovedì' | 'Venerdì'>('Lunedì');
  const [activePtaTicketTab, setActivePtaTicketTab] = useState<'active' | 'archived'>('active');
  const slots = user.role === 'Studente'
    ? receptionSlots.filter(s => s.teaching && user.teachings && user.teachings.includes(s.teaching))
    : receptionSlots;
  const syncSlotsToParent = onSyncSlots;
  const [editingSlot, setEditingSlot] = useState<{ day: 'Lunedì' | 'Martedì' | 'Mercoledì' | 'Giovedì' | 'Venerdì'; time: string; desc: string } | null>(null);
  const [editDesc, setEditDesc] = useState('');

  const [archiveExpanded, setArchiveExpanded] = useState(false);
  const [filterDay, setFilterDay] = useState('Tutti');
  const [filterMonth, setFilterMonth] = useState('Tutti');
  const [filterYear, setFilterYear] = useState('Tutti');
  const [pickerConfig, setPickerConfig] = useState<{ visible: boolean; type: 'day' | 'month' | 'year'; options: string[] } | null>(null);

  const [commCourse, setCommCourse] = useState('');
  const [commStudents, setCommStudents] = useState<string[]>([]);

  const studentTeachings = useMemo(() => {
    return getTeachingsForDegrees([user.degreeCourse || '']);
  }, [user.degreeCourse]);

  const [studyPlanModalVisible, setStudyPlanModalVisible] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [confirmMatricola, setConfirmMatricola] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const teachingsWithStatus = useMemo(() => {
    return studentTeachings.map((teaching) => {
      const matchingExams = (exams || []).filter(
        (e) => e.course.trim().toLowerCase() === teaching.trim().toLowerCase()
      );
      
      const acceptedExam = matchingExams.find((e) => e.status === 'Accettato');
      const pendingExam = matchingExams.find((e) => e.status === 'Da valutare');
      
      let status: 'completed' | 'pending' | 'missing' = 'missing';
      let grade: string | null = null;
      let examId: string | null = null;
      let cfu = getTeachingCfu(teaching, user.degreeCourse);
      
      if (acceptedExam) {
        status = 'completed';
        grade = acceptedExam.grade === 30 && acceptedExam.lode
          ? '30L'
          : `${acceptedExam.grade}`;
        examId = acceptedExam.id;
        cfu = acceptedExam.cfu;
      } else if (pendingExam) {
        status = 'pending';
        grade = pendingExam.grade === 30 && pendingExam.lode
          ? '30L'
          : `${pendingExam.grade}`;
        examId = pendingExam.id;
        cfu = pendingExam.cfu;
      }
      
      return {
        name: teaching,
        cfu,
        status,
        grade,
        examId
      };
    });
  }, [studentTeachings, exams, user.degreeCourse]);

  const teacherSlots = useMemo(() => {
    return receptionSlots.filter(s => s.teacherId === user.id);
  }, [receptionSlots, user.id]);

  const sortedTeacherSlots = useMemo(() => {
    return [...teacherSlots].sort((a, b) => {
      const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
      return days.indexOf(a.day) - days.indexOf(b.day) || a.time.localeCompare(b.time);
    });
  }, [teacherSlots]);

  return (
    <View>
      <View style={styles.cleanGreeting}>
        <Text style={styles.greetingKicker}>{t('welcomeBack')}</Text>
        <Text style={styles.greetingName}>{capitalizeWords(user.name)} {capitalizeWords(user.surname)}</Text>
      </View>

      {user.role === 'Studente' ? (
        (() => {
          const targetCfu = getDegreeCfu(user.degreeCourse);
          return (
            <>
              <View style={[styles.quickGrid, isWide && styles.quickGridWide]}>
                <StatCard 
                  label={t('passedExams')} 
                  value={`${careerStats.completed}`} 
                  icon={CheckCircle2} 
                  tone="green" 
                />
                <StatCard label={t('weightedAvg')} value={formatAverage(careerStats.weighted)} icon={GraduationCap} tone="blue" />
                <StatCard label={t('arithmeticAvg')} value={formatAverage(careerStats.arithmetic)} icon={Calculator} tone="purple" />
                <StatCard label={t('acquiredCfu')} value={`${careerStats.cfu}/${targetCfu}`} icon={BookOpen} tone="amber" />
              </View>

              {/* Full-width premium career progress card */}
              <Pressable
                onPress={() => setStudyPlanModalVisible(true)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    marginTop: 12,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1.5,
                    opacity: pressed ? 0.9 : 1
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ backgroundColor: colors.coralSoft, padding: 8, borderRadius: radii.md }}>
                      <Trophy color={colors.coral} size={22} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink }}>
                        {appLang === 'IT' ? 'Avanzamento Carriera' : 'Career Progress'}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>
                        {appLang === 'IT' ? 'Percentuale esami superati' : 'Percentage of completed exams'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: colors.coral }}>
                      {careerStats.progress}%
                    </Text>
                  </View>
                </View>

                {/* Visual Progress Bar */}
                <View style={{ height: 12, backgroundColor: colors.coralSoft, borderRadius: 6, overflow: 'hidden', marginVertical: 4 }}>
                  <View style={{ width: `${careerStats.progress}%`, height: '100%', backgroundColor: colors.coral, borderRadius: 6 }} />
                </View>

                <Text style={{ fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 18 }}>
                  {appLang === 'IT'
                    ? `Hai completato ${careerStats.cfu} CFU su ${targetCfu} previsti. Ti mancano ancora ${Math.max(0, targetCfu - careerStats.cfu)} CFU al traguardo.`
                    : `You completed ${careerStats.cfu} CFU out of ${targetCfu}. You need ${Math.max(0, targetCfu - careerStats.cfu)} more CFU to graduate.`}
                </Text>
              </Pressable>
            </>
          );
        })()
      ) : (
        <View style={[styles.quickGrid, isWide && styles.quickGridWide]}>
          {user.role === 'Docente' ? (
            <>
              <StatCard label={t('activeCourses')} value={`${(user.teachings || []).length}`} icon={BookOpen} tone="green" />
              <StatCard
                label={t('supervisedStudents')}
                value={(() => {
                  const teacherTeachingsList = user.teachings || [];
                  const degreesForTeacherTeachings = new Set<string>();
                  for (const tName of teacherTeachingsList) {
                    for (const courseObj of UNISA_COURSES) {
                      const teachings = getTeachingsForDegrees([courseObj.name]);
                      if (teachings.includes(tName)) {
                        degreesForTeacherTeachings.add(courseObj.name);
                      }
                    }
                  }
                  const supervised = users.filter(u => u.role === 'Studente' && u.degreeCourse && degreesForTeacherTeachings.has(u.degreeCourse));
                  return `${supervised.length}`;
                })()}
                icon={Users}
                tone="blue"
              />
              <StatCard
                label={t('announcementsSent')}
                value={`${customNotifications.filter(n => n.title === 'Comunicazione docente' || n.id.startsWith('notice')).length}`}
                icon={Megaphone}
                tone="amber"
              />
              <StatCard
                label={t('officeHours')}
                value={(() => {
                  const teacherSlots = receptionSlots.filter(s => s.teacherId === user.id);
                  return `${teacherSlots.length}h`;
                })()}
                icon={CalendarDays}
                tone="coral"
              />
            </>
          ) : null}
          {user.role === 'PTA' ? (
            <>
              <StatCard
                label={t('openTickets')}
                value={`${tickets.filter(t => t.status !== 'Chiuso').length}`}
                icon={Ticket}
                tone="coral"
              />
              <StatCard
                label={t('tasksToday')}
                value={`${tickets.filter(t => t.status === 'In carico').length}`}
                icon={ClipboardList}
                tone="blue"
              />
            </>
          ) : null}
        </View>
      )}

      {user.role === 'Studente' ? (
        <View style={{ marginTop: 10 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('insertExam')}</Text>
            <CustomPicker
              label={t('courseLabel')}
              value={newExam.course}
              options={studentTeachings}
              onSelect={(val) => {
                const autoCfu = getTeachingCfu(val, user.degreeCourse);
                setNewExam((draft) => ({ ...draft, course: val, cfu: autoCfu.toString() }));
              }}
              lang={appLang}
              placeholder={appLang === 'IT' ? 'Scegli un insegnamento...' : 'Choose a teaching...'}
            />
            <View style={styles.formGrid}>
              <Field
                label={t('cfuLabel')}
                keyboardType="number-pad"
                value={newExam.cfu}
                onChangeText={(value) => setNewExam((draft) => ({ ...draft, cfu: value }))}
                editable={false}
              />
              <View style={{ flex: 1 }}>
                <Field
                  label={t('gradeLabel')}
                  keyboardType="number-pad"
                  value={newExam.grade}
                  onChangeText={(value) => setNewExam((draft) => ({ ...draft, grade: value, lode: value === '30' ? draft.lode : false }))}
                />
                {newExam.grade === '30' ? (
                  <Pressable
                    onPress={() => setNewExam((draft) => ({ ...draft, lode: !draft.lode }))}
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}
                  >
                    {newExam.lode ? <CheckSquare size={16} color={colors.forest} /> : <Square size={16} color={colors.muted} />}
                    <Text style={{ fontSize: 13, color: colors.ink }}>Lode</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <ActionButton label={t('saveCareerData')} icon={Plus} onPress={onAddExam} />
          </View>



          <View style={styles.card} onLayout={(e) => onSectionLayout?.('esiti', e.nativeEvent.layout.y)}>
            <Text style={styles.cardTitle}>{t('publishedResults')}</Text>
            {exams.map((exam) => (
              <View key={exam.id} style={styles.examRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.rowTitle}>{exam.course}</Text>
                  <Text style={styles.rowSubtitle}>
                    {exam.grade === 30 && exam.lode ? (appLang === 'IT' ? '30 e Lode' : '30 with Honors') : `${exam.grade}/30`} · {exam.cfu} CFU · {exam.status === 'Da valutare' ? t('accept') + '/' + t('reject') : exam.status}
                  </Text>
                </View>
                {exam.status === 'Da valutare' ? (
                  <View style={styles.rowActions}>
                    <IconButton label={t('accept')} icon={CheckCircle2} onPress={() => onExamStatus(exam.id, 'Accettato')} />
                    <IconButton label={t('reject')} icon={XCircle} onPress={() => onExamStatus(exam.id, 'Rifiutato')} tone="danger" />
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          <View onLayout={(e) => onSectionLayout?.('ricevimenti', e.nativeEvent.layout.y)} style={styles.card}>
            <Text style={styles.cardTitle}>
              {appLang === 'IT' ? '📅 Ricevimenti Docenti' : '📅 Professors\' Office Hours'}
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12, lineHeight: 18 }}>
              {appLang === 'IT'
                ? 'Seleziona un giorno per visualizzare i ricevimenti disponibili e prenota una sessione.'
                : 'Select a day to view available office hours and book a session.'}
            </Text>

            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {(['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'] as const).map((day) => {
                const isActive = studentDayTab === day;
                const daySlots = slots.filter((s) => s.day === day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => setStudentDayTab(day)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: radii.md,
                      backgroundColor: isActive ? colors.forest : colors.surface,
                      borderWidth: 1.5,
                      borderColor: isActive ? colors.forest : colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Text style={{ color: isActive ? colors.surface : colors.ink, fontWeight: '700', fontSize: 12 }}>
                      {day.substring(0, 3)}
                    </Text>
                    {daySlots.length > 0 ? (
                      <View style={{ backgroundColor: isActive ? colors.surface : colors.forest, borderRadius: 10, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                        <Text style={{ color: isActive ? colors.forest : colors.surface, fontSize: 9, fontWeight: '800' }}>
                          {daySlots.length}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={{ gap: 8 }}>
              {(() => {
                const daySlots = slots.filter((s) => s.day === studentDayTab);
                if (daySlots.length === 0) {
                  return (
                    <Text style={{ color: colors.muted, fontStyle: 'italic', paddingVertical: 8 }}>
                      {appLang === 'IT' ? 'Nessun ricevimento disponibile per questo giorno.' : 'No office hours available for this day.'}
                    </Text>
                  );
                }

                return daySlots.map((slot) => {
                  const isBooked = slot.status === 'Prenotato';
                  const isBookedByMe = isBooked && slot.bookedByStudentId === user.id;
                  
                  return (
                    <Pressable
                      key={slot.id}
                      disabled={isBooked && !isBookedByMe}
                      onPress={() => {
                        if (isBookedByMe) {
                          Alert.alert(
                            appLang === 'IT' ? 'Annulla Prenotazione' : 'Cancel Booking',
                            appLang === 'IT'
                              ? `Vuoi annullare la tua prenotazione per il ricevimento di ${slot.day} alle ${slot.time}?`
                              : `Do you want to cancel your booking for the office hours on ${slot.day} at ${slot.time}?`,
                            [
                              { text: appLang === 'IT' ? 'No' : 'No', style: 'cancel' },
                              {
                                text: appLang === 'IT' ? 'Sì, annulla' : 'Yes, cancel',
                                style: 'destructive',
                                onPress: () => {
                                  const updatedSlots = slots.map(s => s.id === slot.id ? { ...s, status: 'Libero' as const, bookedBy: undefined, bookedByStudentId: undefined } : s);
                                  syncSlotsToParent(updatedSlots);
                                  onAddNotification({
                                    id: makeId('notif'),
                                    title: 'Ricevimento disdetto',
                                    body: `Lo studente ${user.name} ${user.surname} ha annullato la prenotazione per ${slot.day} alle ${slot.time}.`,
                                    target: 'Docente',
                                    date: 'Oggi',
                                  });
                                  Alert.alert(
                                    appLang === 'IT' ? 'Prenotazione Annullata' : 'Booking Cancelled',
                                    appLang === 'IT' ? 'La tua prenotazione è stata annullata con successo.' : 'Your booking has been successfully cancelled.'
                                  );
                                }
                              }
                            ]
                          );
                        } else {
                          Alert.alert(
                            appLang === 'IT' ? 'Prenota Ricevimento' : 'Book Office Hours',
                            appLang === 'IT'
                              ? `Vuoi prenotare il ricevimento di ${slot.day} alle ${slot.time}?`
                              : `Do you want to book the office hours on ${slot.day} at ${slot.time}?`,
                            [
                              { text: appLang === 'IT' ? 'Annulla' : 'Cancel', style: 'cancel' },
                              {
                                text: appLang === 'IT' ? 'Prenota' : 'Book',
                                onPress: () => {
                                  const updatedSlots = slots.map(s => s.id === slot.id ? { ...s, status: 'Prenotato' as const, bookedBy: `${user.name} ${user.surname} (${user.degreeCourse || 'Studente'})`, bookedByStudentId: user.id } : s);
                                  syncSlotsToParent(updatedSlots);
                                  onAddNotification({
                                    id: makeId('notif'),
                                    title: 'Nuova prenotazione ricevimento',
                                    body: `Lo studente ${user.name} ${user.surname} ha prenotato il ricevimento di ${slot.day} alle ${slot.time}.`,
                                    target: 'Docente',
                                    date: 'Oggi',
                                  });
                                  Alert.alert(
                                    appLang === 'IT' ? 'Prenotato!' : 'Booked!',
                                    appLang === 'IT'
                                      ? 'Il ricevimento è stato prenotato correttamente.'
                                      : 'The office hours have been successfully booked.'
                                  );
                                }
                              }
                            ]
                          );
                        }
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 14,
                        borderRadius: radii.md,
                        backgroundColor: isBookedByMe ? colors.mint : isBooked ? '#F3F4F6' : colors.surface,
                        borderWidth: 1.5,
                        borderColor: isBookedByMe ? colors.forest : isBooked ? colors.border : colors.border,
                        opacity: isBooked && !isBookedByMe ? 0.6 : 1,
                        marginBottom: 4,
                      }}
                    >
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                          {slot.time}
                        </Text>
                        <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                          {slot.desc}
                        </Text>
                      </View>

                      {isBookedByMe ? (
                        <View style={{ backgroundColor: colors.forest, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                          <Text style={{ color: colors.surface, fontSize: 11, fontWeight: '800' }}>
                            {appLang === 'IT' ? 'Prenotato da te' : 'Booked by you'}
                          </Text>
                        </View>
                      ) : isBooked ? (
                        <View style={{ backgroundColor: colors.danger, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                          <Text style={{ color: colors.surface, fontSize: 11, fontWeight: '800' }}>
                            {appLang === 'IT' ? 'Non disponibile' : 'Not available'}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                          <Text style={{ color: colors.forest, fontSize: 11, fontWeight: '800' }}>
                            {appLang === 'IT' ? 'Disponibile' : 'Available'}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                });
              })()}
            </View>
          </View>
        </View>
      ) : null}

      {user.role === 'Docente' ? (
        <View style={{ marginTop: 10 }}>
          <SectionTitle title={t('teacherArea')} subtitle={t('teacherAreaSubtitle')} />
          {(user.teachings || []).map((courseName, index) => (
            <ListRow
              key={index}
              icon={BookOpen}
              title={courseName}
              subtitle={appLang === 'IT' ? 'Insegnamento attivo' : 'Active teaching'}
              hideChevron={true}
            />
          ))}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('publishExamResult')}</Text>
            
            {(() => {
              const courses = user.teachings || [];
              if (courses.length === 0) {
                return (
                  <Text style={{ fontSize: 13, color: colors.muted, fontStyle: 'italic', marginVertical: 12 }}>
                    {appLang === 'IT'
                      ? 'Nessun insegnamento associato al tuo profilo. Aggiungi i tuoi insegnamenti nella sezione Profilo.'
                      : 'No teachings associated with your profile. Add your teachings in the Profile section.'}
                  </Text>
                );
              }
              
              const currentCourseName = courses.includes(teacherResult.course)
                ? teacherResult.course
                : courses[0];
                
              // Find degree courses containing this teaching dynamically
              const degreesForSelectedTeaching = UNISA_COURSES.map(c => c.name).filter(deg => 
                getTeachingsForDegrees([deg]).includes(currentCourseName)
              );

              // Find students enrolled in this degree course
              const enrolledStudents = users.filter(u => 
                u.role === 'Studente' && 
                u.degreeCourse && 
                degreesForSelectedTeaching.includes(u.degreeCourse)
              );

              return (
                <>
                  <Text style={styles.inputLabel}>{t('courseLabel')}</Text>
                  <SegmentedControl
                    options={courses.map((c) => ({ value: c, label: c }))}
                    value={currentCourseName}
                    onChange={(value) => {
                      setTeacherResult((prev) => ({ ...prev, course: value, students: [] }));
                    }}
                  />
                  
                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                    {appLang === 'IT' ? 'Seleziona Studenti (Matricola) *' : 'Select Students (Matricola) *'}
                  </Text>
                  <View style={{ maxHeight: 150, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.background, padding: 8, marginVertical: 8 }}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 130 }}>
                      {enrolledStudents.length === 0 ? (
                        <Text style={{ color: colors.muted, fontStyle: 'italic', padding: 8, fontSize: 13 }}>
                          {appLang === 'IT' ? 'Nessuno studente iscritto a questo corso.' : 'No students enrolled in this course.'}
                        </Text>
                      ) : (
                        enrolledStudents.map((st) => {
                          const studentFullName = `${st.name} ${st.surname}`;
                          const displayName = `${studentFullName} (${st.matricola})`;
                          const isSelected = teacherResult.students.includes(displayName);
                          return (
                            <Pressable
                              key={st.matricola}
                              onPress={() => {
                                setTeacherResult((prev) => {
                                  const exists = prev.students.includes(displayName);
                                  const nextStudents = exists
                                    ? prev.students.filter((s) => s !== displayName)
                                    : [...prev.students, displayName];
                                  return { ...prev, course: currentCourseName, students: nextStudents };
                                });
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
                        })
                      )}
                    </ScrollView>
                  </View>
                </>
              );
            })()}

            <View style={{ marginBottom: 12 }}>
              <Field
                label={t('gradeLabel')}
                keyboardType="number-pad"
                value={teacherResult.grade}
                onChangeText={(value) => setTeacherResult((draft) => ({ ...draft, grade: value, lode: value === '30' ? draft.lode : false }))}
              />
              {teacherResult.grade === '30' ? (
                <Pressable
                  onPress={() => setTeacherResult((draft) => ({ ...draft, lode: !draft.lode }))}
                  style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}
                >
                  {teacherResult.lode ? <CheckSquare size={16} color={colors.forest} /> : <Square size={16} color={colors.muted} />}
                  <Text style={{ fontSize: 13, color: colors.ink }}>Lode</Text>
                </Pressable>
              ) : null}
            </View>
            <ActionButton label={t('publishResultBtn')} icon={Send} onPress={onPublishResult} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('announcementsToStudents')}</Text>
            
            {(() => {
              const courses = user.teachings || [];
              if (courses.length === 0) {
                return (
                  <Text style={{ fontSize: 13, color: colors.muted, fontStyle: 'italic', marginVertical: 12 }}>
                    {appLang === 'IT'
                      ? 'Nessun insegnamento associato al tuo profilo. Aggiungi i tuoi insegnamenti nella sezione Profilo.'
                      : 'No teachings associated with your profile. Add your teachings in the Profile section.'}
                  </Text>
                );
              }
              
              const currentCourseName = courses.includes(commCourse)
                ? commCourse
                : courses[0];
                
              if (commCourse !== currentCourseName) {
                setCommCourse(currentCourseName);
              }
                
              const degreesForSelectedTeaching = UNISA_COURSES.map(c => c.name).filter(deg => 
                getTeachingsForDegrees([deg]).includes(currentCourseName)
              );

              const enrolledStudents = users.filter(u => 
                u.role === 'Studente' && 
                u.degreeCourse && 
                degreesForSelectedTeaching.includes(u.degreeCourse)
              );

              return (
                <>
                  <Text style={styles.inputLabel}>{t('courseLabel')}</Text>
                  <SegmentedControl
                    options={courses.map((c) => ({ value: c, label: c }))}
                    value={currentCourseName}
                    onChange={(value) => {
                      setCommCourse(value);
                      setCommStudents([]);
                    }}
                  />
                  
                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                    {appLang === 'IT' ? 'Seleziona Destinatari *' : 'Select Recipients *'}
                  </Text>
                  <View style={{ maxHeight: 150, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.background, padding: 8, marginVertical: 8 }}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 130 }}>
                      {enrolledStudents.length === 0 ? (
                        <Text style={{ color: colors.muted, fontStyle: 'italic', padding: 8, fontSize: 13 }}>
                          {appLang === 'IT' ? 'Nessuno studente iscritto a questo corso.' : 'No students enrolled in this course.'}
                        </Text>
                      ) : (
                        enrolledStudents.map((st) => {
                          const studentFullName = `${st.name} ${st.surname}`;
                          const displayName = `${studentFullName} (${st.matricola})`;
                          const isSelected = commStudents.includes(displayName);
                          return (
                            <Pressable
                              key={st.matricola}
                              onPress={() => {
                                setCommStudents((prev) => {
                                  const exists = prev.includes(displayName);
                                  return exists
                                    ? prev.filter((s) => s !== displayName)
                                    : [...prev, displayName];
                                });
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                                backgroundColor: isSelected ? colors.blueSoft : 'transparent',
                                borderRadius: radii.sm,
                                marginBottom: 4
                              }}
                            >
                              <Text style={{ fontSize: 13, color: colors.ink, fontWeight: isSelected ? '600' : 'normal' }}>
                                {displayName}
                              </Text>
                              {isSelected ? (
                                <CheckCircle2 size={16} color={colors.blue} />
                              ) : (
                                <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: colors.muted }} />
                              )}
                            </Pressable>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>

                  <Field
                    label={t('messageLabel')}
                    multiline
                    value={teacherMessage}
                    onChangeText={setTeacherMessage}
                  />

                  <ActionButton
                    label={t('sendAnnouncementBtn')}
                    icon={Megaphone}
                    onPress={() => {
                      onSendTeacherMessage(currentCourseName, commStudents);
                      setCommStudents([]);
                    }}
                  />
                </>
              );
            })()}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('officeHoursSetup')}</Text>
            {sortedTeacherSlots.length === 0 ? (
              <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 12, fontStyle: 'italic' }}>
                {appLang === 'IT' ? 'Nessun ricevimento programmato' : 'No office hours scheduled'}
              </Text>
            ) : (
              <View style={{ marginBottom: 12, gap: 10 }}>
                {sortedTeacherSlots.map((slot) => {
                  const isBooked = slot.status === 'Prenotato';
                  return (
                    <View
                      key={slot.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: isBooked ? colors.amberSoft : colors.blueSoft,
                        borderLeftWidth: 4,
                        borderLeftColor: isBooked ? colors.amber : colors.blue,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', color: colors.ink, fontSize: 14 }}>
                          {slot.day} · {slot.time}
                        </Text>
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                            backgroundColor: isBooked ? colors.amber : colors.blue,
                          }}
                        >
                          <Text style={{ color: colors.surface, fontSize: 11, fontWeight: 'bold' }}>
                            {slot.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 13, color: colors.muted }}>
                        {slot.desc || (appLang === 'IT' ? 'Nessuna descrizione' : 'No description')}
                      </Text>
                      {slot.bookedBy ? (
                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: 4 }}>
                          {appLang === 'IT' ? 'Prenotato da' : 'Booked by'}: {slot.bookedBy}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
            <ActionButton
              label={appLang === 'IT' ? 'Gestisci Ricevimenti (Calendario)' : 'Manage Office Hours (Calendar)'}
              icon={CalendarDays}
              onPress={() => setCalendarVisible(true)}
            />
          </View>

          {/* Office Hours Calendar Modal */}
          <Modal visible={calendarVisible} animationType="slide" transparent={false} onRequestClose={() => setCalendarVisible(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
              <View style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>
                  {appLang === 'IT' ? 'Calendario Ricevimenti' : 'Office Hours Calendar'}
                </Text>
                <Pressable onPress={() => setCalendarVisible(false)} style={{ padding: 6 }}>
                  <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 15 }}>
                    {appLang === 'IT' ? 'Chiudi' : 'Close'}
                  </Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={{ padding: 18 }}>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
                  {appLang === 'IT' 
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
                  {['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'].map((hour) => {
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
                              {appLang === 'IT' ? 'Libero (Clicca per aggiungere)' : 'Free (Click to add)'}
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
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 18 }}
                >
                  <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: 20, borderWidth: 1.5, borderColor: colors.border, marginVertical: 30 }}>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 4 }}>
                        {appLang === 'IT' ? 'Configura Ricevimento' : 'Configure Office Hours'}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
                        {editingSlot.day} - {editingSlot.time}
                      </Text>

                      <Field
                        label={appLang === 'IT' ? 'Breve descrizione' : 'Short description'}
                        placeholder="e.g. Studio F3, Blocco F o Online"
                        value={editDesc}
                        onChangeText={setEditDesc}
                      />

                      <View style={{ gap: 10, marginTop: 18 }}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <Pressable
                            onPress={() => {
                              setEditingSlot(null);
                            }}
                            style={{ flex: 1, padding: 12, borderRadius: radii.md, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                          >
<Text style={{ color: colors.ink, fontWeight: '700' }}>
                              {appLang === 'IT' ? 'Annulla' : 'Cancel'}
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (!editDesc.trim()) {
                                  Alert.alert(
                                    appLang === 'IT' ? 'Descrizione vuota' : 'Empty description',
                                    appLang === 'IT' ? 'Inserisci una breve nota per gli studenti.' : 'Please enter a short note for the students.'
                                  );
                                  return;
                              }
                              if (editDesc.includes('-') || editDesc.includes('\'') || editDesc.includes('’')) {
                                   const invalidRegex = /(^[-'’])|([-'’]$)|([^A-Za-z0-9À-ÖØ-öø-ÿ][-'’])|([-'’][^A-Za-z0-9À-ÖØ-öø-ÿ])/;
                                   if (invalidRegex.test(editDesc)) {
                                       Alert.alert(
                                         appLang === 'IT' ? 'Formato non valido' : 'Invalid format',
                                         appLang === 'IT'
                                           ? "I caratteri '-' e gli apostrofi devono essere preceduti e seguiti da una lettera o cifra."
                                           : "Hyphens '-' and apostrophes must be preceded and followed by a letter or digit."
                                       );
                                       return;
                                   }
                               }
                              const existing = slots.find(s => s.day === editingSlot.day && s.time === editingSlot.time);
                              const filtered = slots.filter(s => !(s.day === editingSlot.day && s.time === editingSlot.time));
                              const newSlots = [...filtered, {
                                id: existing?.id || makeId('slot'),
                                teacherId: user.id,
                                day: editingSlot.day,
                                time: editingSlot.time,
                                desc: editDesc.trim(),
                                status: existing?.status || 'Libero',
                                bookedBy: existing?.bookedBy,
                                bookedByStudentId: existing?.bookedByStudentId,
                                teaching: existing?.teaching || (user.teachings && user.teachings[0]) || 'Programmazione ad Oggetti'
                              }];
                              syncSlotsToParent(newSlots);
                              setEditingSlot(null);
                            }}
                            style={{ flex: 1, padding: 12, borderRadius: radii.md, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text style={{ color: colors.surface, fontWeight: '700' }}>
                              {appLang === 'IT' ? 'Salva' : 'Save'}
                            </Text>
                          </Pressable>
                        </View>
                        
                        <Pressable
                          onPress={() => {
                            const filtered = slots.filter(s => !(s.day === editingSlot.day && s.time === editingSlot.time));
                            syncSlotsToParent(filtered);
                            setEditingSlot(null);
                          }}
                          style={{ padding: 12, borderRadius: radii.md, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Text style={{ color: colors.danger, fontWeight: '700' }}>
                            {appLang === 'IT' ? 'Rimuovi Ricevimento' : 'Remove Office Hours'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </ScrollView>
                </KeyboardAvoidingView>
              </Modal>
            ) : null}
          </Modal>
        </View>
      ) : null}

      {user.role === 'PTA' ? (
        <View style={{ marginTop: 10 }}>
          <SectionTitle title={t('ptaArea')} subtitle={t('ptaAreaSubtitle')} />

          <View onLayout={(e) => onSectionLayout?.('tickets', e.nativeEvent.layout.y)}>
            <SectionTitle title={t('pendingRequests')} subtitle={t('pendingRequestsSubtitle')} />
            
            <SegmentedControl
              options={[
                { value: 'active', label: appLang === 'IT' ? 'Attive' : 'Active' },
                { value: 'archived', label: appLang === 'IT' ? 'Archivio' : 'Archive' },
              ]}
              value={activePtaTicketTab}
              onChange={(val) => setActivePtaTicketTab(val as 'active' | 'archived')}
            />

            <View style={{ marginTop: 8 }}>
              {(() => {
                const filtered = activePtaTicketTab === 'active'
                  ? tickets.filter((t) => t.status !== 'Chiuso' && t.domain === user.ptaDomain && (t.status === 'Aperto' || t.assignedTo === user.id || !t.assignedTo) && !archivedTicketIds.includes(t.id) && !deletedTicketIds.includes(t.id))
                  : tickets.filter((t) => t.domain === user.ptaDomain && (t.assignedTo === user.id || !t.assignedTo) && (archivedTicketIds.includes(t.id) || t.status === 'Chiuso') && !deletedTicketIds.includes(t.id));

                if (filtered.length === 0) {
                  return (
                    <Text style={{ color: colors.muted, fontStyle: 'italic', paddingVertical: 12, textAlign: 'center', fontSize: 13 }}>
                      {activePtaTicketTab === 'active'
                        ? (appLang === 'IT' ? 'Nessuna richiesta attiva per il tuo ambito.' : 'No active requests for your scope.')
                        : (appLang === 'IT' ? 'Nessuna richiesta archiviata.' : 'No archived requests.')}
                    </Text>
                  );
                }
                return filtered.map((ticketItem) => (
                  <SwipeableRow
                    key={ticketItem.id}
                    onSwipeRight={ticketItem.status === 'Chiuso' ? undefined : () => onArchiveTicket(ticketItem.id)}
                    onSwipeLeft={() => onDeleteTicket(ticketItem.id)}
                    leftLabel={activePtaTicketTab === 'active' ? (appLang === 'IT' ? 'Archivia' : 'Archive') : (appLang === 'IT' ? 'Ripristina' : 'Restore')}
                    leftIcon={activePtaTicketTab === 'active' ? Archive : RotateCcw}
                    rightLabel={appLang === 'IT' ? 'Elimina' : 'Delete'}
                    rightIcon={Trash2}
                  >
                    <View style={[styles.card, { marginBottom: 0 }]}>
                      <View style={styles.ticketHeader}>
                        <View style={styles.flexOne}>
                          <Text style={styles.cardTitle}>{ticketItem.title}</Text>
                          <Text style={styles.rowSubtitle}>
                            {ticketItem.location} · {t('ticketPriorityLabel')} {ticketItem.priority} · {appLang === 'IT' ? 'Richiedente' : 'Requester'}: {ticketItem.requester}
                          </Text>
                        </View>
                        <StatusBadge value={ticketItem.status} />
                      </View>
                      <Text style={styles.bodyText}>{ticketItem.body}</Text>
                      <View style={styles.rowActions}>
                        <IconButton label={t('takeTicket')} icon={CheckCircle2} onPress={() => onTicketStatus(ticketItem.id, 'In carico')} />
                        <IconButton label={appLang === 'IT' ? 'Sospendi' : 'Suspend'} icon={Clock} onPress={() => onTicketStatus(ticketItem.id, 'In sospeso')} />
                        <IconButton label={t('closeTicket')} icon={ShieldCheck} onPress={() => onTicketStatus(ticketItem.id, 'Chiuso')} />
                      </View>
                    </View>
                  </SwipeableRow>
                ));
              })()}
            </View>
          </View>

          {/* Ticket Archive Section */}
          <View style={{ marginTop: 16 }}>
            <Pressable
              style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, marginVertical: 0 }]}
              onPress={() => setArchiveExpanded(!archiveExpanded)}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                {appLang === 'IT' ? '📁 Archivio Storico Richieste' : '📁 Request History Archive'}
              </Text>
              {archiveExpanded ? <ChevronDown color={colors.forest} size={20} /> : <ChevronRight color={colors.forest} size={20} />}
            </Pressable>

            {archiveExpanded ? (
              <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: 12, marginTop: 4, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 8 }}>
                  {appLang === 'IT' ? 'FILTRA PER DATA:' : 'FILTER BY DATE:'}
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
                      {appLang === 'IT' ? `GG: ${filterDay}` : `Day: ${filterDay}`}
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
                      {appLang === 'IT' ? `MM: ${filterMonth}` : `Month: ${filterMonth}`}
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
                      {appLang === 'IT' ? `AA: ${filterYear}` : `Year: ${filterYear}`}
                    </Text>
                  </Pressable>
                </View>

                {/* Filtered Tickets List */}
                <View style={{ gap: 8 }}>
                  {(() => {
                    const filtered = tickets.filter((ticket) => {
                      if (ticket.domain !== user.ptaDomain) return false;
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
                          {appLang === 'IT' ? 'Nessun ticket corrispondente ai filtri.' : 'No tickets matching filters.'}
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
                {pickerConfig.type === 'day' ? (appLang === 'IT' ? 'Filtra per Giorno' : 'Filter by Day') :
                 pickerConfig.type === 'month' ? (appLang === 'IT' ? 'Filtra per Mese' : 'Filter by Month') :
                 (appLang === 'IT' ? 'Filtra per Anno' : 'Filter by Year')}
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

      {/* Modal per Visualizzazione Esami Superati */}
      <Modal
        visible={passedExamsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPassedExamsModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>
              {appLang === 'IT' ? 'Esami Superati' : 'Passed Exams'}
            </Text>
            <Pressable onPress={() => setPassedExamsModalVisible(false)} style={{ padding: 6 }}>
              <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 15 }}>
                {appLang === 'IT' ? 'Chiudi' : 'Close'}
              </Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 18 }}>
            {(() => {
              const acceptedExams = (exams || []).filter(e => e.status === 'Accettato');
              if (acceptedExams.length === 0) {
                return (
                  <Text style={{ color: colors.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 30 }}>
                    {appLang === 'IT' ? 'Nessun esame superato registrato.' : 'No passed exams recorded.'}
                  </Text>
                );
              }
              return acceptedExams.map((exam) => (
                <View
                  key={exam.id}
                  style={{
                    padding: 16,
                    backgroundColor: colors.surface,
                    borderRadius: radii.md,
                    borderWidth: 1.5,
                    borderColor: colors.border,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink }}>
                    {exam.course}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 14, color: colors.muted }}>
                      {appLang === 'IT' ? 'Voto' : 'Grade'}:{' '}
                      <Text style={{ fontWeight: '700', color: colors.forest }}>
                        {exam.grade === 30 && exam.lode
                          ? (appLang === 'IT' ? '30 e Lode' : '30 with Honors')
                          : `${exam.grade}/30`}
                      </Text>
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.muted }}>
                      CFU: <Text style={{ fontWeight: '700', color: colors.ink }}>{exam.cfu}</Text>
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>
                    {appLang === 'IT' ? 'Data conseguimento' : 'Date achieved'}: {exam.date || 'Non specificata'}
                  </Text>
                </View>
              ));
            })()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Piano di Studi */}
      <Modal
        visible={studyPlanModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setStudyPlanModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.ink }}>
                {appLang === 'IT' ? 'Piano di Studi' : 'Study Plan'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }} numberOfLines={1}>
                {user.degreeCourse}
              </Text>
            </View>
            <Pressable onPress={() => setStudyPlanModalVisible(false)} style={{ padding: 6 }}>
              <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 15 }}>
                {appLang === 'IT' ? 'Chiudi' : 'Close'}
              </Text>
            </Pressable>
          </View>

          {/* Legenda */}
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.ink }}>
                {appLang === 'IT' ? 'Superato' : 'Passed'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.amber }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.ink }}>
                {appLang === 'IT' ? 'In Bacheca' : 'To Evaluate'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.ink }}>
                {appLang === 'IT' ? 'Da Sostenere' : 'To Take'}
              </Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 18 }}>
            {teachingsWithStatus.length === 0 ? (
              <Text style={{ color: colors.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 30 }}>
                {appLang === 'IT' ? 'Nessun insegnamento trovato.' : 'No teachings found.'}
              </Text>
            ) : (
              teachingsWithStatus.map((item) => {
                const isCompleted = item.status === 'completed';
                const isPending = item.status === 'pending';
                const isMissing = item.status === 'missing';

                let cardBg = colors.surface;
                let cardBorder = colors.border;
                let leftAccent = colors.border;

                if (isCompleted) {
                  cardBg = '#E8F5E9'; // soft green
                  cardBorder = '#C8E6C9';
                  leftAccent = colors.forest;
                } else if (isPending) {
                  cardBg = colors.amberSoft;
                  cardBorder = '#FFE0B2';
                  leftAccent = colors.amber;
                } else if (isMissing) {
                  cardBg = '#FFEBEE'; // soft red
                  cardBorder = '#FFCDD2';
                  leftAccent = colors.danger;
                }

                return (
                  <View
                    key={item.name}
                    style={{
                      padding: 14,
                      backgroundColor: cardBg,
                      borderRadius: radii.md,
                      borderWidth: 1.5,
                      borderColor: cardBorder,
                      borderLeftWidth: 6,
                      borderLeftColor: leftAccent,
                      marginBottom: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 200 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                        {item.cfu} CFU
                      </Text>
                    </View>

                    {isCompleted && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ backgroundColor: colors.forest, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                          <Text style={{ color: colors.surface, fontSize: 12, fontWeight: '800' }}>
                            {item.grade}
                          </Text>
                        </View>
                        <CheckCircle2 color={colors.forest} size={20} />
                        <Pressable
                          onPress={() => {
                            if (item.examId) {
                              setExamToDelete(item.examId);
                              setConfirmMatricola('');
                              setConfirmPassword('');
                              setDeleteConfirmVisible(true);
                            }
                          }}
                          style={{
                            padding: 6,
                            backgroundColor: '#FFEBEE',
                            borderRadius: radii.sm,
                            borderWidth: 1,
                            borderColor: '#FFCDD2'
                          }}
                        >
                          <Trash2 color={colors.danger} size={16} />
                        </Pressable>
                      </View>
                    )}

                    {isPending && (
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.amber }}>
                          {appLang === 'IT' ? `Voto proposto: ${item.grade}` : `Proposed grade: ${item.grade}`}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <Pressable
                            onPress={() => {
                              if (item.examId) {
                                onExamStatus(item.examId, 'Accettato');
                              }
                            }}
                            style={{
                              backgroundColor: colors.forest,
                              paddingVertical: 5,
                              paddingHorizontal: 10,
                              borderRadius: radii.sm,
                            }}
                          >
                            <Text style={{ color: colors.surface, fontSize: 11, fontWeight: '800' }}>
                              {t('accept')}
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (item.examId) {
                                onExamStatus(item.examId, 'Rifiutato');
                              }
                            }}
                            style={{
                              backgroundColor: colors.danger,
                              paddingVertical: 5,
                              paddingHorizontal: 10,
                              borderRadius: radii.sm,
                            }}
                          >
                            <Text style={{ color: colors.surface, fontSize: 11, fontWeight: '800' }}>
                              {t('reject')}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}

                    {isMissing && (
                      <View style={{ backgroundColor: colors.danger, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                        <Text style={{ color: colors.surface, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>
                          {appLang === 'IT' ? 'Da sostenere' : 'To Take'}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal di Conferma Eliminazione Esame */}
      <Modal
        visible={deleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.ink, marginBottom: 6 }}>
              {appLang === 'IT' ? 'Conferma Eliminazione Esame' : 'Confirm Exam Deletion'}
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>
              {appLang === 'IT' 
                ? 'Per motivi di sicurezza, inserisci la tua matricola e la password per rimuovere questo voto dal libretto.' 
                : 'For security reasons, enter your student ID (matricola) and password to remove this grade.'}
            </Text>

            <Field
              label={appLang === 'IT' ? 'Matricola *' : 'Student ID (Matricola) *'}
              value={confirmMatricola}
              onChangeText={setConfirmMatricola}
              placeholder={appLang === 'IT' ? 'La tua matricola...' : 'Your student ID...'}
              containerStyle={{ flex: 0, width: '100%' }}
            />

            <Field
              label={appLang === 'IT' ? 'Password dell\'Account *' : 'Account Password *'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              placeholder={appLang === 'IT' ? 'La tua password...' : 'Your password...'}
              containerStyle={{ flex: 0, width: '100%' }}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Pressable
                onPress={() => setDeleteConfirmVisible(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: colors.ink, fontWeight: '700' }}>
                  {appLang === 'IT' ? 'Annulla' : 'Cancel'}
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  if (confirmMatricola.trim() !== user.matricola || confirmPassword !== user.password) {
                    Alert.alert(
                      appLang === 'IT' ? 'Credenziali non valide' : 'Invalid credentials',
                      appLang === 'IT' 
                        ? 'La matricola o la password inserita non corrisponde.' 
                        : 'The student ID or password entered is incorrect.'
                    );
                    return;
                  }
                  if (examToDelete) {
                    onDeleteExam(examToDelete);
                  }
                  setDeleteConfirmVisible(false);
                  setExamToDelete(null);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: colors.danger,
                  borderRadius: radii.md,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: colors.surface, fontWeight: '800' }}>
                  {appLang === 'IT' ? 'Rimuovi' : 'Remove'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
