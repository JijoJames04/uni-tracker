'use client';

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { profileApi } from '@/lib/api';
import { toast } from 'sonner';
import { User, GraduationCap, Globe, Briefcase, Save, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  currentAddress: z.string().optional(),
  bachelorDegree: z.string().optional(),
  bachelorUniversity: z.string().optional(),
  bachelorGrade: z.coerce.number().optional().nullable(),
  bachelorYear: z.coerce.number().optional().nullable(),
  masterDegree: z.string().optional(),
  masterUniversity: z.string().optional(),
  masterGrade: z.coerce.number().optional().nullable(),
  masterYear: z.coerce.number().optional().nullable(),
  ieltsScore: z.coerce.number().min(0).max(9).optional().nullable(),
  toeflScore: z.coerce.number().min(0).max(120).optional().nullable(),
  testDafScore: z.coerce.number().min(0).max(20).optional().nullable(),
  goetheLevel: z.string().optional(),
  germanLevel: z.string().optional(),
  greVerbal: z.coerce.number().optional().nullable(),
  greQuant: z.coerce.number().optional().nullable(),
  greAnalytical: z.coerce.number().optional().nullable(),
  gmatScore: z.coerce.number().optional().nullable(),
  workExperience: z.string().optional(),
  skills: z.string().optional(),
  researchInterests: z.string().optional(),
  publications: z.string().optional(),
  targetDegree: z.string().optional(),
  targetField: z.string().optional(),
  targetSemester: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const FADE = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

export function ProfileView() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    if (profile) {
      reset({
        ...profile,
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills ?? ''),
      });
    }
  }, [profile, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      profileApi.save({
        ...values,
        skills: values.skills ? values.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        bachelorGrade: values.bachelorGrade ?? undefined,
        bachelorYear: values.bachelorYear ?? undefined,
        masterGrade: values.masterGrade ?? undefined,
        masterYear: values.masterYear ?? undefined,
        ieltsScore: values.ieltsScore ?? undefined,
        toeflScore: values.toeflScore ?? undefined,
        testDafScore: values.testDafScore ?? undefined,
        greVerbal: values.greVerbal ?? undefined,
        greQuant: values.greQuant ?? undefined,
        greAnalytical: values.greAnalytical ?? undefined,
        gmatScore: values.gmatScore ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile saved! Your SOP prompts will now be personalised.');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const SECTIONS = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: User,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      fields: [
        { name: 'firstName',      label: 'First Name',     placeholder: 'John',            half: true  },
        { name: 'lastName',       label: 'Last Name',      placeholder: 'Doe',             half: true  },
        { name: 'email',          label: 'Email Address',  placeholder: 'john@email.com',  half: true  },
        { name: 'phone',          label: 'Phone Number',   placeholder: '+91 98765 43210', half: true  },
        { name: 'nationality',    label: 'Nationality',    placeholder: 'Indian',          half: true  },
        { name: 'currentAddress', label: 'Current Address',placeholder: 'City, Country',   half: true  },
      ],
    },
    {
      id: 'academic',
      title: 'Academic Background',
      icon: GraduationCap,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      fields: [
        { name: 'bachelorDegree',      label: "Bachelor's Degree",        placeholder: 'B.Tech Computer Science',  half: true  },
        { name: 'bachelorUniversity',  label: "Bachelor's University",     placeholder: 'Anna University',         half: true  },
        { name: 'bachelorGrade',       label: 'GPA / CGPA / Grade',       placeholder: '8.5 / 10',               half: true, type: 'number' },
        { name: 'bachelorYear',        label: 'Graduation Year',          placeholder: '2023',                   half: true, type: 'number' },
        { name: 'masterDegree',        label: "Master's Degree (if any)", placeholder: 'M.Tech Data Science',    half: true  },
        { name: 'masterUniversity',    label: "Master's University",       placeholder: 'IIT Madras',             half: true  },
        { name: 'masterGrade',         label: "Master's GPA",             placeholder: '9.0 / 10',               half: true, type: 'number' },
        { name: 'masterYear',          label: "Master's Year",            placeholder: '2025',                   half: true, type: 'number' },
      ],
    },
    {
      id: 'language',
      title: 'Language Scores',
      icon: Globe,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      fields: [
        { name: 'ieltsScore',    label: 'IELTS Overall Band', placeholder: '7.5', half: true, type: 'number' },
        { name: 'toeflScore',    label: 'TOEFL Score',        placeholder: '110', half: true, type: 'number' },
        { name: 'testDafScore',  label: 'TestDaF Score',      placeholder: '17',  half: true, type: 'number' },
        { name: 'goetheLevel',   label: 'Goethe Certificate', placeholder: 'B2',  half: true  },
        { name: 'germanLevel',   label: 'German Proficiency', placeholder: 'B2 (Goethe / TestDaF)', half: true },
        { name: 'greVerbal',     label: 'GRE Verbal',         placeholder: '158', half: true, type: 'number' },
        { name: 'greQuant',      label: 'GRE Quant',          placeholder: '165', half: true, type: 'number' },
        { name: 'gmatScore',     label: 'GMAT Score',         placeholder: '700', half: true, type: 'number' },
      ],
    },
    {
      id: 'experience',
      title: 'Experience & Goals',
      icon: Briefcase,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      fields: [
        { name: 'targetDegree',   label: 'Target Degree',     placeholder: 'M.Sc. / M.Eng. / MBA',          half: true  },
        { name: 'targetField',    label: 'Target Field',      placeholder: 'Computer Science, AI, Finance…', half: true  },
        { name: 'targetSemester', label: 'Target Semester',   placeholder: 'Winter Semester 2025/26',        half: true  },
      ],
      textAreas: [
        { name: 'workExperience',    label: 'Work Experience',     placeholder: 'List your relevant internships, jobs, and research experience. Include company name, role, duration and key responsibilities.', rows: 4 },
        { name: 'skills',            label: 'Technical Skills (comma separated)', placeholder: 'Python, Machine Learning, Data Analysis, TensorFlow, SQL…', rows: 2 },
        { name: 'researchInterests', label: 'Research Interests',  placeholder: 'Describe your academic research interests and any projects you have worked on.', rows: 3 },
        { name: 'publications',      label: 'Publications / Projects', placeholder: 'List any research publications, conference papers, or significant projects.', rows: 3 },
      ],
    },
  ] as const;

  // Compute profile completeness
  const completeness = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      profile.firstName, profile.lastName, profile.email, profile.phone,
      profile.nationality, profile.currentAddress, profile.bachelorDegree,
      profile.bachelorUniversity, profile.bachelorGrade, profile.bachelorYear,
      profile.ieltsScore || profile.toeflScore || profile.testDafScore,
      profile.workExperience, profile.targetDegree, profile.targetField,
      profile.skills?.length ? 'yes' : '',
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  return (
    <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5 max-w-3xl">
      {/* Profile completeness */}
      <motion.div initial="hidden" animate="visible" variants={FADE} custom={0}
        className="bg-card border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              completeness >= 80 ? 'bg-emerald-50' : completeness >= 50 ? 'bg-amber-50' : 'bg-rose-50',
            )}>
              <span className="text-sm">{completeness >= 80 ? '🎉' : completeness >= 50 ? '📝' : '🚀'}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Profile Completeness</p>
              <p className="text-[11px] text-muted-foreground">
                {completeness >= 80
                  ? 'Great! Your profile is well-filled for SOP generation.'
                  : completeness >= 50
                    ? 'Getting there — fill more for better SOP prompts.'
                    : 'Complete your profile for personalized SOP prompts.'}
              </p>
            </div>
          </div>
          <span className={cn(
            'text-lg font-bold',
            completeness >= 80 ? 'text-emerald-600' : completeness >= 50 ? 'text-amber-600' : 'text-rose-600',
          )}>
            {completeness}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completeness}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              completeness >= 80 ? 'bg-emerald-500' : completeness >= 50 ? 'bg-amber-500' : 'bg-rose-500',
            )}
          />
        </div>
      </motion.div>

      {/* Banner */}
      <motion.div initial="hidden" animate="visible" variants={FADE} custom={0.5}
        className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
        <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-indigo-800">Complete your profile for better SOP prompts</p>
          <p className="text-xs text-indigo-700 mt-0.5">
            Your profile details are used to generate personalised SOP prompts for each application. The more complete your profile, the better the generated prompts.
          </p>
        </div>
      </motion.div>

      {SECTIONS.map((section, si) => (
        <motion.div
          key={section.id}
          variants={FADE} initial="hidden" animate="visible" custom={si + 1}
          className="bg-card border rounded-2xl overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', section.bg)}>
              <section.icon className={cn('w-4 h-4', section.color)} />
            </div>
            <h2 className="font-semibold text-foreground">{section.title}</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Input grid */}
            {'fields' in section && section.fields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.fields.map((field) => (
                  <FormField key={field.name} label={field.label}>
                    <input
                      {...register(field.name as keyof FormValues)}
                      type={('type' in field ? field.type : 'text') || 'text'}
                      placeholder={field.placeholder}
                      step={('type' in field && field.type === 'number') ? '0.01' : undefined}
                      className={inputCls}
                    />
                  </FormField>
                ))}
              </div>
            )}

            {/* TextAreas */}
            {'textAreas' in section && section.textAreas?.map((ta) => (
              <FormField key={ta.name} label={ta.label}>
                <textarea
                  {...register(ta.name as keyof FormValues)}
                  placeholder={ta.placeholder}
                  rows={ta.rows}
                  className={cn(inputCls, 'resize-none')}
                />
              </FormField>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Save button */}
      <motion.div variants={FADE} initial="hidden" animate="visible" custom={5}
        className="flex items-center justify-end gap-3 py-2">
        {isDirty && (
          <span className="text-xs text-amber-600 font-medium">You have unsaved changes</span>
        )}
        <button
          type="submit"
          disabled={saveMutation.isPending || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
        >
          {saveMutation.isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            : <><Save className="w-4 h-4" /> Save Profile</>
          }
        </button>
      </motion.div>
    </form>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all';

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
