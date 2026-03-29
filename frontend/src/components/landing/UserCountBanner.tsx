'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';

interface Props {
  /** If provided, fetches count from this URL. Otherwise tries the backend. */
  countUrl?: string;
}

export default function UserCountBanner({ countUrl }: Props) {
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const motionCount = useMotionValue(0);
  const [displayCount, setDisplayCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Fetch user count from backend
  useEffect(() => {
    const url = countUrl || '/api/v1/auth/user-count';
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const count = typeof data === 'number' ? data : data.count ?? data.total ?? 0;
        setTargetCount(count);
      })
      .catch(() => {
        // Fallback count if backend unavailable
        setTargetCount(0);
      });
  }, [countUrl]);

  // Animate when in viewport
  useEffect(() => {
    if (targetCount === null || hasAnimated || targetCount === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate(motionCount, targetCount, {
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplayCount(Math.round(v)),
          });
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [targetCount, hasAnimated, motionCount]);

  if (targetCount === null || targetCount === 0) return null;

  return (
    <section ref={ref} className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative rounded-3xl overflow-hidden
          bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10
          border border-indigo-500/20 p-8 sm:p-12 text-center"
        >
          {/* Background shimmer */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -left-full"
              animate={{ left: ['−100%', '100%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-6">
              <TrendingUp className="w-3 h-3" />
              Growing community
            </div>

            <div className="flex items-center justify-center gap-3 mb-3">
              <Users className="w-8 h-8 text-indigo-400" />
              <motion.span
                className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r
                  from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
              >
                {displayCount.toLocaleString()}
              </motion.span>
            </div>

            <p className="text-lg text-zinc-300 font-medium">
              Trusted users tracking their German university journey
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              Join thousands of students who trust UniTracker for their applications
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
