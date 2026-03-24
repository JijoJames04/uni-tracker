'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths,
} from 'date-fns';
import { calendarApi, applicationApi } from '@/lib/api';
import type { CalendarEvent } from '@/lib/api';

type EventType = 'DEADLINE' | 'INTERVIEW' | 'PAYMENT' | 'REMINDER' | 'MILESTONE';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Loader2 } from 'lucide-react';
import { cn, formatDeadline } from '@/lib/utils';
import { toast } from 'sonner';

const EVENT_COLORS: Record<string, string> = {
  DEADLINE:  'bg-rose-500',
  INTERVIEW: 'bg-violet-500',
  PAYMENT:   'bg-amber-500',
  REMINDER:  'bg-blue-500',
  MILESTONE: 'bg-emerald-500',
};

export function CalendarView() {
  const [currentDate, setCurrentDate]     = useState(new Date());
  const [selectedDay, setSelectedDay]     = useState<Date | null>(null);
  const [showAdd, setShowAdd]             = useState(false);
  const [newEvent, setNewEvent]           = useState<{ title: string; type: EventType; description: string }>({ title: '', type: 'REMINDER', description: '' });
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar'],
    queryFn: calendarApi.getEvents,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationApi.getAll,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      calendarApi.createEvent({
        ...newEvent,
        date: selectedDay!.toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Event added!');
      setShowAdd(false);
      setNewEvent({ title: '', type: 'REMINDER', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Event deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd    = endOfWeek(monthEnd,   { weekStartsOn: 1 });
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() =>
    applications
      .filter((a) => a.course.deadline && !['APPROVED', 'REJECTED'].includes(a.status))
      .map((a) => ({ ...a, dl: formatDeadline(a.course.deadline) }))
      .filter((a) => a.dl.daysLeft !== null && a.dl.daysLeft >= 0)
      .sort((a, b) => (a.dl.daysLeft ?? 0) - (b.dl.daysLeft ?? 0))
      .slice(0, 5),
  [applications]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Calendar */}
        <div className="xl:col-span-3 bg-card border rounded-2xl p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <motion.h2 key={format(currentDate, 'MMM yyyy')}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="text-base font-bold text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </motion.h2>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1.5">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const hasDeadline = dayEvents.some((e) => e.isDeadline);

              return (
                <motion.button
                  key={day.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={cn(
                    'relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 px-1 text-xs transition-all',
                    !isCurrentMonth && 'opacity-30',
                    isSelected && 'bg-indigo-600 text-white shadow-md',
                    isToday(day) && !isSelected && 'bg-indigo-50 text-indigo-700 font-bold ring-1 ring-indigo-200',
                    !isSelected && isCurrentMonth && 'hover:bg-muted',
                    hasDeadline && !isSelected && 'bg-rose-50',
                  )}
                >
                  <span className={cn('font-medium text-[12px] leading-none', isToday(day) && !isSelected && 'text-indigo-700')}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((ev, i) => (
                        <span
                          key={i}
                          className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white' : EVENT_COLORS[ev.type] || 'bg-blue-500')}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 border-t pt-3">
            {Object.entries(EVENT_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full', color)} />
                <span className="text-[11px] text-muted-foreground capitalize">{type.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Upcoming deadlines */}
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Upcoming Deadlines
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No upcoming deadlines 🎉</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((app) => (
                  <div key={app.id} className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-1.5 rounded-full flex-shrink-0 self-stretch',
                      (app.dl.daysLeft ?? 0) <= 14 ? 'bg-rose-500' :
                      (app.dl.daysLeft ?? 0) <= 45 ? 'bg-amber-500' : 'bg-emerald-500',
                    )} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{app.course.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{app.course.university.name}</p>
                      <p className={cn(
                        'text-[11px] font-medium',
                        (app.dl.daysLeft ?? 0) <= 14 ? 'text-rose-600' :
                        (app.dl.daysLeft ?? 0) <= 45 ? 'text-amber-600' : 'text-emerald-600',
                      )}>
                        {app.dl.daysLeft === 0 ? '⚠️ Today!' : `${app.dl.daysLeft}d left`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected day events */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="bg-card border rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-sm">
                    {format(selectedDay, 'MMMM d, yyyy')}
                  </h3>
                  <button onClick={() => setShowAdd(true)}
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {selectedEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No events. Click + to add one.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map((ev) => (
                      <div key={ev.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 group/event">
                        <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', EVENT_COLORS[ev.type] || 'bg-blue-500')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{ev.title}</p>
                          {ev.description && <p className="text-[11px] text-muted-foreground">{ev.description}</p>}
                          {ev.daysLeft !== undefined && ev.daysLeft !== null && (
                            <p className={cn('text-[11px] font-medium mt-0.5', ev.daysLeft <= 14 ? 'text-rose-600' : 'text-muted-foreground')}>
                              {ev.daysLeft > 0 ? `${ev.daysLeft} days left` : ev.daysLeft === 0 ? 'Today!' : 'Passed'}
                            </p>
                          )}
                          {ev.university && <p className="text-[10px] text-muted-foreground">{ev.university}</p>}
                        </div>
                        {!ev.isDeadline && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this event?')) deleteMutation.mutate(ev.id);
                            }}
                            className="opacity-0 group-hover/event:opacity-100 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-rose-500 transition-all flex-shrink-0"
                            title="Delete event"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add event inline */}
                <AnimatePresence>
                  {showAdd && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t space-y-2.5"
                    >
                      <input
                        value={newEvent.title}
                        onChange={(e) => setNewEvent((n) => ({ ...n, title: e.target.value }))}
                        placeholder="Event title..."
                        className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                      />
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent((n) => ({ ...n, type: e.target.value as EventType }))}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer"
                      >
                        {['DEADLINE', 'INTERVIEW', 'PAYMENT', 'REMINDER', 'MILESTONE'].map((t) => (
                          <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 rounded-lg border text-xs font-medium text-muted-foreground hover:bg-muted transition-all">
                          Cancel
                        </button>
                        <button
                          onClick={() => newEvent.title && addMutation.mutate()}
                          disabled={!newEvent.title || addMutation.isPending}
                          className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {addMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
