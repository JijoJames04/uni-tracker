// Append to utils.ts – these are also used by components
export { DOC_TYPE_LABELS } from './constants';

export const TIMELINE_TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  STATUS_CHANGE:    { icon: '🔄', color: 'text-indigo-600', bg: 'bg-indigo-50'  },
  DOCUMENT_UPLOAD:  { icon: '📎', color: 'text-blue-600',   bg: 'bg-blue-50'    },
  NOTE:             { icon: '📝', color: 'text-slate-600',  bg: 'bg-slate-50'   },
  DEADLINE:         { icon: '⏰', color: 'text-amber-600',  bg: 'bg-amber-50'   },
  EMAIL:            { icon: '✉️', color: 'text-cyan-600',   bg: 'bg-cyan-50'    },
  PAYMENT:          { icon: '💳', color: 'text-emerald-600',bg: 'bg-emerald-50' },
};
