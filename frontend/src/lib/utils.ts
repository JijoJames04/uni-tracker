import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, differenceInDays, isPast } from 'date-fns';
import type { ApplicationStatus, ApplicationVia } from './api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Status ───────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  DRAFT:                { label: 'Draft',              color: 'text-slate-600',  bg: 'bg-slate-100',  border: 'border-slate-200',  dot: 'bg-slate-400'  },
  SOP_WRITING:          { label: 'SOP Writing',        color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-200', dot: 'bg-violet-500' },
  DOCUMENTS_PREPARING:  { label: 'Preparing Docs',     color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-500'  },
  DOCUMENTS_READY:      { label: 'Documents Ready',    color: 'text-cyan-700',   bg: 'bg-cyan-50',    border: 'border-cyan-200',   dot: 'bg-cyan-500'   },
  SUBMITTED:            { label: 'Submitted',          color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   dot: 'bg-blue-500'   },
  UNDER_REVIEW:         { label: 'Under Review',       color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200', dot: 'bg-indigo-500' },
  APPROVED:             { label: 'Approved ✓',         color: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200',dot: 'bg-emerald-500'},
  REJECTED:             { label: 'Rejected',           color: 'text-rose-700',   bg: 'bg-rose-50',    border: 'border-rose-200',   dot: 'bg-rose-500'   },
  WAITLISTED:           { label: 'Waitlisted',         color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200', dot: 'bg-orange-500' },
};

export const VIA_CONFIG: Record<ApplicationVia, { label: string; color: string; bg: string; border: string }> = {
  DIRECT:     { label: 'Direct Application',    color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  UNI_ASSIST: { label: 'via uni-assist',        color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  BOTH:       { label: 'Direct & uni-assist',   color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200'   },
};

export const TIMELINE_TYPE_CONFIG = {
  STATUS_CHANGE:    { icon: '🔄', color: 'text-indigo-600', bg: 'bg-indigo-50'  },
  DOCUMENT_UPLOAD:  { icon: '📎', color: 'text-blue-600',   bg: 'bg-blue-50'    },
  NOTE:             { icon: '📝', color: 'text-slate-600',  bg: 'bg-slate-50'   },
  DEADLINE:         { icon: '⏰', color: 'text-amber-600',  bg: 'bg-amber-50'   },
  EMAIL:            { icon: '✉️', color: 'text-cyan-600',   bg: 'bg-cyan-50'    },
  PAYMENT:          { icon: '💳', color: 'text-emerald-600',bg: 'bg-emerald-50' },
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  SOP:                  'Statement of Purpose',
  CV:                   'CV / Resume',
  TRANSCRIPT:           'Academic Transcripts',
  BACHELOR_CERTIFICATE: 'Bachelor Certificate',
  LANGUAGE_CERT_IELTS:  'IELTS Certificate',
  LANGUAGE_CERT_TOEFL:  'TOEFL Certificate',
  LANGUAGE_CERT_TESTDAF:'TestDaF Certificate',
  LANGUAGE_CERT_GOETHE: 'Goethe Certificate',
  RECOMMENDATION_LETTER:'Recommendation Letter',
  PASSPORT:             'Passport Copy',
  MOTIVATION_LETTER:    'Motivation Letter',
  PORTFOLIO:            'Portfolio',
  RESEARCH_PROPOSAL:    'Research Proposal',
  OTHER:                'Other Document',
};

// ─── Status Pipeline ─────────────────────────────────────────────

export const STATUS_PIPELINE: ApplicationStatus[] = [
  'DRAFT', 'SOP_WRITING', 'DOCUMENTS_PREPARING', 'DOCUMENTS_READY',
  'SUBMITTED', 'UNDER_REVIEW', 'APPROVED',
];

export function getStatusProgress(status: ApplicationStatus): number {
  const idx = STATUS_PIPELINE.indexOf(status);
  if (idx === -1) return 0;
  if (status === 'REJECTED' || status === 'WAITLISTED') return 60;
  return Math.round((idx / (STATUS_PIPELINE.length - 1)) * 100);
}

export function isActionNeeded(status: ApplicationStatus): boolean {
  return ['DRAFT', 'SOP_WRITING', 'DOCUMENTS_PREPARING'].includes(status);
}

export function isTerminal(status: ApplicationStatus): boolean {
  return ['APPROVED', 'REJECTED', 'WAITLISTED'].includes(status);
}

// ─── Date / Deadline ─────────────────────────────────────────────

export function formatDeadline(deadline: string | null | undefined): {
  text: string; daysLeft: number | null; urgency: 'urgent' | 'soon' | 'ok' | 'passed' | null;
} {
  if (!deadline) return { text: 'No deadline set', daysLeft: null, urgency: null };

  const date = new Date(deadline);
  const days = differenceInDays(date, new Date());

  if (isPast(date)) return { text: `Passed (${format(date, 'MMM d, yyyy')})`, daysLeft: days, urgency: 'passed' };
  if (days <= 14) return { text: `${days}d left — ${format(date, 'MMM d, yyyy')}`, daysLeft: days, urgency: 'urgent' };
  if (days <= 45) return { text: `${days}d left — ${format(date, 'MMM d, yyyy')}`, daysLeft: days, urgency: 'soon' };
  return { text: format(date, 'MMMM d, yyyy'), daysLeft: days, urgency: 'ok' };
}

export function formatRelativeTime(date: string): string {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return date; }
}

export function formatDate(date: string, fmt = 'MMM d, yyyy'): string {
  try { return format(new Date(date), fmt); }
  catch { return date; }
}

// ─── Formatting ──────────────────────────────────────────────────

export function formatFees(fees: number | null | undefined, currency = 'EUR'): string {
  if (!fees) return 'Free / No tuition';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(fees);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function truncate(str: string, length = 80): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '…';
}

export function getDeadlineUrgencyClass(daysLeft: number | null): string {
  if (daysLeft === null) return '';
  if (daysLeft < 0) return 'deadline-passed';
  if (daysLeft <= 14) return 'deadline-urgent';
  if (daysLeft <= 45) return 'deadline-soon';
  return 'deadline-ok';
}
