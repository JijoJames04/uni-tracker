'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { universityApi } from '@/lib/api';
import { Search, GraduationCap, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatDeadline, formatFees } from '@/lib/utils';
import { UniversityLogo } from '@/components/shared/UniversityLogo';
import { StatusBadge, ViaBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/shared/Skeleton';
import UniversityLinks from '@/components/shared/UniversityLinks';

export function UniversitiesView() {
  const [search, setSearch]   = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: universityApi.getAll,
  });

  const filtered = universities.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase()),
  );

  const FADE = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search universities..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state bg-card border rounded-2xl">
          <div className="empty-state-icon"><GraduationCap className="w-6 h-6 text-muted-foreground" /></div>
          <p className="text-sm font-medium">{search ? 'No universities found' : 'No universities yet'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your first application to see universities here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((uni, i) => (
            <motion.div key={uni.id} variants={FADE} initial="hidden" animate="visible" custom={i}
              className="bg-card border rounded-2xl overflow-hidden">
              {/* University header */}
              <button
                onClick={() => setExpanded(expanded === uni.id ? null : uni.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
              >
                <UniversityLogo url={uni.logoUrl} name={uni.name} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm leading-snug">
                    {uni.shortName ? (
                      <>{uni.shortName} <span className="text-muted-foreground font-medium text-xs ml-1">({uni.name})</span></>
                    ) : uni.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {uni.city && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />{uni.city}, {uni.country}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {uni.courses.length} course{uni.courses.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {expanded === uni.id
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
              </button>

              {/* Courses */}
              {expanded === uni.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t"
                >
                  {uni.description && (
                    <p className="px-5 py-3 text-xs text-muted-foreground border-b bg-muted/20">
                      {uni.description}
                    </p>
                  )}
                  {(uni.website || uni.linkedinUrl || uni.instagramUrl) && (
                    <div className="px-5 py-4 border-b bg-muted/10">
                      <UniversityLinks 
                        website={uni.website || undefined}
                        linkedinUrl={uni.linkedinUrl || undefined}
                        instagramUrl={uni.instagramUrl || undefined}
                        universityName={uni.name}
                        showFinderLinks={false}
                      />
                    </div>
                  )}
                  <div className="divide-y">
                    {uni.courses.map((course) => {
                      const dl = formatDeadline(course.deadline);
                      const status = course.application?.status;
                      return (
                        <Link key={course.id} href={course.application ? `/applications/${course.application.id}` : '#'}>
                          <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors truncate">
                                  {course.name}
                                </p>
                                {course.degree && (
                                  <span className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground flex-shrink-0">
                                    {course.degree}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {course.language && <span className="text-[11px] text-muted-foreground">🌐 {course.language}</span>}
                                {course.duration && <span className="text-[11px] text-muted-foreground">⏱ {course.duration}</span>}
                                {course.fees != null && <span className="text-[11px] text-muted-foreground">💶 {formatFees(course.fees, course.currency)}</span>}
                                {course.deadline && (
                                  <span className={cn(
                                    'text-[11px] font-medium',
                                    dl.urgency === 'urgent' ? 'text-rose-600' :
                                    dl.urgency === 'soon'   ? 'text-amber-600' : 'text-muted-foreground',
                                  )}>
                                    📅 {dl.text}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <ViaBadge via={course.applicationVia} />
                              {status && <StatusBadge status={status} size="sm" />}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
