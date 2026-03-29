'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MapPin, Phone, CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import DhlFacilityFinder from './DhlFacilityFinder';

// ─── APS Office Details ────────────────────────────────────────
const APS_OFFICE = {
  name: 'Academic Evaluation Centre (APS India)',
  address: 'Gate No. 3, DLTA Complex, R.K. Khanna Stadium, 1 Africa Avenue, New Delhi 110029, India',
  phone: '+91-11-2610 4500',
  email: 'info@aps-india.de',
  website: 'https://www.aps-india.de',
  latitude: 28.5710,
  longitude: 77.2110,
  mapUrl: 'https://www.google.com/maps/search/Academic+Evaluation+Centre+DLTA+Complex+RK+Khanna+Stadium+Africa+Avenue+New+Delhi',
};



// ─── APS Required Documents ───────────────────────────────────
const APS_DOCUMENTS = [
  { id: 'passport', label: 'Valid passport (original + 2 copies)', category: 'Identity' },
  { id: 'photos', label: '2 recent passport-size photographs', category: 'Identity' },
  { id: 'aps-form', label: 'APS application form (filled online)', category: 'Application' },
  { id: 'aps-fee', label: 'APS processing fee receipt (₹18,000 approx.)', category: 'Application' },
  { id: 'class10', label: 'Class 10 mark sheet & certificate (original + copies)', category: 'Academic' },
  { id: 'class12', label: 'Class 12 mark sheet & certificate (original + copies)', category: 'Academic' },
  { id: 'degree', label: 'Bachelor degree certificate (original + copies)', category: 'Academic' },
  { id: 'transcripts', label: 'All semester mark sheets / transcripts (original + copies)', category: 'Academic' },
  { id: 'provisional', label: 'Provisional certificate (if degree not yet awarded)', category: 'Academic' },
  { id: 'naac', label: 'NAAC/NBA accreditation proof of university', category: 'Academic' },
  { id: 'language', label: 'Language certificate (IELTS/TOEFL/TestDaF) if available', category: 'Language' },
  { id: 'gre', label: 'GRE/GMAT score report (if applicable)', category: 'Tests' },
  { id: 'cv', label: 'Updated CV/Resume', category: 'Documents' },
  { id: 'work-exp', label: 'Work experience certificates (if any)', category: 'Documents' },
];

// ─── Visa Application Steps (F12) ────────────────────────────
const VISA_STEPS = [
  {
    step: 1,
    title: 'Receive Admission Letter (Zulassung)',
    description: 'Get your acceptance letter from the German university. Ensure it is unconditional.',
    timeline: 'After university decision',
  },
  {
    step: 2,
    title: 'Open Blocked Account',
    description: 'Open a blocked account (Sperrkonto) with Expatrio or Fintiba. Deposit the required amount (currently €11,904/year).',
    timeline: '2-3 weeks',
    link: 'https://www.expatrio.com',
  },
  {
    step: 3,
    title: 'Get Health Insurance',
    description: 'Purchase travel health insurance for the visa application. Switch to German health insurance after arrival.',
    timeline: '1-2 days',
  },
  {
    step: 4,
    title: 'Book VFS Appointment',
    description: 'Schedule an appointment at VFS Global for submitting your visa application.',
    timeline: '4-8 weeks in advance',
    link: 'https://www.vfsglobal.com/germany/india/',
  },
  {
    step: 5,
    title: 'Prepare Visa Documents',
    description: 'Gather: passport, admission letter, blocked account confirmation, health insurance, APS certificate, language certificates, motivation letter, CV, financial proof.',
    timeline: '1-2 weeks',
  },
  {
    step: 6,
    title: 'Attend Visa Appointment',
    description: 'Submit all documents at VFS Global. Biometrics will be taken. Pay the visa fee (€75).',
    timeline: 'On appointment date',
  },
  {
    step: 7,
    title: 'Wait for Processing',
    description: 'Visa processing takes 4-12 weeks. Track status via VFS portal. German Embassy may request additional documents.',
    timeline: '4-12 weeks',
  },
  {
    step: 8,
    title: 'Receive Visa & Travel',
    description: 'Collect passport with visa. Register at the Ausländerbehörde (Foreigners Office) within 2 weeks of arrival in Germany.',
    timeline: 'Upon approval',
  },
];

export default function VisaApsGuide({ className = '' }: { className?: string }) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedSection, setExpandedSection] = useState<string | null>('aps');

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const categories = [...new Set(APS_DOCUMENTS.map(d => d.category))];
  const completedCount = checkedItems.size;
  const totalCount = APS_DOCUMENTS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className={`space-y-6 ${className}`} id="visa-aps-guide">
      {/* APS Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-2xl border border-zinc-700/50 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('aps')}
          className="w-full flex items-center justify-between p-6 hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-100">APS Document Preparation</h3>
              <p className="text-xs text-zinc-400">{completedCount}/{totalCount} documents ready ({progressPercent}%)</p>
            </div>
          </div>
          {expandedSection === 'aps' ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {/* Progress bar */}
        <div className="px-6 pb-2">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence>
          {expandedSection === 'aps' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 space-y-4"
            >
              {/* APS Office Info */}
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  APS Office Location
                </h4>
                <p className="text-xs text-zinc-400">{APS_OFFICE.address}</p>
                <div className="flex flex-wrap gap-2">
                  <a href={APS_OFFICE.mapUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
                    <MapPin className="w-3 h-3" /> View on Map <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a href={`tel:${APS_OFFICE.phone}`}
                    className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
                    <Phone className="w-3 h-3" /> {APS_OFFICE.phone}
                  </a>
                  <a href={APS_OFFICE.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
                    <ExternalLink className="w-3 h-3" /> Official Site
                  </a>
                </div>
              </div>

              {/* Document Checklist */}
              {categories.map(category => (
                <div key={category}>
                  <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">{category}</h4>
                  <div className="space-y-1">
                    {APS_DOCUMENTS.filter(d => d.category === category).map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => toggleCheck(doc.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                          checkedItems.has(doc.id)
                            ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                            : 'bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700/30 border border-transparent'
                        }`}
                      >
                        {checkedItems.has(doc.id)
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          : <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                        }
                        <span className={checkedItems.has(doc.id) ? 'line-through opacity-70' : ''}>{doc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* DHL Facilities — location-aware */}
              <DhlFacilityFinder />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Visa Steps (F12) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-2xl border border-zinc-700/50 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('visa')}
          className="w-full flex items-center justify-between p-6 hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-100">Visa Application Process</h3>
              <p className="text-xs text-zinc-400">8-step guide for German student visa</p>
            </div>
          </div>
          {expandedSection === 'visa' ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        <AnimatePresence>
          {expandedSection === 'visa' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 space-y-3"
            >
              {VISA_STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4"
                >
                  {/* Step number + connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {step.step}
                    </div>
                    {i < VISA_STEPS.length - 1 && (
                      <div className="w-px h-full bg-zinc-700/50 my-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <h4 className="text-sm font-medium text-zinc-100">{step.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{step.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        ⏱ {step.timeline}
                      </span>
                      {step.link && (
                        <a href={step.link} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <ExternalLink className="w-2.5 h-2.5" /> Open Link
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
