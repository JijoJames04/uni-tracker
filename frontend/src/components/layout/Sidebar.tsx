'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import {
  LayoutDashboard, GraduationCap, FileText, Calendar,
  FolderOpen, User, ChevronLeft, ChevronRight, X,
  BookOpen, Sparkles, BarChart3, Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app.store';
import { useQuery } from '@tanstack/react-query';
import { universityApi } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     badge: null },
  { href: '/applications',  icon: BookOpen,        label: 'Applications',  badge: 'count' },
  { href: '/universities',  icon: GraduationCap,   label: 'Universities',  badge: null },
  { href: '/documents',     icon: FolderOpen,      label: 'Documents',     badge: null },
  { href: '/calendar',      icon: Calendar,        label: 'Calendar',      badge: null },
  { href: '/profile',       icon: User,            label: 'My Profile',    badge: null },
  { href: '/resources',     icon: Compass,         label: 'Resources',     badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, setSidebarCollapsed } = useAppStore();

  const animationProps = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: universityApi.getStats,
    staleTime: 30000,
  });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ 
          x: 0,
          width: sidebarCollapsed ? 72 : 260 
        }}
        transition={{ x: { duration: 0.3, ease: 'easeOut' }, width: { duration: 0.25, ease: 'easeInOut', delay: 0.1 } }}
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden',
          'gradient-brand shadow-2xl',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 flex-shrink-0">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="logo-full"
                {...animationProps}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">UniTracker</p>
                  <p className="text-white/40 text-xs truncate">Germany Applications</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logo-icon"
                {...animationProps}
                className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mx-auto"
              >
                <GraduationCap className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile close */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats pills */}
        <AnimatePresence>
          {!sidebarCollapsed && stats && (
            <motion.div
              {...animationProps}
              className="px-3 pt-3 pb-2"
            >
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Total',    value: stats.total,      color: 'bg-white/10' },
                  { label: 'Active',   value: stats.submitted + stats.underReview, color: 'bg-blue-500/20' },
                  { label: 'Approved', value: stats.approved,   color: 'bg-emerald-500/20' },
                ].map((s) => (
                  <div key={s.label} className={cn('rounded-lg p-2 text-center', s.color)}>
                    <p className="text-white font-bold text-base leading-none">{s.value}</p>
                    <p className="text-white/50 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {!sidebarCollapsed && (
            <p className="px-3 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              Navigation
            </p>
          )}
          {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            const badgeCount = badge === 'count' ? stats?.actionNeeded : null;

            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'nav-item relative',
                    isActive && 'active',
                    sidebarCollapsed && 'justify-center px-0',
                  )}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-white')} />

                  {!sidebarCollapsed && (
                    <span className="flex-1 truncate">{label}</span>
                  )}

                  {badgeCount && badgeCount > 0 && !sidebarCollapsed && (
                    <span className="ml-auto flex-shrink-0 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {badgeCount}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute inset-0 rounded-lg bg-white/15 -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Action-needed alert */}
        <AnimatePresence>
          {!sidebarCollapsed && stats && stats.actionNeeded > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-3 mb-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold">{stats.actionNeeded} need action</p>
                  <p className="text-white/50 text-[10px]">Check pending tasks</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle - desktop only */}
        <div className="hidden lg:flex items-center justify-center h-12 border-t border-white/10">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            {sidebarCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        </div>
      </motion.aside>
    </>
  );
}
