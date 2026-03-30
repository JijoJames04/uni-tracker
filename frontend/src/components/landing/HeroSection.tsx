'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Sparkles, Globe2, CheckCircle2, Star } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth.store';
import { isFirebaseConfigured } from '@/lib/firebase';

const TRUST_BADGES = [
  '100% Free Forever',
  'No Credit Card',
  'Cloud or Offline',
  'Works for All German Unis',
];

export default function HeroSection() {
  const router = useRouter();
  const { setUser, setLocalMode } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      const { user, token } = await signInWithGoogle();
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        googleAccessToken: token || undefined,
      });
      router.push('/dashboard');
    } catch {
      console.error('Google sign-in failed');
    }
  };

  const handleLocalMode = () => {
    setLocalMode(true);
    router.push('/dashboard');
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* Layered animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#06091a] via-[#0e1230] to-[#0a0e1a]" />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[100px]"
          animate={{ x: [0, -60, 0], y: [0, 40, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Top vignette */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#06091a] to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto text-center z-10">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-8 shadow-lg shadow-indigo-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>The #1 Free Tracker for German University Applications</span>
          <span className="ml-1 flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-6"
        >
          <span className="text-white">Stop Losing Track.</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Start Winning Admission
          </span>
          <span className="text-white">.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto mb-4 leading-relaxed font-medium"
        >
          UniTracker is the all-in-one platform for international students applying to{' '}
          <span className="text-white font-semibold">German universities</span>. Manage applications, documents, deadlines, APS, visa steps, and AI-powered prompts — completely <span className="text-emerald-400 font-bold">free</span>.
        </motion.p>

        {/* Star rating social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-slate-400 text-sm font-medium">Loved by students from India, Nigeria, Pakistan, Nepal & more</span>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          {isFirebaseConfigured && (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleSignIn}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
            >
              <Globe2 className="w-5 h-5" />
              Start with Google — Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLocalMode}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-200 font-bold text-lg hover:border-white/20 transition-all"
          >
            <GraduationCap className="w-5 h-5" />
            {isFirebaseConfigured ? 'Try without sign-in' : 'Open Dashboard — Free'}
            <ArrowRight className="w-5 h-5 opacity-50" />
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-5"
        >
          {TRUST_BADGES.map((badge) => (
            <span key={badge} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Dashboard preview card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-20 w-full max-w-5xl mx-auto px-4 z-10"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#111827]/90 to-[#0d1025]/90 backdrop-blur-md shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
            <span className="w-3 h-3 rounded-full bg-rose-500/60" />
            <span className="w-3 h-3 rounded-full bg-amber-500/60" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <div className="ml-4 flex-1 h-6 rounded-md bg-white/5 flex items-center px-3">
              <span className="text-slate-500 text-xs font-mono">unitracker.app/dashboard</span>
            </div>
          </div>
          {/* Dashboard mock stats row */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Applications', value: '12', color: 'text-indigo-400', dot: 'bg-indigo-500' },
              { label: 'In Progress', value: '7', color: 'text-blue-400', dot: 'bg-blue-500' },
              { label: 'Approved', value: '3', color: 'text-emerald-400', dot: 'bg-emerald-500' },
              { label: 'Days to Deadline', value: '18d', color: 'text-rose-400', dot: 'bg-rose-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                <div className={`w-2 h-2 rounded-full ${stat.dot} mb-3`} />
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-slate-500 text-xs font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          {/* Fake table preview */}
          <div className="px-6 pb-6 space-y-3">
            {[
              { uni: 'TU Munich', course: 'M.Sc. Computer Science', status: 'Under Review', statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20', days: '18d' },
              { uni: 'RWTH Aachen', course: 'M.Sc. Robotics', status: 'Documents Ready', statusColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', days: '32d' },
              { uni: 'Heidelberg Uni', course: 'M.Sc. Bioinformatics', status: 'SOP Writing', statusColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20', days: '45d' },
            ].map((row) => (
              <div key={row.uni} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <div>
                  <p className="text-white font-semibold text-sm">{row.course}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{row.uni}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${row.statusColor}`}>{row.status}</span>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">{row.days} left</span>
                </div>
              </div>
            ))}
          </div>
          {/* Bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0e1a] to-transparent pointer-events-none" />
        </div>
        {/* Card glow */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-indigo-600/10 blur-3xl scale-110" />
      </motion.div>
    </section>
  );
}
