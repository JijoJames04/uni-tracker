'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Calculator, Search
} from 'lucide-react';
import VisaApsGuide from '@/components/shared/VisaApsGuide';
import BlockedAccountCalculator from '@/components/shared/BlockedAccountCalculator';
import UniversityLinks from '@/components/shared/UniversityLinks';

const TABS = [
  { id: 'visa-aps', label: 'Visa & APS Guide', icon: Shield, color: 'text-violet-500' },
  { id: 'blocked-account', label: 'Blocked Account', icon: Calculator, color: 'text-emerald-500' },
  { id: 'find-university', label: 'Find Universities', icon: Search, color: 'text-blue-500' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ResourcesContent() {
  const [activeTab, setActiveTab] = useState<TabId>('visa-aps');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-foreground">Resources & Tools</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Everything you need for your German university journey — visa guides, account calculators, and more.
        </p>
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-card border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'visa-aps' && <VisaApsGuide />}
        {activeTab === 'blocked-account' && <BlockedAccountCalculator />}
        {activeTab === 'find-university' && (
          <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-black text-foreground text-[18px] mb-4">University Finders</h3>
            <p className="text-sm font-medium text-muted-foreground mb-6">
              Use these tools to discover programs that match your profile and preferences.
            </p>
            <UniversityLinks universityName="" showFinderLinks={true} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
