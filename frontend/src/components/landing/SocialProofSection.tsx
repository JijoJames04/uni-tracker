'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Arjun M.',
    country: '🇮🇳 India',
    program: 'M.Sc. Data Science @ TU Munich',
    text: 'UniTracker made managing 9 applications at once completely stress-free. The APS checklist alone saved me from missing critical documents.',
    avatar: 'AM',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
  },
  {
    name: 'Fatima A.',
    country: '🇳🇬 Nigeria',
    program: 'M.Sc. Mechanical Eng. @ RWTH Aachen',
    text: 'I used to lose track of deadlines in a Google Sheet. Now I have a visual pipeline for every single application. The AI SOP generator is genius.',
    avatar: 'FA',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
  },
  {
    name: 'Rohan P.',
    country: '🇳🇵 Nepal',
    program: 'M.Sc. Computer Engineering @ KIT',
    text: 'The blocked account calculator saved me hours of confusion. I knew exactly what amount to deposit — and the exchange rate graph helped plan timing.',
    avatar: 'RP',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
];

const STATS = [
  { value: '40+', label: 'Countries Represented' },
  { value: '200+', label: 'German Universities Tracked' },
  { value: '12', label: 'Integrated Tools' },
  { value: '€0', label: 'Forever Free' },
];

export default function SocialProofSection() {
  return (
    <section className="py-24 relative overflow-hidden" id="testimonials" aria-label="Social proof and testimonials">
      <div className="absolute inset-0 bg-[#060D1A] -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-24">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-emerald-400 mb-2">{stat.value}</p>
              <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold mb-5">
            <MessageSquare className="w-4 h-4" />
            <span>What Students Say</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Real students. Real results.
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Used by applicants targeting top programs at TU Munich, RWTH Aachen, Heidelberg, and 200+ other institutions.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="bg-[#0E1628] border border-white/[0.07] rounded-3xl p-7 hover:border-white/10 transition-colors duration-300 flex flex-col gap-5"
            >
              <blockquote className="text-slate-300 text-[15px] leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-xs font-black ${t.color}`}>{t.avatar}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t.name} <span className="text-slate-500 font-normal">{t.country}</span></p>
                  <p className="text-slate-500 text-xs">{t.program}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
