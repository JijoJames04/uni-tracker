'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Sparkles, Globe2 } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth.store';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function HeroSection() {
  const router = useRouter();
  const { setUser, setLocalMode } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
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
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#111634] to-[#0d1025]" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full
            bg-indigo-600/10 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full
            bg-purple-600/10 blur-[100px]"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full
            bg-emerald-500/5 blur-[80px]"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="max-w-4xl mx-auto text-center z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Track your German university journey
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
        >
          <span className="text-white">Your </span>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Complete Guide
          </span>
          <br />
          <span className="text-white">to Study in </span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Germany
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Track applications, manage documents, find DHL facilities, prepare for APS,
          and ace your visa process — all in one beautiful tracker.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isFirebaseConfigured && (
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleSignIn}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white font-semibold text-lg shadow-xl shadow-indigo-500/20
                hover:shadow-indigo-500/40 transition-shadow"
            >
              <Globe2 className="w-5 h-5" />
              Sign in with Google
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLocalMode}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl
              border border-zinc-700 bg-zinc-800/50
              text-zinc-200 font-semibold text-lg
              hover:bg-zinc-700/50 hover:border-zinc-600 transition-all"
          >
            <GraduationCap className="w-5 h-5" />
            Use Locally
            <ArrowRight className="w-5 h-5 opacity-50" />
          </motion.button>
        </motion.div>

        {/* Sub-note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-zinc-600 mt-6"
        >
          {isFirebaseConfigured
            ? 'Sign in to sync data across devices • or use locally on this PC'
            : 'Running locally — all data stored on your machine'}
        </motion.p>
      </div>
    </section>
  );
}
