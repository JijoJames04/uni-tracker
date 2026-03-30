'use client';

import { motion } from 'framer-motion';
import { 
  Target, Users, Heart, ShieldCheck, Sparkles, GraduationCap,
  BookOpen, FileCheck, Plane,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Target,
    title: 'Why UniTracker Exists',
    desc: 'German university applications are uniquely complex — juggling uni-assist limits, direct portals like TUMonline, APS appointments, blocked account setup, and visa paperwork simultaneously. Many students lose admission offers simply because they lose track. UniTracker was built to solve exactly this.',
    color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20',
  },
  {
    icon: Users,
    title: 'Who Benefits',
    desc: 'Every international student applying to study in Germany — from Indian and Nigerian students dealing with APS, to Nepalese or Pakistani students navigating blocked account requirements. Whether it\'s an English-taught Masters, German Bachelors, or Studienkolleg — this is built for you.',
    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
  },
  {
    icon: Heart,
    title: '100% Free — Always',
    desc: 'No premium plans. No credit card required. No artificial feature limits. UniTracker is free because we believe international students have already invested enough money in agency fees, language tests, and applications. You shouldn\'t have to pay for a tracker too.',
    color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy & Data Ownership',
    desc: 'Your application data belongs to you. Use it fully offline on your local machine, or sign in with Google for seamless cross-device sync. No ads, no data selling, no surveillance. Just a clean, fast, and modern experience that respects your privacy.',
    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
  },
];

const JOURNEY_STEPS = [
  { icon: BookOpen, label: 'Research Universities', desc: 'Find programs via DAAD and MyGermanUniversity' },
  { icon: FileCheck, label: 'Track Applications', desc: 'Manage deadlines, docs, SOPs, and LORs' },
  { icon: GraduationCap, label: 'Get Admission', desc: 'Follow the APS checklist and visa guide' },
  { icon: Plane, label: 'Move to Germany', desc: 'Use blocked account calculator & DHL finder' },
];

export default function WhySection() {
  return (
    <section className="py-28 relative overflow-hidden" id="why-unitracker" aria-label="Why UniTracker">
      {/* Divider top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      
      {/* Background */}
      <div className="absolute inset-0 bg-[#08101E] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgba(99,102,241,0.05),transparent_60%)] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span className="tracking-wide uppercase">The Mission</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6"
          >
            Designed for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              complete journey
            </span>
            .
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-400 leading-relaxed"
          >
            Admission agencies charge thousands. DAAD and universities only provide basic info. 
            We fill the gap — with a <strong className="text-slate-200">free, intelligent, end-to-end platform</strong> that has every tool 
            you need from research to visa, in one place.
          </motion.p>
        </div>

        {/* Journey timeline */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-0 mb-20 relative">
          <div className="hidden sm:block absolute top-7 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-500/30 via-emerald-500/30 to-indigo-500/30" />
          {JOURNEY_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-3 relative z-10 w-full sm:w-1/4 px-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-emerald-600/10 border border-indigo-500/20 flex items-center justify-center shadow-lg">
                <step.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-white font-bold text-sm">{step.label}</p>
              <p className="text-slate-500 text-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* 4-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BENEFITS.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group bg-[#0E1628] border ${item.border} rounded-3xl p-8 hover:bg-[#111f3a] transition-all duration-300 cursor-default shadow-xl`}
            >
              <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">{item.desc}</p>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 bg-gradient-to-br from-indigo-900/30 via-[#0E1628] to-emerald-900/20 border border-indigo-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              Ready to simplify your application journey?
            </h3>
            <p className="text-slate-400 max-w-lg">
              Join students from 40+ countries who are already using UniTracker to stay organized and get into their dream German programs.
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/dashboard"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all whitespace-nowrap flex-shrink-0"
          >
            Start for Free →
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
