'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap, FileText, Calendar,
  BarChart3, FolderOpen, Globe2, Shield,
  Sparkles, Navigation,
} from 'lucide-react';

const FEATURES = [
  {
    icon: GraduationCap,
    title: 'University Tracker',
    description: 'Track all your German university applications with status, deadlines, and priority in one place.',
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'indigo',
  },
  {
    icon: FileText,
    title: 'Document Manager',
    description: 'Upload, organize and version-control all your application documents — SOPs, CVs, transcripts.',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'violet',
  },
  {
    icon: Calendar,
    title: 'Deadline Calendar',
    description: 'Never miss a deadline with visual calendar, countdown timers, and smart reminders.',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'emerald',
  },
  {
    icon: Sparkles,
    title: 'SOP Prompt Generator',
    description: 'Auto-generate tailored SOP, LOR and email prompts for each university using AI templates.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'amber',
  },
  {
    icon: Shield,
    title: 'APS & Visa Guide',
    description: 'Step-by-step APS document checklist and 8-step visa guide with progress tracking.',
    gradient: 'from-rose-500 to-pink-500',
    glow: 'rose',
  },
  {
    icon: Navigation,
    title: 'DHL Finder',
    description: 'Find DHL facilities near your current location for document dispatch — powered by GPS.',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'cyan',
  },
  {
    icon: Globe2,
    title: 'Cloud Sync',
    description: 'Sign in with Google to sync data across devices. Or use fully offline on your local PC.',
    gradient: 'from-fuchsia-500 to-violet-500',
    glow: 'fuchsia',
  },
  {
    icon: FolderOpen,
    title: 'Web Scraper',
    description: 'Paste a university course URL and auto-import all details — fees, deadlines, requirements.',
    gradient: 'from-lime-500 to-emerald-500',
    glow: 'lime',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    description: 'Visual donut charts, stats, deadline countdown, and CSV export for your application journey.',
    gradient: 'from-sky-500 to-indigo-500',
    glow: 'sky',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function FeaturesSection() {
  return (
    <section className="relative py-24 px-4" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-3 block">
            Everything you need
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            All-in-One Application Toolkit
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            From discovering programs to getting your visa — UniTracker has every tool
            built in so you can focus on what matters.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative p-6 rounded-2xl
                bg-zinc-900/60 border border-zinc-800
                hover:border-zinc-700 hover:bg-zinc-900/80
                transition-colors duration-300 overflow-hidden"
            >
              {/* Hover glow */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full
                bg-${f.glow}-500/0 group-hover:bg-${f.glow}-500/8
                blur-3xl transition-all duration-500`}
              />

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.gradient}
                bg-opacity-10 mb-4 relative`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>

              {/* Text */}
              <h3 className="text-base font-semibold text-zinc-100 mb-2 relative">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed relative">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
