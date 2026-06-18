import React, { useState, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
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
  BookOpen,
  Users,
  Megaphone,
  CalendarDays,
  CheckCircle2,
  Send,
  Plus,
  CheckSquare,
  Square,
} from 'lucide-react-native';

import { useTheme, radii } from '../theme';
import type { UserProfile, ReceptionSlot, NotificationItem } from '../types';
import { translations } from '../constants';
import { capitalizeWords, makeId, translateDay } from '../utils';
import { UNISA_COURSES, getTeachingsForDegrees } from '../data';
import { StatCard } from './StatCard';
import { Field } from './Field';
import { ActionButton } from './ActionButton';
import { IconButton } from './IconButton';
import { SegmentedControl } from './SegmentedControl';
import { SectionTitle } from './SectionTitle';

export function TeacherHome({
  user,
  isWide,
  t,
  teacherMessage,
  setTeacherMessage,
  teacherResult,
  setTeacherResult,
  onPublishResult,
  onSendTeacherMessage,
  receptionSlots,
  onSyncSlots,
  onAddNotification,
  users,
  customNotifications,
}: {
  user: UserProfile;
  isWide: boolean;
  t: (key: keyof typeof translations.IT) => string;
  teacherMessage: string;
  setTeacherMessage: (value: string) => void;
  teacherResult: { students: string[]; course: string; grade: string; lode: boolean };
  setTeacherResult: Dispatch<SetStateAction<{ students: string[]; course: string; grade: string; lode: boolean }>>;
  onPublishResult: () => void;
  onSendTeacherMessage: (course: string, students: string[]) => void;
  receptionSlots: ReceptionSlot[];
  onSyncSlots: (slots: ReceptionSlot[]) => void;
  onAddNotification: (notif: NotificationItem) => void;
  users: UserProfile[];
  customNotifications: NotificationItem[];
}) {
  const { colors, styles } = useTheme();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<'Lunedì' | 'Martedì' | 'Mercoledì' | 'Giovedì' | 'Venerdì'>('Lunedì');
  const [editingSlot, setEditingSlot] = useState<{ day: 'Lunedì' | 'Martedì' | 'Mercoledì' | 'Giovedì' | 'Venerdì'; time: string; desc: string } | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [commCourse, setCommCourse] = useState('');
  const [commStudents, setCommStudents] = useState<string[]>([]);

  const appLang = user?.language || 'IT';
  const slots = receptionSlots;

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
    <View style={{ marginTop: 10 }}>
      <View style={[styles.quickGrid, isWide && styles.quickGridWide]}>
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
            const tSlots = receptionSlots.filter(s => s.teacherId === user.id);
            return `${tSlots.length}h`;
          })()}
          icon={CalendarDays}
          tone="coral"
        />
      </View>

      <SectionTitle title={t('teacherArea')} subtitle={t('teacherAreaSubtitle')} />
      {(user.teachings || []).map((courseName, index) => (
        <ListRowDummy
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
                      {translateDay(day, appLang).substring(0, 3)}
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
                    {translateDay(editingSlot.day, appLang)} - {editingSlot.time}
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
                          onSyncSlots(newSlots);
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
                        onSyncSlots(filtered);
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
  );
}

// Inline re-implementation of ListRow to avoid importing from index which can cause dependency cycles
function ListRowDummy({ title, subtitle, icon: Icon, hideChevron }: any) {
  const { colors, styles } = useTheme();
  return (
    <View style={styles.listRow}>
      {Icon && (
        <View style={styles.listIcon}>
          <Icon color={colors.forest} size={18} />
        </View>
      )}
      <View style={styles.flexOne}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
