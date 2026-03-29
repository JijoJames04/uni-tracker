'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { universityApi, scraperApi } from '@/lib/api';
import type { ScrapedData } from '@/lib/api';
import {
  Loader2, X, Wand2, Globe, Building2,
  BookOpen, Clock, DollarSign, Calendar, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn, formatFees, VIA_CONFIG } from '@/lib/utils';

const schema = z.object({
  universityName: z.string().min(1, 'Required'),
  courseName:     z.string().min(1, 'Required'),
  degree:         z.string().optional(),
  language:       z.string().optional(),
  duration:       z.string().optional(),
  fees:           z.number().optional().nullable(),
  deadline:       z.string().optional(),
  applicationUrl: z.string().optional(),
  description:    z.string().optional(),
  applicationVia: z.enum(['DIRECT', 'UNI_ASSIST', 'BOTH']).default('DIRECT'),
  uniAssistInfo:  z.string().optional(),
  requirements:   z.string().optional(),
  ects:           z.number().optional().nullable(),
  city:           z.string().optional(),
  address:        z.string().optional(),
  logoUrl:        z.string().optional().nullable(),
  sourceUrl:      z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddApplicationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [scraped, setScraped] = useState<ScrapedData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const scrapeMutation = useMutation({
    mutationFn: scraperApi.scrape,
    onSuccess: (data) => {
      setScraped(data);
      // Populate form
      setValue('universityName', data.universityName);
      setValue('courseName',     data.courseName);
      setValue('degree',         data.degree);
      setValue('language',       data.language);
      setValue('duration',       data.duration);
      setValue('fees',           data.fees);
      setValue('deadline',       data.deadline ?? '');
      setValue('applicationUrl', data.applicationUrl);
      setValue('description',    data.description);
      setValue('applicationVia', data.applicationVia);
      setValue('uniAssistInfo',  data.uniAssistInfo);
      setValue('requirements',   data.requirements);
      setValue('ects',           data.ects);
      setValue('city',           data.city);
      setValue('address',        data.address);
      setValue('logoUrl',        data.logoUrl);
      setValue('sourceUrl',      data.sourceUrl);
      setShowDetails(true);
      toast.success('University data extracted successfully!');
    },
    onError: (err: Error) => toast.error(`Failed to parse URL: ${err.message}`),
  });

  const addMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: async (_values: FormValues) => {
      if (scraped) {
        return universityApi.addFromUrl(url || scraped.sourceUrl);
      }
      return universityApi.addFromUrl(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast.success('Application added successfully!');
      handleClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const manualMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Find or create university, then course
      const uni = await fetch('/api/v1/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.universityName,
          logoUrl: values.logoUrl,
          city: values.city,
          address: values.address,
          website: values.applicationUrl,
        }),
      }).then((r) => r.json());

      return fetch('/api/v1/universities/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId: uni.id,
          name: values.courseName,
          degree: values.degree,
          language: values.language,
          duration: values.duration,
          fees: values.fees,
          deadline: values.deadline,
          applicationUrl: values.applicationUrl,
          sourceUrl: values.sourceUrl,
          description: values.description,
          applicationVia: values.applicationVia,
          uniAssistInfo: values.uniAssistInfo,
          requirements: values.requirements,
          ects: values.ects,
        }),
      }).then((r) => r.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast.success('Application added!');
      handleClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleClose() {
    setUrl('');
    setScraped(null);
    setShowDetails(false);
    reset();
    onClose();
  }

  const applicationVia = watch('applicationVia');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[640px] z-50 bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-base font-bold text-foreground">Add New Application</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paste a course URL to auto-fill, or enter details manually
                </p>
              </div>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* URL Parser */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                  Auto-fill from URL
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 rounded px-1.5 py-0.5 font-medium">Recommended</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.tum.de/en/studies/degree-programs/..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && url && scrapeMutation.mutate(url)}
                    />
                  </div>
                  <button
                    onClick={() => url && scrapeMutation.mutate(url)}
                    disabled={!url || scrapeMutation.isPending}
                    className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {scrapeMutation.isPending ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Parsing...</>
                    ) : (
                      <><Wand2 className="w-3.5 h-3.5" /> Parse URL</>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Paste the course page URL from any German university. We&apos;ll extract the course name, fees, deadline, and more automatically.
                </p>
              </div>

              {/* Parsed preview */}
              <AnimatePresence>
                {scraped && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border bg-emerald-50/50 border-emerald-200 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-emerald-800">Data extracted successfully</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                      <PreviewRow icon={<Building2 className="w-3.5 h-3.5" />} label="University" value={scraped.universityName} />
                      <PreviewRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Course" value={scraped.courseName} />
                      <PreviewRow icon={<Clock className="w-3.5 h-3.5" />} label="Duration" value={scraped.duration || '—'} />
                      <PreviewRow icon={<DollarSign className="w-3.5 h-3.5" />} label="Fees" value={formatFees(scraped.fees)} />
                      <PreviewRow icon={<Calendar className="w-3.5 h-3.5" />} label="Deadline" value={scraped.deadline || '—'} />
                      <PreviewRow icon={<Globe className="w-3.5 h-3.5" />} label="Apply via" value={VIA_CONFIG[scraped.applicationVia].label} />
                    </div>

                    {scraped.applicationVia !== 'DIRECT' && scraped.uniAssistInfo && (
                      <div className="px-4 pb-3">
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-700">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span>{scraped.uniAssistInfo}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or fill manually</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Manual form */}
              <form onSubmit={handleSubmit((v) => {
                if (scraped) addMutation.mutate(v);
                else manualMutation.mutate(v);
              })} className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="University Name *" error={errors.universityName?.message}>
                    <input {...register('universityName')} placeholder="Technical University of Munich" className={inputCls} />
                  </FormField>
                  <FormField label="Course / Program Name *" error={errors.courseName?.message}>
                    <input {...register('courseName')} placeholder="M.Sc. Computer Science" className={inputCls} />
                  </FormField>
                  <FormField label="Degree">
                    <input {...register('degree')} placeholder="M.Sc., M.A., MBA..." className={inputCls} />
                  </FormField>
                  <FormField label="Language of Instruction">
                    <input {...register('language')} placeholder="English / German" className={inputCls} />
                  </FormField>
                  <FormField label="Duration">
                    <input {...register('duration')} placeholder="2 years / 4 semesters" className={inputCls} />
                  </FormField>
                  <FormField label="Tuition Fees (€/year)">
                    <input {...register('fees', { valueAsNumber: true })} type="number" placeholder="0" className={inputCls} />
                  </FormField>
                  <FormField label="Application Deadline">
                    <input {...register('deadline')} type="date" className={inputCls} />
                  </FormField>
                  <FormField label="ECTS Credits">
                    <input {...register('ects', { valueAsNumber: true })} type="number" placeholder="120" className={inputCls} />
                  </FormField>
                </div>

                {/* Application via */}
                <FormField label="Application Via">
                  <div className="grid grid-cols-3 gap-2">
                    {(['DIRECT', 'UNI_ASSIST', 'BOTH'] as const).map((via) => (
                      <label key={via} className={cn(
                        'flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all',
                        applicationVia === via
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-border hover:border-indigo-300 hover:bg-muted',
                      )}>
                        <input type="radio" {...register('applicationVia')} value={via} className="sr-only" />
                        {via === 'DIRECT' ? '🔗' : via === 'UNI_ASSIST' ? '🎓' : '↕️'}
                        {via === 'DIRECT' ? 'Direct' : via === 'UNI_ASSIST' ? 'uni-assist' : 'Both'}
                      </label>
                    ))}
                  </div>
                </FormField>

                <FormField label="Course URL (source)">
                  <input {...register('sourceUrl')} placeholder="https://..." className={inputCls} />
                </FormField>

                {/* Toggle advanced */}
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showDetails ? 'Hide' : 'Show'} additional details
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="City">
                          <input {...register('city')} placeholder="Munich" className={inputCls} />
                        </FormField>
                        <FormField label="University Logo URL">
                          <input {...register('logoUrl')} placeholder="https://..." className={inputCls} />
                        </FormField>
                      </div>
                      <FormField label="Description">
                        <textarea {...register('description')} rows={2} placeholder="Brief description of the program..." className={cn(inputCls, 'resize-none')} />
                      </FormField>
                      <FormField label="uni-assist Info">
                        <textarea {...register('uniAssistInfo')} rows={2} placeholder="uni-assist application details..." className={cn(inputCls, 'resize-none')} />
                      </FormField>
                      <FormField label="Admission Requirements">
                        <textarea {...register('requirements')} rows={2} placeholder="Required qualifications..." className={cn(inputCls, 'resize-none')} />
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-lg border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMutation.isPending || manualMutation.isPending}
                    className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {(addMutation.isPending || manualMutation.isPending) ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</>
                    ) : (
                      'Add Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all';

function FormField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

function PreviewRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-emerald-600 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xs text-emerald-900 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
