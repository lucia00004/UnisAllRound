import { BACKEND_URL } from './constants';
import type { UserProfile, Exam, Ticket, ReceptionSlot, NotificationItem, CanteenMenuData } from './types';

// Helper for fetch requests
async function apiRequest<T>(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const config: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      console.warn(`API Timeout on ${method} ${path} (exceeded 8000ms)`);
      throw new Error('Connection timed out. Please check your connection.');
    }
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

  deleteExam: (examId: string) =>
    apiRequest<{ message: string }>(`/api/exams/${examId}`, 'DELETE'),

  // Tickets management
  getTickets: (creatorId: string, role: string, scope?: string) => 
    apiRequest<any[]>(`/api/tickets?creatorId=${creatorId}&role=${role}&scope=${scope || ''}`).then(list =>
      list.map(t => {
        const desc = t.description || '';
        const parts = desc.split(' - ');
        const location = parts[0] || 'N/A';
        const body = parts.slice(1).join(' - ') || desc;
        return {
          id: t.id,
          title: t.title,
          requester: t.creator_name ? `${t.creator_name} ${t.creator_surname}` : 'Utente',
          location: location,
          body: body,
          status: t.status,
          priority: t.priority,
          date: t.created_at,
          domain: t.category,
          assignedTo: t.assigned_to,
        };
      })
    ),

  createTicket: (ticketData: Ticket) => 
    apiRequest<{ id: string; title: string }>('/api/tickets', 'POST', ticketData),

  updateTicket: (ticketId: string, status: Ticket['status'], assignedTo?: string) => 
    apiRequest<{ message: string }>(`/api/tickets/${ticketId}`, 'PUT', { status, assignedTo }),

  // Reception slots management (MySQL)
  getSlots: () => 
    apiRequest<ReceptionSlot[]>('/api/slots'),

  createSlot: (slotData: any) => 
    apiRequest<{ id: string; teachingName: string; status: string }>('/api/slots', 'POST', slotData),

  updateSlot: (slotId: string, status: string, description?: string, bookedByStudentId?: string) => 
    apiRequest<{ message: string }>(`/api/slots/${slotId}`, 'PUT', { status, description, bookedByStudentId }),

  deleteSlot: (slotId: string) => 
    apiRequest<{ message: string }>(`/api/slots/${slotId}`, 'DELETE'),

  // Academic data
  getHierarchy: () => 
    apiRequest<any[]>('/api/academic/hierarchy'),

  // Notifications management
  getNotifications: (role: string, userId: string) =>
    apiRequest<NotificationItem[]>(`/api/notifications?role=${role}&userId=${userId}`).then(list =>
      list.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        target: n.target,
        date: n.date,
      }))
    ),

  createNotification: (notifData: { id: string; title: string; body: string; target: string; date: string; senderId?: string }) =>
    apiRequest<{ id: string; title: string; target: string }>('/api/notifications', 'POST', notifData),

  fetchCanteenMenu: () =>
    apiRequest<CanteenMenuData>('/api/canteen/menu'),
};
