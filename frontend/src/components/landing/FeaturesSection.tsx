'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap, FileText, Calendar,
  BarChart3, FolderOpen, Globe2, Shield,
  Sparkles, Navigation, Bot, Euro, Search,
} from 'lucide-react';

const FEATURES = [
  {
    icon: GraduationCap,
    title: 'Application Tracker',
    description: 'Track every application — status, priority, progress pipeline, notes, and deadlines — across all German universities in a single organized view.',
    gradient: 'from-indigo-500 to-blue-600',
    bgGlow: 'bg-indigo-500/5',
    borderHover: 'hover:border-indigo-500/30',
    tag: 'Core',
  },
  {
    icon: Bot,
    title: 'AI Prompt Generator',
    description: 'Generate tailored SOP, LOR and inquiry emails using your exact application details. One-click copy into ChatGPT, Claude or Gemini.',
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'bg-violet-500/5',
    borderHover: 'hover:border-violet-500/30',
    tag: 'AI',
  },
  {
    icon: Calendar,
    title: 'Deadline Calendar',
    description: 'Visual calendar with countdown timers and urgency highlighting. Never miss an application deadline again with smart alerts.',
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/5',
    borderHover: 'hover:border-emerald-500/30',
    tag: 'Planner',
  },
  {
    icon: Shield,
    title: 'APS & Visa Guide',
    description: 'Complete step-by-step APS document checklist for all countries and an 8-step student visa guide with visual progress tracking.',
    gradient: 'from-rose-500 to-pink-600',
    bgGlow: 'bg-rose-500/5',
    borderHover: 'hover:border-rose-500/30',
    tag: 'Visa',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    description: 'Upload, organize and track every document — SOP, CV, transcripts, LORs, APS certificates. Complete checklist with bulk ZIP download.',
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/5',
    borderHover: 'hover:border-amber-500/30',
    tag: 'Docs',
  },
  {
    icon: Euro,
    title: 'Blocked Account Calculator',
    description: 'Calculate the exact blocked account amount for your visa, with live exchange rate graphs and country-specific adjustments.',
    gradient: 'from-cyan-500 to-blue-600',
    bgGlow: 'bg-cyan-500/5',
    borderHover: 'hover:border-cyan-500/30',
    tag: 'Finance',
  },
  {
    icon: Navigation,
    title: 'DHL Facility Finder',
    description: 'Find the nearest DHL Express facility for document dispatch using your GPS location. Essential for sending certified documents abroad.',
    gradient: 'from-yellow-500 to-amber-600',
    bgGlow: 'bg-yellow-500/5',
    borderHover: 'hover:border-yellow-500/30',
    tag: 'Logistics',
  },
  {
    icon: Search,
    title: 'Web Scraper',
    description: 'Paste any German university course URL to auto-import program details — fees, deadlines, requirements, and more. No manual entry.',
    gradient: 'from-lime-500 to-emerald-600',
    bgGlow: 'bg-lime-500/5',
    borderHover: 'hover:border-lime-500/30',
    tag: 'Smart',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Visual donut charts, status breakdowns, upcoming deadline boards, action-required lists, and CSV export for the full picture.',
    gradient: 'from-sky-500 to-indigo-600',
    bgGlow: 'bg-sky-500/5',
    borderHover: 'hover:border-sky-500/30',
    tag: 'Stats',
  },
  {
    icon: FolderOpen,
    title: 'Resource Hub',
    description: 'Dormitory finder, APS guide, visa tips, exchange rate tools, and DAAD / MyGermanUniversity links — all accessible in one place.',
    gradient: 'from-fuchsia-500 to-violet-600',
    bgGlow: 'bg-fuchsia-500/5',
    borderHover: 'hover:border-fuchsia-500/30',
    tag: 'Resources',
  },
  {
    icon: Globe2,
    title: 'Cloud Sync or Offline',
    description: 'Sign in with Google to sync your data across devices seamlessly. Or use it fully offline — all stored locally on your browser.',
    gradient: 'from-slate-500 to-gray-600',
    bgGlow: 'bg-slate-500/5',
    borderHover: 'hover:border-slate-500/30',
    tag: 'Sync',
  },
  {
    icon: Sparkles,
    title: 'Status Progress Pipeline',
    description: 'Each application has a visual milestone pipeline from Draft → SOP Writing → Docs Ready → Submitted → Approved, with live indicators.',
    gradient: 'from-teal-500 to-cyan-600',
    bgGlow: 'bg-teal-500/5',
    borderHover: 'hover:border-teal-500/30',
    tag: 'Tracking',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function FeaturesSection() {
  return (
    <section className="relative py-28 px-4 overflow-hidden" id="features" aria-label="Features">
      <div className="absolute inset-0 bg-[#0A0F1F] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(99,102,241,0.04),transparent_60%)] -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-400 mb-4 block">Everything You Need</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            12 tools. One platform.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Zero cost.
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            From discovering programs to landing your visa — UniTracker replaces 12 different spreadsheets, apps, and browser tabs with one beautiful, purposeful platform.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`group relative p-6 rounded-2xl bg-[#111827]/80 border border-white/[0.06] ${f.borderHover} transition-all duration-300 overflow-hidden cursor-default`}
            >
              {/* Hover bg glow */}
              <div className={`absolute inset-0 rounded-2xl ${f.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Tag */}
              <span className="absolute top-4 right-4 text-[10px] font-bold text-slate-600 tracking-wider uppercase">{f.tag}</span>

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.gradient} mb-5 relative shadow-lg`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-sm font-bold text-white mb-2 relative">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed relative">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
