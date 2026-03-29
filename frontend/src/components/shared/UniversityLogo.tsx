'use client';
import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';
import { useState } from 'react';

interface UniversityLogoProps {
  url?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  xs: { container: 'w-7 h-7', text: 'text-[10px]', img: 28 },
  sm: { container: 'w-9 h-9', text: 'text-xs',     img: 36 },
  md: { container: 'w-12 h-12', text: 'text-sm',   img: 48 },
  lg: { container: 'w-16 h-16', text: 'text-base', img: 64 },
};

const GRADIENT_COLORS = [
  'from-indigo-500 to-purple-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
];

function getColor(name: string): string {
  const idx = name.charCodeAt(0) % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[idx];
}

export function UniversityLogo({ url, name, size = 'md', className }: UniversityLogoProps) {
  const [imgError, setImgError] = useState(false);
  const cfg = SIZE_MAP[size];
  const initials = getInitials(name);
  const gradient = getColor(name);

  if (url && !imgError) {
    return (
      <div className={cn(cfg.container, 'rounded-xl overflow-hidden flex-shrink-0 bg-white border border-border', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      cfg.container, 'rounded-xl flex-shrink-0 flex items-center justify-center',
      `bg-gradient-to-br ${gradient}`, className,
    )}>
      <span className={cn('text-white font-bold', cfg.text)}>{initials}</span>
    </div>
  );
}
