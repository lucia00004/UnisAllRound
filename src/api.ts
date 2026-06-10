import { BACKEND_URL } from './constants';
import type { UserProfile, Exam, Ticket, ReceptionSlot } from './types';

// Helper for fetch requests
async function apiRequest<T>(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.warn(`API Error on ${method} ${path}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  login: (email: string, password: string) => 
    apiRequest<UserProfile>('/api/auth/login', 'POST', { email, password }),

  register: (userData: any) => 
    apiRequest<UserProfile>('/api/auth/register', 'POST', userData),

  getUsers: () => 
    apiRequest<UserProfile[]>('/api/users'),

  // Profile operations
  updateProfile: (profileData: any) => 
    apiRequest<{ message: string }>('/api/profile', 'PUT', profileData),

  deleteProfile: (userId: string) => 
    apiRequest<{ message: string }>(`/api/profile/${userId}`, 'DELETE'),

  // Exams management
  getExams: (studentId: string) => 
    apiRequest<any[]>(`/api/exams?studentId=${studentId}`).then(list => 
      list.map(e => ({
        id: e.id,
        course: e.name || e.course,
        cfu: e.cfu,
        grade: e.grade,
        date: e.date,
        status: e.status === 'Superato' ? 'Accettato' : e.status,
        lode: e.lode
      }))
    ),

  addExam: (examData: Exam) => 
    apiRequest<{ id: string; name: string }>('/api/exams', 'POST', examData),

  updateExam: (examId: string, examData: Partial<Exam>) => 
    apiRequest<{ message: string }>(`/api/exams/${examId}`, 'PUT', examData),

  // Tickets management
  getTickets: (creatorId: string, role: string, scope?: string) => 
    apiRequest<Ticket[]>(`/api/tickets?creatorId=${creatorId}&role=${role}&scope=${scope || ''}`),

  createTicket: (ticketData: Ticket) => 
    apiRequest<{ id: string; title: string }>('/api/tickets', 'POST', ticketData),

  updateTicket: (ticketId: string, status: Ticket['status']) => 
    apiRequest<{ message: string }>(`/api/tickets/${ticketId}`, 'PUT', { status }),

  // Reception slots management (MySQL)
  getSlots: () => 
    apiRequest<ReceptionSlot[]>('/api/slots'),

  createSlot: (slotData: any) => 
    apiRequest<{ id: string; teachingName: string; status: string }>('/api/slots', 'POST', slotData),

  updateSlot: (slotId: string, status: string, description?: string) => 
    apiRequest<{ message: string }>(`/api/slots/${slotId}`, 'PUT', { status, description }),

  deleteSlot: (slotId: string) => 
    apiRequest<{ message: string }>(`/api/slots/${slotId}`, 'DELETE'),

  // Academic data
  getHierarchy: () => 
    apiRequest<any[]>('/api/academic/hierarchy'),
};
