'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { universityApi, applicationApi } from '@/lib/api';
import type { Application } from '@/lib/api';
import { formatFees, formatDeadline, STATUS_CONFIG, cn } from '@/lib/utils';
import {
  TrendingUp, CheckCircle2, XCircle, Clock, AlertCircle,
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
        className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{mounted ? greeting : 'Welcome'}</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Here's an overview of your German university applications.
          </p>
        </div>
        {applications && applications.length > 0 && (
          <button
            onClick={() => exportToCSV(applications)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        )}
      </motion.div>

      {/* Urgency banner */}
      {nearestDeadline && nearestDeadline.daysLeft !== null && nearestDeadline.daysLeft <= 30 && (
        <motion.div
          initial="hidden" animate="visible" variants={FADE_UP} custom={0.5}
          className={cn(
            'rounded-xl p-4 border flex items-center gap-4',
            nearestDeadline.urgency === 'urgent'
              ? 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200'
              : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
          )}
        >
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            nearestDeadline.urgency === 'urgent' ? 'bg-rose-100' : 'bg-amber-100',
          )}>
            <Timer className={cn('w-6 h-6', nearestDeadline.urgency === 'urgent' ? 'text-rose-600' : 'text-amber-600')} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-bold',
              nearestDeadline.urgency === 'urgent' ? 'text-rose-800' : 'text-amber-800',
            )}>
              {nearestDeadline.daysLeft === 0 ? '⚠️ Deadline is TODAY!' : `${nearestDeadline.daysLeft} day${nearestDeadline.daysLeft === 1 ? '' : 's'} until next deadline`}
            </p>
            <p className={cn('text-xs mt-0.5', nearestDeadline.urgency === 'urgent' ? 'text-rose-700' : 'text-amber-700')}>
              {nearestDeadline.course.name} — {nearestDeadline.text}
            </p>
          </div>
          <Link href="/applications" className={cn(
            'text-xs font-medium flex items-center gap-1 flex-shrink-0',
            nearestDeadline.urgency === 'urgent' ? 'text-rose-600 hover:text-rose-800' : 'text-amber-600 hover:text-amber-800',
          )}>
            View <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            variants={FADE_UP} initial="hidden" animate="visible" custom={i + 1}
            className={cn(
              'bg-card rounded-xl p-4 border shadow-card',
              card.urgent && card.value > 0 && 'border-rose-200 bg-rose-50/50',
            )}
          >
            {isLoading ? (
              <Skeleton className="w-full h-16" />
            ) : (
              <>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', card.bg)}>
                  <card.icon className={cn('w-4.5 h-4.5', card.color)} />
                </div>
                <p className="text-2xl font-bold text-foreground leading-none">
                  {card.isText ? (
                    <span className="text-lg">{card.value}</span>
                  ) : card.value}
                </p>
                <p className="text-xs font-medium text-foreground mt-1">{card.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{card.sub}</p>
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
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : actionNeeded.length === 0 ? (
            <div className="empty-state bg-card border rounded-xl">
              <div className="empty-state-icon">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No applications need immediate attention.</p>
            </div>
          ) : (
            actionNeeded.slice(0, 5).map((app, i) => {
              const deadline = formatDeadline(app.course.deadline);
              return (
                <motion.div
                  key={app.id}
                  variants={FADE_UP} initial="hidden" animate="visible" custom={i}
                  whileHover={{ y: -1 }}
                >
                  <Link href={`/applications/${app.id}`}>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-card-hover transition-all group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <UniversityLogo
                          url={app.course.university.logoUrl}
                          name={app.course.university.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate group-hover:text-indigo-600 transition-colors">
                                {app.course.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {app.course.university.name}
                              </p>
                            </div>
                            <StatusBadge status={app.status} size="sm" />
                          </div>

                          {app.course.deadline && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className={cn(
                                'text-xs',
                                deadline.urgency === 'urgent' && 'text-rose-600 font-semibold',
                                deadline.urgency === 'soon'   && 'text-amber-600 font-medium',
                                deadline.urgency === 'ok'     && 'text-emerald-600',
                                deadline.urgency === 'passed' && 'text-slate-400',
                              )}>
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
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                Application Distribution
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
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
                          strokeWidth="3"
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
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground leading-none">{stats.total}</p>
                      <p className="text-[9px] text-muted-foreground">total</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {chartSegments.map((seg) => {
                    const cfg = STATUS_CONFIG[seg.status];
                    return (
                      <div key={seg.status} className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                        <span className="text-[11px] text-muted-foreground flex-1 truncate">{cfg.label}</span>
                        <span className="text-[11px] font-semibold text-foreground">{seg.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Status breakdown bars */}
          <div className="bg-card border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Status Breakdown
            </h3>
            {isLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <div className="space-y-2.5">
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
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                      <span className="text-xs text-muted-foreground flex-1 truncate">{cfg.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', cfg.dot)}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground w-5 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-card border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Upcoming Deadlines
            </h3>
            {isLoading ? (
              <Skeleton className="h-24" />
            ) : !stats?.upcomingDeadlines?.length ? (
              <p className="text-xs text-muted-foreground text-center py-4">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2.5">
                {stats.upcomingDeadlines.slice(0, 4).map((course) => {
                  const dl = formatDeadline(course.deadline);
                  return (
                    <div key={course.id} className="flex items-center gap-2.5">
                      <div className={cn(
                        'w-1.5 h-8 rounded-full flex-shrink-0',
                        dl.urgency === 'urgent' ? 'bg-rose-500' :
                        dl.urgency === 'soon'   ? 'bg-amber-500' : 'bg-emerald-500',
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{course.name}</p>
                        <p className={cn(
                          'text-[11px]',
                          dl.urgency === 'urgent' ? 'text-rose-600 font-semibold' :
                          dl.urgency === 'soon'   ? 'text-amber-600' : 'text-muted-foreground',
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Recent Applications</h3>
          <Link href="/applications" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            : recent.map((app, i) => (
              <motion.div key={app.id} variants={FADE_UP} initial="hidden" animate="visible" custom={i} whileHover={{ y: -2 }}>
                <Link href={`/applications/${app.id}`}>
                  <div className="bg-card border rounded-xl p-4 hover:shadow-card-hover transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <UniversityLogo
                        url={app.course.university.logoUrl}
                        name={app.course.university.name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-indigo-600 transition-colors">
                          {app.course.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {app.course.university.name} · {app.course.degree ?? 'Masters'}
                        </p>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={app.status} />
                          {app.course.deadline && (() => {
                            const dl = formatDeadline(app.course.deadline);
                            if (dl.daysLeft !== null && dl.daysLeft >= 0 && dl.daysLeft <= 30) {
                              return (
                                <span className={cn(
                                  'text-[10px] font-medium',
                                  dl.urgency === 'urgent' ? 'text-rose-600' : 'text-amber-600',
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
