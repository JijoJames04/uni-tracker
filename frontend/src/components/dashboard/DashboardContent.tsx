'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { universityApi, applicationApi } from '@/lib/api';
import { formatFees, formatDeadline, STATUS_CONFIG, cn } from '@/lib/utils';
import {
  TrendingUp, CheckCircle2, XCircle, Clock, AlertCircle,
  Euro, GraduationCap, ArrowRight, Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UniversityLogo } from '@/components/shared/UniversityLogo';
import { Skeleton } from '@/components/shared/Skeleton';

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const } }),
};

export function DashboardContent() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: universityApi.getStats,
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationApi.getAll,
  });

  const isLoading = statsLoading || appsLoading;

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

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial="hidden" animate="visible" variants={FADE_UP} custom={0}>
        <h2 className="text-2xl font-bold text-foreground">Good morning 👋</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Here's an overview of your German university applications.
        </p>
      </motion.div>

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
          {/* Status breakdown */}
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
                        <StatusBadge status={app.status} />
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
