'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { universityApi, applicationApi } from '@/lib/api';
import type { Application } from '@/lib/api';
import { formatFees, formatDeadline, STATUS_CONFIG, cn } from '@/lib/utils';
import {
  TrendingUp, CheckCircle2, Clock, AlertCircle,
  Euro, GraduationCap, ArrowRight, Calendar, Download,
  Timer, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UniversityLogo } from '@/components/shared/UniversityLogo';
import { Skeleton } from '@/components/shared/Skeleton';

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const } }),
};

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning ☀️';
  if (hour < 17) return 'Good afternoon 👋';
  if (hour < 21) return 'Good evening 🌆';
  return 'Good night 🌙';
}

function exportToCSV(applications: Application[]) {
  const headers = ['University', 'Course', 'Degree', 'Status', 'Priority', 'Deadline', 'Fees', 'Language', 'Applied At', 'Notes'];
  const rows = applications.map((app) => [
    app.course.university.name,
    app.course.name,
    app.course.degree ?? '',
    app.status,
    app.priority,
    app.course.deadline ? new Date(app.course.deadline).toLocaleDateString() : '',
    app.course.fees?.toString() ?? '',
    app.course.language ?? '',
    app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '',
    (app.notes ?? '').replace(/[\n,]/g, ' '),
  ]);

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `uni-tracker-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DashboardContent() {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: universityApi.getStats,
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationApi.getAll,
  });

  const isLoading = statsLoading || appsLoading;

  // Nearest urgent deadline
  const nearestDeadline = useMemo(() => {
    if (!stats?.upcomingDeadlines?.length) return null;
    const first = stats.upcomingDeadlines[0];
    const dl = formatDeadline(first.deadline);
    return { course: first, ...dl };
  }, [stats]);

  const STAT_CARDS = [
    {
      label: 'Total Applications', value: stats?.total ?? 0,
      icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50',
      sub: `${stats?.actionNeeded ?? 0} need attention`,
    },
    {
      label: 'Action Needed', value: stats?.actionNeeded ?? 0,
      icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50',
      sub: 'SOP writing or docs missing',
      urgent: true,
    },
    {
      label: 'In Progress', value: (stats?.submitted ?? 0) + (stats?.underReview ?? 0),
      icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50',
      sub: `${stats?.submitted ?? 0} submitted, ${stats?.underReview ?? 0} under review`,
    },
    {
      label: 'Approved', value: stats?.approved ?? 0,
      icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50',
      sub: `${stats?.rejected ?? 0} rejected, ${stats?.waitlisted ?? 0} waitlisted`,
    },
    {
      label: 'Total Fees', value: formatFees(stats?.totalFees),
      icon: Euro, color: 'text-amber-600', bg: 'bg-amber-50',
      sub: 'Pending application fees',
      isText: true,
    },
  ];

  const actionNeeded = applications?.filter(
    (a) => ['DRAFT', 'SOP_WRITING', 'DOCUMENTS_PREPARING'].includes(a.status)
  ) ?? [];

  const recent = applications?.slice(0, 6) ?? [];

  // Status chart data for donut
  const chartSegments = useMemo(() => {
    if (!stats || !stats.total) return [];
    const segments = [
      { status: 'DRAFT' as const, count: stats.draft ?? 0 },
      { status: 'SOP_WRITING' as const, count: stats.sopWriting ?? 0 },
      { status: 'DOCUMENTS_PREPARING' as const, count: stats.preparing ?? 0 },
      { status: 'DOCUMENTS_READY' as const, count: stats.documentsReady ?? 0 },
      { status: 'SUBMITTED' as const, count: stats.submitted ?? 0 },
      { status: 'UNDER_REVIEW' as const, count: stats.underReview ?? 0 },
      { status: 'APPROVED' as const, count: stats.approved ?? 0 },
      { status: 'REJECTED' as const, count: stats.rejected ?? 0 },
      { status: 'WAITLISTED' as const, count: stats.waitlisted ?? 0 },
    ].filter((s) => s.count > 0);

    let cum = 0;
    return segments.map((s) => {
      const pct = (s.count / stats.total) * 100;
      const start = cum;
      cum += pct;
      return { ...s, pct, start };
    });
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Welcome + Export */}
      <motion.div initial="hidden" animate="visible" variants={FADE_UP} custom={0}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">{mounted ? greeting : 'Welcome'}</h2>
          <p className="text-muted-foreground mt-1 text-[15px] font-medium">
            Here&apos;s an overview of your German university applications.
          </p>
        </div>
        {applications && applications.length > 0 && (
          <button
            onClick={() => exportToCSV(applications)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span className="sm:hidden md:inline">Export CSV</span>
            <span className="hidden sm:inline md:hidden">Export</span>
          </button>
        )}
      </motion.div>

      {/* Urgency banner */}
      {nearestDeadline && nearestDeadline.daysLeft !== null && nearestDeadline.daysLeft <= 30 && (
        <motion.div
          initial="hidden" animate="visible" variants={FADE_UP} custom={0.5}
          className={cn(
            'rounded-2xl p-5 border border-border/50 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden group transition-all duration-300 hover:shadow-md',
            nearestDeadline.urgency === 'urgent'
              ? 'bg-gradient-to-r from-rose-500/10 to-orange-500/5 hover:from-rose-500/15 border-rose-500/20'
              : 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5 hover:from-amber-500/15 border-amber-500/20',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner',
            nearestDeadline.urgency === 'urgent' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
          )}>
            <Timer className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-[15px] font-bold tracking-tight',
              nearestDeadline.urgency === 'urgent' ? 'text-rose-800 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300',
            )}>
              {nearestDeadline.daysLeft === 0 ? '⚠️ Deadline is TODAY!' : `${nearestDeadline.daysLeft} day${nearestDeadline.daysLeft === 1 ? '' : 's'} until next deadline`}
            </p>
            <p className={cn('text-[13px] font-medium mt-0.5 truncate', nearestDeadline.urgency === 'urgent' ? 'text-rose-700/80 dark:text-rose-400/80' : 'text-amber-700/80 dark:text-amber-400/80')}>
              {nearestDeadline.course.name} — {nearestDeadline.text}
            </p>
          </div>
          <Link href="/applications" className={cn(
            'text-[13px] font-bold flex items-center gap-1.5 flex-shrink-0 py-2 sm:py-0 transition-all',
            nearestDeadline.urgency === 'urgent' ? 'text-rose-600 hover:text-rose-700 dark:text-rose-400' : 'text-amber-600 hover:text-amber-700 dark:text-amber-400',
          )}>
            Review Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            variants={FADE_UP} initial="hidden" animate="visible" custom={i + 1}
            whileHover={{ y: -2 }}
            className={cn(
              'bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group',
              card.urgent && card.value > 0 && 'border-rose-500/30 bg-rose-500/5',
            )}
          >
            {isLoading ? (
              <Skeleton className="w-full h-16" />
            ) : (
              <>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300', card.bg)}>
                  <card.icon className={cn('w-5 h-5', card.color)} />
                </div>
                <p className="text-3xl font-black text-foreground tracking-tight leading-none">
                  {card.isText ? (
                    <span className="text-[22px]">{card.value}</span>
                  ) : card.value}
                </p>
                <p className="text-[13px] font-bold text-foreground mt-2">{card.label}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5 leading-tight truncate">{card.sub}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Action needed */}
        <motion.div
          variants={FADE_UP} initial="hidden" animate="visible" custom={6}
          className="xl:col-span-2 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Action Required
              {actionNeeded.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {actionNeeded.length}
                </span>
              )}
            </h3>
            <Link href="/applications" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          ) : actionNeeded.length === 0 ? (
            <div className="empty-state bg-background border border-border/50 rounded-2xl py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-[15px] font-bold text-foreground">All caught up!</p>
              <p className="text-[13px] font-medium text-muted-foreground mt-1">No applications need immediate attention.</p>
            </div>
          ) : (
            actionNeeded.slice(0, 5).map((app, i) => {
              const deadline = formatDeadline(app.course.deadline);
              return (
                <motion.div
                  key={app.id}
                  variants={FADE_UP} initial="hidden" animate="visible" custom={i}
                  whileHover={{ y: -2 }}
                >
                  <Link href={`/applications/${app.id}`}>
                    <div className="bg-background border border-border/50 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 group cursor-pointer block">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="hidden sm:block shadow-sm rounded-xl overflow-hidden flex-shrink-0">
                          <UniversityLogo
                            url={app.course.university.logoUrl}
                            name={app.course.university.name}
                            size="md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="min-w-0 flex items-center gap-3">
                              <div className="sm:hidden w-8 h-8 flex-shrink-0 shadow-sm rounded-lg overflow-hidden">
                                <UniversityLogo url={app.course.university.logoUrl} name={app.course.university.name} size="xs" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[15px] font-bold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {app.course.name}
                                </p>
                                <p className="text-[13px] font-medium text-muted-foreground truncate">
                                  {app.course.university.name}
                                </p>
                              </div>
                            </div>
                            <StatusBadge status={app.status} size="sm" />
                          </div>

                          {app.course.deadline && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className={cn(
                                'text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border',
                                deadline.urgency === 'urgent' && 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
                                deadline.urgency === 'soon'   && 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
                                deadline.urgency === 'ok'     && 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                deadline.urgency === 'passed' && 'text-slate-500 bg-slate-500/10 border-slate-500/20',
                              )}>
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                {deadline.text}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Right panel */}
        <motion.div
          variants={FADE_UP} initial="hidden" animate="visible" custom={7}
          className="space-y-4"
        >
          {/* Visual donut chart */}
          {stats && stats.total > 0 && chartSegments.length > 0 && (
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-violet-500/10 rounded-lg">
                  <Zap className="w-4 h-4 text-violet-500" />
                </div>
                Application Distribution
              </h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90 drop-shadow-md">
                    {chartSegments.map((seg) => {
                      const cfg = STATUS_CONFIG[seg.status];
                      const colorMap: Record<string, string> = {
                        'bg-slate-400': '#94a3b8',
                        'bg-violet-500': '#8b5cf6',
                        'bg-amber-500': '#f59e0b',
                        'bg-cyan-500': '#06b6d4',
                        'bg-blue-500': '#3b82f6',
                        'bg-indigo-500': '#6366f1',
                        'bg-emerald-500': '#10b981',
                        'bg-rose-500': '#f43f5e',
                        'bg-orange-500': '#f97316',
                      };
                      const stroke = colorMap[cfg.dot] || '#6366f1';
                      const dashArray = `${seg.pct} ${100 - seg.pct}`;
                      return (
                        <motion.circle
                          key={seg.status}
                          cx="18" cy="18" r="15.9155"
                          fill="none"
                          stroke={stroke}
                          strokeWidth="3.5"
                          strokeDasharray={dashArray}
                          strokeDashoffset={`${-seg.start}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + seg.start * 0.01, duration: 0.5 }}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center mt-1">
                      <p className="text-[26px] font-black tracking-tight text-foreground leading-none">{stats.total}</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">total</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5 w-full">
                  {chartSegments.map((seg) => {
                    const cfg = STATUS_CONFIG[seg.status];
                    return (
                      <div key={seg.status} className="flex items-center gap-3">
                        <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm', cfg.dot)} />
                        <span className="text-[12px] font-bold text-muted-foreground flex-1 truncate">{cfg.label}</span>
                        <span className="text-[13px] font-black text-foreground">{seg.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Status breakdown bars */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              Status Breakdown
            </h3>
            {isLoading ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : (
              <div className="space-y-4">
                {[
                  { status: 'SUBMITTED' as const,     count: stats?.submitted ?? 0 },
                  { status: 'UNDER_REVIEW' as const,  count: stats?.underReview ?? 0 },
                  { status: 'APPROVED' as const,      count: stats?.approved ?? 0 },
                  { status: 'REJECTED' as const,      count: stats?.rejected ?? 0 },
                  { status: 'WAITLISTED' as const,    count: stats?.waitlisted ?? 0 },
                ].map(({ status, count }) => {
                  const cfg = STATUS_CONFIG[status];
                  const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', cfg.dot)} />
                      <span className="text-[12px] font-bold text-muted-foreground flex-1 truncate">{cfg.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-16 sm:w-24 h-2 rounded-full bg-border/50 overflow-hidden shadow-inner flex-shrink-0">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', cfg.dot)}
                          />
                        </div>
                        <span className="text-[13px] font-black text-foreground w-6 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              Upcoming Deadlines
            </h3>
            {isLoading ? (
              <Skeleton className="h-28 rounded-xl" />
            ) : !stats?.upcomingDeadlines?.length ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Calendar className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-[13px] font-bold text-muted-foreground">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingDeadlines.slice(0, 4).map((course) => {
                  const dl = formatDeadline(course.deadline);
                  return (
                    <div key={course.id} className="flex items-center gap-3 bg-background border border-border/50 p-2.5 rounded-xl shadow-sm">
                      <div className={cn(
                        'w-1.5 h-10 rounded-full flex-shrink-0 shadow-sm',
                        dl.urgency === 'urgent' ? 'bg-rose-500' :
                        dl.urgency === 'soon'   ? 'bg-amber-500' : 'bg-emerald-500',
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-foreground truncate">{course.name}</p>
                        <p className={cn(
                          'text-[11px] font-semibold mt-0.5',
                          dl.urgency === 'urgent' ? 'text-rose-600 dark:text-rose-400' :
                          dl.urgency === 'soon'   ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                        )}>
                          {dl.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent applications */}
      <motion.div variants={FADE_UP} initial="hidden" animate="visible" custom={8}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-lg tracking-tight">Recent Applications</h3>
          <Link href="/applications" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            : recent.map((app, i) => (
              <motion.div key={app.id} variants={FADE_UP} initial="hidden" animate="visible" custom={i} whileHover={{ y: -3 }}>
                <Link href={`/applications/${app.id}`}>
                  <div className="bg-background border border-border/50 rounded-2xl p-5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group h-full flex flex-col justify-between">
                    <div className="flex items-start gap-4">
                      <div className="shadow-sm rounded-xl overflow-hidden flex-shrink-0">
                        <UniversityLogo
                          url={app.course.university.logoUrl}
                          name={app.course.university.name}
                          size="md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {app.course.name}
                        </p>
                        <p className="text-[13px] font-medium text-muted-foreground truncate mb-3">
                          {app.course.university.name} <span className="text-border mx-1">|</span> {app.course.degree ?? 'Masters'}
                        </p>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <StatusBadge status={app.status} size="sm" />
                          {app.course.deadline && (() => {
                            const dl = formatDeadline(app.course.deadline);
                            if (dl.daysLeft !== null && dl.daysLeft >= 0 && dl.daysLeft <= 30) {
                              return (
                                <span className={cn(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm',
                                  dl.urgency === 'urgent' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400' : 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
                                )}>
                                  {dl.daysLeft}d left
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          }
        </div>
      </motion.div>
    </div>
  );
}
