import React, { useState, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Modal, SafeAreaView } from 'react-native';
import {
  CheckCircle2,
  Calculator,
  BookOpen,
  Trophy,
  Plus,
  XCircle,
  Square,
  CheckSquare,
  Trash2,
  GraduationCap,
} from 'lucide-react-native';

import { useTheme, radii } from '../theme';
import type { UserProfile, Exam, ExamStatus, ReceptionSlot, NotificationItem } from '../types';
import { translations } from '../constants';
import { capitalizeWords, formatAverage, getDegreeCfu, makeId, translateDay } from '../utils';
import { getTeachingsForDegrees, getTeachingCfu } from '../data';
import { StatCard } from './StatCard';
import { Field } from './Field';
import { ActionButton } from './ActionButton';
import { IconButton } from './IconButton';
import { CustomPicker } from './CustomPicker';

export function StudentHome({
  user,
  isWide,
  careerStats,
  exams,
  newExam,
  setNewExam,
  onAddExam,
  onExamStatus,
  onDeleteExam,
  t,
  receptionSlots,
  onSyncSlots,
  onAddNotification,
  onSectionLayout,
}: {
  user: UserProfile;
  isWide: boolean;
  careerStats: { completed: number; cfu: number; arithmetic: number; weighted: number; progress: number };
  exams: Exam[];
  newExam: { course: string; cfu: string; grade: string; lode: boolean };
  setNewExam: Dispatch<SetStateAction<{ course: string; cfu: string; grade: string; lode: boolean }>>;
  onAddExam: () => void;
  onExamStatus: (id: string, status: ExamStatus) => void;
  onDeleteExam: (id: string) => void;
  t: (key: keyof typeof translations.IT) => string;
  receptionSlots: ReceptionSlot[];
  onSyncSlots: (slots: ReceptionSlot[]) => void;
  onAddNotification: (notif: NotificationItem) => void;
  onSectionLayout?: (name: string, y: number) => void;
}) {
  const { colors, styles } = useTheme();
  const [passedExamsModalVisible, setPassedExamsModalVisible] = useState(false);
  const [studentDayTab, setStudentDayTab] = useState<'Lunedì' | 'Martedì' | 'Mercoledì' | 'Giovedì' | 'Venerdì'>('Lunedì');
  const [studyPlanModalVisible, setStudyPlanModalVisible] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [confirmMatricola, setConfirmMatricola] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const appLang = user?.language || 'IT';
  const targetCfu = getDegreeCfu(user.degreeCourse);

  const studentTeachings = useMemo(() => {
    return getTeachingsForDegrees([user.degreeCourse || '']);
  }, [user.degreeCourse]);

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

  const slots = receptionSlots.filter(s => s.teaching && studentTeachings.includes(s.teaching));

  return (
    <>
      <View style={[styles.quickGrid, isWide && styles.quickGridWide]}>
        <StatCard 
          label={t('passedExams')} 
          value={`${careerStats.completed}`} 
          icon={CheckCircle2} 
          tone="green" 
          onPress={() => setPassedExamsModalVisible(true)}
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
          {exams.filter(exam => exam.id.startsWith('published')).map((exam) => (
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
                    {translateDay(day, appLang).substring(0, 3)}
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
                            : `Do you want to cancel your booking for the office hours on ${translateDay(slot.day, appLang)} at ${slot.time}?`,
                          [
                            { text: appLang === 'IT' ? 'No' : 'No', style: 'cancel' },
                            {
                              text: appLang === 'IT' ? 'Sì, annulla' : 'Yes, cancel',
                              style: 'destructive',
                              onPress: () => {
                                const updatedSlots = receptionSlots.map(s => s.id === slot.id ? { ...s, status: 'Libero' as const, bookedBy: undefined, bookedByStudentId: undefined } : s);
                                onSyncSlots(updatedSlots);
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
                            : `Do you want to book the office hours on ${translateDay(slot.day, appLang)} at ${slot.time}?`,
                          [
                            { text: appLang === 'IT' ? 'Annulla' : 'Cancel', style: 'cancel' },
                            {
                              text: appLang === 'IT' ? 'Prenota' : 'Book',
                              onPress: () => {
                                const updatedSlots = receptionSlots.map(s => s.id === slot.id ? { ...s, status: 'Prenotato' as const, bookedBy: `${user.name} ${user.surname} (${user.degreeCourse || (appLang === 'IT' ? 'Studente' : 'Student')})`, bookedByStudentId: user.id } : s);
                                onSyncSlots(updatedSlots);
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
    </>
  );
}
