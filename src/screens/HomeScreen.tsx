import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '../theme';
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
import { capitalizeWords } from '../utils';
import { StudentHome, TeacherHome, PtaHome } from '../components';

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
  const { colors, styles } = useTheme();

  return (
    <View>
      <View style={styles.cleanGreeting}>
        <Text style={styles.greetingKicker}>{t('welcomeBack')}</Text>
        <Text style={styles.greetingName}>
          {capitalizeWords(user.name)} {capitalizeWords(user.surname)}
        </Text>
      </View>

      {user.role === 'Studente' && (
        <StudentHome
          user={user}
          isWide={isWide}
          careerStats={careerStats}
          exams={exams}
          newExam={newExam}
          setNewExam={setNewExam}
          onAddExam={onAddExam}
          onExamStatus={onExamStatus}
          onDeleteExam={onDeleteExam}
          t={t}
          receptionSlots={receptionSlots}
          onSyncSlots={onSyncSlots}
          onAddNotification={onAddNotification}
          onSectionLayout={onSectionLayout}
        />
      )}

      {user.role === 'Docente' && (
        <TeacherHome
          user={user}
          isWide={isWide}
          t={t}
          teacherMessage={teacherMessage}
          setTeacherMessage={setTeacherMessage}
          teacherResult={teacherResult}
          setTeacherResult={setTeacherResult}
          onPublishResult={onPublishResult}
          onSendTeacherMessage={onSendTeacherMessage}
          receptionSlots={receptionSlots}
          onSyncSlots={onSyncSlots}
          onAddNotification={onAddNotification}
          users={users}
          customNotifications={customNotifications}
        />
      )}

      {user.role === 'PTA' && (
        <PtaHome
          user={user}
          isWide={isWide}
          t={t}
          tickets={tickets}
          onTicketStatus={onTicketStatus}
          onSectionLayout={onSectionLayout}
          archivedTicketIds={archivedTicketIds}
          deletedTicketIds={deletedTicketIds}
          onArchiveTicket={onArchiveTicket}
          onDeleteTicket={onDeleteTicket}
        />
      )}
    </View>
  );
}
