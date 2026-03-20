// StatusBadge
'use client';
import { cn, STATUS_CONFIG, VIA_CONFIG } from '@/lib/utils';
import type { ApplicationStatus, ApplicationVia } from '@/lib/api';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium border',
      cfg.bg, cfg.color, cfg.border,
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
    )}>
      <span className={cn('rounded-full flex-shrink-0', cfg.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {cfg.label}
    </span>
  );
}

interface ViaBadgeProps {
  via: ApplicationVia;
}

export function ViaBadge({ via }: ViaBadgeProps) {
  const cfg = VIA_CONFIG[via];
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full text-xs font-medium border px-2.5 py-1',
      cfg.bg, cfg.color, cfg.border,
    )}>
      {via === 'UNI_ASSIST' ? '🎓' : via === 'DIRECT' ? '🔗' : '↕️'} {cfg.label}
    </span>
  );
}
