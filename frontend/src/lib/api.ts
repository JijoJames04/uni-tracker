import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  },
);

// ─── Types ────────────────────────────────────────────────────────
export type ApplicationStatus =
  | 'DRAFT' | 'SOP_WRITING' | 'DOCUMENTS_PREPARING' | 'DOCUMENTS_READY'
  | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type ApplicationVia = 'DIRECT' | 'UNI_ASSIST' | 'BOTH';
export type DocumentType =
  | 'SOP' | 'CV' | 'TRANSCRIPT' | 'BACHELOR_CERTIFICATE'
  | 'LANGUAGE_CERT_IELTS' | 'LANGUAGE_CERT_TOEFL' | 'LANGUAGE_CERT_TESTDAF'
  | 'LANGUAGE_CERT_GOETHE' | 'RECOMMENDATION_LETTER' | 'PASSPORT'
  | 'MOTIVATION_LETTER' | 'PORTFOLIO' | 'RESEARCH_PROPOSAL' | 'OTHER';

export interface University {
  id: string;
  name: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  country: string;
  website?: string;
  description?: string;
  courses: Course[];
  createdAt: string;
}

export interface Course {
  id: string;
  universityId: string;
  name: string;
  description?: string;
  degree?: string;
  language?: string;
  duration?: string;
  fees?: number;
  feesPerSemester?: number;
  currency: string;
  deadline?: string;
  deadlineInternational?: string;
  deadlineLabel?: string;
  startDate?: string;
  applicationUrl?: string;
  sourceUrl?: string;
  ects?: number;
  applicationVia: ApplicationVia;
  uniAssistInfo?: string;
  requirements?: string;
  university: University;
  application?: Application;
  createdAt: string;
}

export interface Application {
  id: string;
  courseId: string;
  status: ApplicationStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  appliedAt?: string;
  decisionAt?: string;
  submissionFee?: number;
  course: Course;
  documents: Document[];
  timeline: TimelineEntry[];
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  applicationId: string;
  type: DocumentType;
  name: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  version: number;
  notes?: string;
  uploadedAt: string;
}

export interface TimelineEntry {
  id: string;
  applicationId: string;
  action: string;
  description?: string;
  type: 'STATUS_CHANGE' | 'DOCUMENT_UPLOAD' | 'NOTE' | 'DEADLINE' | 'EMAIL' | 'PAYMENT';
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  applicationId: string;
  label: string;
  completed: boolean;
  order: number;
}

export interface Profile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  currentAddress?: string;
  homeAddress?: string;
  dateOfBirth?: string;
  bachelorDegree?: string;
  bachelorUniversity?: string;
  bachelorGrade?: number;
  bachelorYear?: number;
  masterDegree?: string;
  masterUniversity?: string;
  masterGrade?: number;
  masterYear?: number;
  ieltsScore?: number;
  ieltsDate?: string;
  toeflScore?: number;
  toeflDate?: string;
  testDafScore?: number;
  testDafDate?: string;
  goetheLevel?: string;
  germanLevel?: string;
  greVerbal?: number;
  greQuant?: number;
  greAnalytical?: number;
  gmatScore?: number;
  workExperience?: string;
  skills: string[];
  researchInterests?: string;
  publications?: string;
  targetDegree?: string;
  targetField?: string;
  targetSemester?: string;
}

