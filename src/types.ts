export type Role = 'Studente' | 'Docente' | 'PTA';

export type MainTab = 'home' | 'role' | 'campus' | 'services' | 'profile';

export type ExamStatus = 'Da valutare' | 'Accettato' | 'Rifiutato';

export type TicketStatus = 'Aperto' | 'In carico' | 'Chiuso';

export type UserProfile = {
  id: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  degreeCourse?: string;
  phone: string;
  language: 'IT' | 'EN';
};

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
