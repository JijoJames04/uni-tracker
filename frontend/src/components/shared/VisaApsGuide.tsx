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
  { id: 'passport', label: 'Valid passport (Copy only)', category: 'Identity' },
  { id: 'photos', label: '2 recent passport-size photographs (Copy only)', category: 'Identity' },
  { id: 'aps-form', label: 'APS application form filled online (Copy only)', category: 'Application' },
  { id: 'aps-fee', label: 'APS processing fee receipt (Copy only)', category: 'Application' },
  { id: 'class10', label: 'Class 10 mark sheet & certificate (Copy only)', category: 'Academic' },
  { id: 'class12', label: 'Class 12 mark sheet & certificate (Copy only)', category: 'Academic' },
  { id: 'degree', label: 'Bachelor degree certificate (Copy only)', category: 'Academic' },
  { id: 'transcripts', label: 'All semester mark sheets / transcripts (Copy only)', category: 'Academic' },
  { id: 'provisional', label: 'Provisional certificate (Copy only)', category: 'Academic' },
  { id: 'naac', label: 'NAAC/NBA accreditation proof of university (Copy only)', category: 'Academic' },
  { id: 'language', label: 'Language certificate (IELTS/TOEFL/TestDaF) (Copy only)', category: 'Language' },
  { id: 'gre', label: 'GRE/GMAT score report (Copy only)', category: 'Tests' },
  { id: 'cv', label: 'Updated CV/Resume (Copy only)', category: 'Documents' },
  { id: 'work-exp', label: 'Work experience certificates (Copy only)', category: 'Documents' },
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
        className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <button
          onClick={() => toggleSection('aps')}
          className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-violet-500/20 to-violet-500/5 rounded-2xl border border-violet-500/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-6 h-6 text-violet-500" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground tracking-tight text-lg">APS Document Preparation</h3>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">{completedCount}/{totalCount} documents ready ({progressPercent}%)</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-background border border-border/50 shadow-sm group-hover:bg-muted transition-colors">
            {expandedSection === 'aps' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </div>
        </button>

        {/* Progress bar */}
        <div className="px-6 pb-4 pt-1">
          <div className="h-2 bg-border/60 rounded-full overflow-hidden shadow-inner w-full">
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
              <div className="bg-background rounded-2xl p-5 space-y-3 border border-border/50 shadow-sm">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-500" />
                  APS Office Location
                </h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{APS_OFFICE.address}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a href={APS_OFFICE.mapUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg border border-violet-500/20 transition-colors">
                    <MapPin className="w-3.5 h-3.5" /> View on Map <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                  <a href={`tel:${APS_OFFICE.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg border border-border/50 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {APS_OFFICE.phone}
                  </a>
                  <a href={APS_OFFICE.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg border border-border/50 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /> Official Site
                  </a>
                </div>
              </div>
              
              {/* Document Requirement Note */}
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 flex gap-3 shadow-sm my-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400">Important Document Requirements</h4>
                  <p className="text-xs text-blue-700/90 dark:text-blue-500/90 mt-1 leading-relaxed">
                    Stamping is <span className="font-bold underline">not required</span>. A copy for all documents only needs to be shared. Please only send simple copies and do not send originals.
                  </p>
                </div>
              </div>

              {/* Document Checklist */}
              {categories.map(category => (
                <div key={category} className="pt-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-1">{category}</h4>
                  <div className="space-y-1.5">
                    {APS_DOCUMENTS.filter(d => d.category === category).map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => toggleCheck(doc.id)}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-sm transition-all duration-300 group ${
                          checkedItems.has(doc.id)
                            ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20 shadow-sm'
                            : 'bg-background hover:bg-muted text-foreground border border-border/50 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {checkedItems.has(doc.id)
                          ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          : <Circle className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                        }
                        <span className={`font-medium ${checkedItems.has(doc.id) ? 'line-through opacity-70' : ''}`}>{doc.label}</span>
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
        className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <button
          onClick={() => toggleSection('visa')}
          className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl border border-emerald-500/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground tracking-tight text-lg">Visa Application Process</h3>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">8-step comprehensive guide for Germany</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-background border border-border/50 shadow-sm group-hover:bg-muted transition-colors">
            {expandedSection === 'visa' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </div>
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
                    <div className="w-10 h-10 rounded-xl bg-background border border-border/50 shadow-sm flex items-center justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400 relative">
                      {step.step}
                    </div>
                    {i < VISA_STEPS.length - 1 && (
                      <div className="w-px h-full bg-border/80 my-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6 pt-1">
                    <h4 className="text-[15px] font-bold text-foreground">{step.title}</h4>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mt-1">{step.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        ⏱ {step.timeline}
                      </span>
                      {step.link && (
                        <a href={step.link} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
                          <ExternalLink className="w-3 h-3" /> External Link
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