export interface Stats {
  total: number;
  draft: number;
  sopWriting: number;
  preparing: number;
  documentsReady: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  waitlisted: number;
  actionNeeded: number;
  totalFees: number;
  upcomingDeadlines: Course[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'DEADLINE' | 'INTERVIEW' | 'PAYMENT' | 'REMINDER' | 'MILESTONE';
  color?: string;
  courseId?: string;
  daysLeft?: number;
  university?: string;
  isDeadline?: boolean;
}

export interface ScrapedData {
  universityName: string;
  courseName: string;
  description: string;
  degree: string;
  language: string;
  duration: string;
  fees: number | null;
  feesPerSemester: number | null;
  currency: string;
  deadline: string | null;
  applicationUrl: string;
  sourceUrl: string;
  logoUrl: string | null;
  address: string;
  city: string;
  ects: number | null;
  applicationVia: ApplicationVia;
  uniAssistInfo: string;
  requirements: string;
}

// ─── API Functions ─────────────────────────────────────────────

// Universities
export const universityApi = {
  getAll: () => api.get<University[]>('/universities').then((r) => r.data),
  getOne: (id: string) => api.get<University>(`/universities/${id}`).then((r) => r.data),
  getStats: () => api.get<Stats>('/universities/stats').then((r) => r.data),
  create: (data: Partial<University>) => api.post<University>('/universities', data).then((r) => r.data),
  update: (id: string, data: Partial<University>) =>
    api.patch<University>(`/universities/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/universities/${id}`),
  addFromUrl: (url: string) =>
    api.post('/universities/from-url', { url }).then((r) => r.data),
  updateDeadline: (courseId: string, deadline: string, label?: string) =>
    api.patch<Course>(`/universities/courses/${courseId}/deadline`, { deadline, deadlineLabel: label }).then((r) => r.data),
};

// Applications
export const applicationApi = {
  getAll: () => api.get<Application[]>('/applications').then((r) => r.data),
  getOne: (id: string) => api.get<Application>(`/applications/${id}`).then((r) => r.data),
  getKanban: () => api.get<Record<ApplicationStatus, Application[]>>('/applications/kanban').then((r) => r.data),
  update: (id: string, data: Partial<Application>) =>
    api.patch<Application>(`/applications/${id}`, data).then((r) => r.data),
  updateChecklist: (id: string, itemId: string, completed: boolean) =>
    api.patch(`/applications/${id}/checklist`, { id: itemId, completed }).then((r) => r.data),
  addChecklist: (id: string, label: string) =>
    api.post(`/applications/${id}/checklist`, { label }).then((r) => r.data),
  removeChecklist: (itemId: string) =>
    api.delete(`/applications/checklist/${itemId}`),
  delete: (id: string) => api.delete(`/applications/${id}`),
  deleteAll: () => api.delete('/applications'),
};

// Documents
export const documentApi = {
  getByApplication: (applicationId: string) =>
    api.get<Document[]>(`/documents/application/${applicationId}`).then((r) => r.data),
  getStats: (applicationId: string) =>
    api.get(`/documents/application/${applicationId}/stats`).then((r) => r.data),
  upload: (applicationId: string, type: DocumentType, file: File, notes?: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    if (notes) form.append('notes', notes);
    return api.post(`/documents/upload/${applicationId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  download: (id: string) => `/api/v1/documents/${id}/download`,
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// Scraper
export const scraperApi = {
  scrape: (url: string) =>
    api.post<ScrapedData>('/scrape', { url }).then((r) => r.data),
};

// Prompts
export const promptApi = {
  generateSop: (applicationId: string) =>
    api.get<{ prompt: string; wordCount: number }>(`/prompts/sop/${applicationId}`).then((r) => r.data),
  generateEmail: (applicationId: string, type: string) =>
    api.get<{ prompt: string }>(`/prompts/email/${applicationId}?type=${type}`).then((r) => r.data),
};

// Timeline
export const timelineApi = {
  getByApplication: (applicationId: string) =>
    api.get<TimelineEntry[]>(`/timeline/application/${applicationId}`).then((r) => r.data),
  addEntry: (applicationId: string, data: Partial<TimelineEntry>) =>
    api.post<TimelineEntry>(`/timeline/application/${applicationId}`, data).then((r) => r.data),
};

// Profile
export const profileApi = {
  get: () => api.get<Profile>('/profile').then((r) => r.data),
  save: (data: Partial<Profile>) => api.post<Profile>('/profile', data).then((r) => r.data),
};

// Calendar
export const calendarApi = {
  getEvents: () => api.get<CalendarEvent[]>('/calendar').then((r) => r.data),
  createEvent: (data: Partial<CalendarEvent>) =>
    api.post<CalendarEvent>('/calendar', data).then((r) => r.data),
  updateEvent: (id: string, data: Partial<CalendarEvent>) =>
    api.patch<CalendarEvent>(`/calendar/${id}`, data).then((r) => r.data),
  deleteEvent: (id: string) => api.delete(`/calendar/${id}`),
};

export default api;
