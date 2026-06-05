export type Role = 'Studente' | 'Docente' | 'PTA';

export type MainTab = 'home' | 'role' | 'campus' | 'services' | 'profile';

export type ExamStatus = 'Da valutare' | 'Accettato' | 'Rifiutato';

export type TicketStatus = 'Aperto' | 'In carico' | 'In sospeso' | 'Chiuso';

export type UserProfile = {
  id: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  degreeCourse?: string;
  matricola?: string;
  phone: string;
  language: 'IT' | 'EN';
  shifts?: string[];
  ptaDomain?: string;
  teacherDegrees?: string[];
  teachings?: string[];
};

export type DraftProfile = Pick<UserProfile, 'name' | 'surname' | 'email' | 'phone' | 'department' | 'language' | 'degreeCourse' | 'matricola' | 'shifts' | 'ptaDomain' | 'teacherDegrees' | 'teachings'>;

export type Exam = {
  id: string;
  course: string;
  cfu: number;
  grade: number;
  date: string;
  status: ExamStatus;
};

export type Lesson = {
  id: string;
  course: string;
  day: string;
  time: string;
  room: string;
  teacher: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  target: Role | 'Tutti';
  date: string;
};

export type Ticket = {
  id: string;
  title: string;
  requester: string;
  location: string;
  body: string;
  status: TicketStatus;
  priority: 'Bassa' | 'Media' | 'Alta';
  date: string;
  domain?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  tag: string;
  link?: string;
};

export type CampusPoint = {
  id: string;
  name: string;
  type: string;
  detail: string;
  x: number;
  y: number;
};

export type ReceptionSlot = {
  id: string;
  day: 'Lunedì' | 'Martedì' | 'Mercoledì' | 'Giovedì' | 'Venerdì';
  time: string;
  desc: string;
  bookedBy?: string;
};

