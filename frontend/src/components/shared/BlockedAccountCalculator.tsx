'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';

// Official blocked account amount (updated from official sources)
const OFFICIAL_BLOCKED_AMOUNT_EUR = 11904; // 2024/2025 requirement: €11,904/year
const BLOCKED_ACCOUNT_PROVIDERS = [
  { name: 'Expatrio', url: 'https://www.expatrio.com', description: 'Most popular choice for Indian students' },
  { name: 'Fintiba', url: 'https://www.fintiba.com', description: 'Quick digital setup, good support' },
  { name: 'Deutsche Bank', url: 'https://www.deutsche-bank.de', description: 'Traditional bank option' },
];

interface ExchangeRate {
  rate: number;
  date: string;
  loading: boolean;
  error: string | null;
}

interface HistoricalRate {
  date: string;
  rate: number;
}

export default function BlockedAccountCalculator({ className = '' }: { className?: string }) {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    rate: 89.5, // Fallback rate
    date: new Date().toISOString().split('T')[0],
    loading: true,
    error: null,
  });
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [customAmount, setCustomAmount] = useState<number>(OFFICIAL_BLOCKED_AMOUNT_EUR);

  // Fetch current exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=INR');
        const data = await res.json();
        setExchangeRate({
          rate: data.rates.INR,
          date: data.date,
          loading: false,
          error: null,
        });
      } catch {
        setExchangeRate(prev => ({ ...prev, loading: false, error: 'Using fallback rate' }));
      }
    };
    fetchRate();
  }, []);

  // Fetch 1 year historical rates
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const res = await fetch(`https://api.frankfurter.app/${startDate}..${endDate}?from=EUR&to=INR`);
        const data = await res.json();
        const rates: HistoricalRate[] = Object.entries(data.rates).map(([date, rates]: [string, any]) => ({
          date,
          rate: rates.INR,
        }));
        setHistoricalRates(rates);
      } catch {
        // Silently fail — graph just won't show
      }
    };
    fetchHistory();
  }, []);

  const inrAmount = customAmount * exchangeRate.rate;
  const minRate = historicalRates.length ? Math.min(...historicalRates.map(r => r.rate)) : 0;
  const maxRate = historicalRates.length ? Math.max(...historicalRates.map(r => r.rate)) : 0;
  const avgRate = historicalRates.length ? historicalRates.reduce((s, r) => s + r.rate, 0) / historicalRates.length : 0;

  // SVG chart dimensions
  const chartW = 600;
  const chartH = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };

  const getChartPath = (): string => {
    if (historicalRates.length < 2) return '';
    const w = chartW - padding.left - padding.right;
    const h = chartH - padding.top - padding.bottom;
    const range = maxRate - minRate || 1;

    return historicalRates.map((r, i) => {
      const x = padding.left + (i / (historicalRates.length - 1)) * w;
      const y = padding.top + h - ((r.rate - minRate) / range) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getAreaPath = (): string => {
    const line = getChartPath();
    if (!line) return '';
    const w = chartW - padding.left - padding.right;
    const h = chartH - padding.top - padding.bottom;
    const lastX = padding.left + w;
    const bottomY = padding.top + h;
    return `${line} L ${lastX} ${bottomY} L ${padding.left} ${bottomY} Z`;
  };

  return (
    <div className={`space-y-6 ${className}`} id="blocked-account-calculator">
      {/* Calculator Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-2xl border border-zinc-700/50 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Calculator className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100">Blocked Account Calculator</h3>
            <p className="text-xs text-zinc-400">
              Official requirement: €{OFFICIAL_BLOCKED_AMOUNT_EUR.toLocaleString()}/year
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* EUR Input */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Amount (EUR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">€</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg pl-7 pr-3 py-2 text-zinc-100 text-sm focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 outline-none"
                id="blocked-account-eur-input"
              />
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 flex items-center gap-1">
              Rate (EUR → INR)
              {exchangeRate.loading && <RefreshCw className="w-3 h-3 animate-spin" />}
            </label>
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-300">
              1 EUR = ₹{exchangeRate.rate.toFixed(2)}
              <span className="text-xs text-zinc-500 ml-1">({exchangeRate.date})</span>
            </div>
          </div>

          {/* INR Result */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Total (INR)</label>
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-sm font-semibold text-amber-300">
              ₹{inrAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {exchangeRate.error && (
          <p className="text-xs text-yellow-500/70 mb-3">⚠️ {exchangeRate.error}</p>
        )}

        {/* Blocked Account Providers */}
        <div className="mt-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Blocked Account Providers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {BLOCKED_ACCOUNT_PROVIDERS.map((provider) => (
              <a
                key={provider.name}
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 transition-all text-sm group"
              >
                <div className="flex-1">
                  <span className="text-zinc-200 group-hover:text-amber-300 transition-colors font-medium text-xs">
                    {provider.name}
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{provider.description}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Currency Graph (F19) */}
      {historicalRates.length > 10 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-2xl border border-zinc-700/50 p-6"
          id="currency-graph"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100">EUR/INR — 1 Year</h3>
                <p className="text-xs text-zinc-400">Exchange rate history</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-zinc-500">Low: </span>
                <span className="text-green-400 font-medium">₹{minRate.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-zinc-500">Avg: </span>
                <span className="text-zinc-300 font-medium">₹{avgRate.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-zinc-500">High: </span>
                <span className="text-red-400 font-medium">₹{maxRate.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-48" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + (chartH - padding.top - padding.bottom) * (1 - ratio);
              const val = minRate + (maxRate - minRate) * ratio;
              return (
                <g key={ratio}>
                  <line x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="#27272a" strokeWidth="0.5" />
                  <text x={padding.left - 5} y={y + 4} textAnchor="end" fill="#71717a" fontSize="9">
                    {val.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={getAreaPath()} fill="url(#chart-gradient)" opacity="0.3" />

            {/* Line */}
            <path d={getChartPath()} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* X-axis labels */}
            {historicalRates.filter((_, i) => i % Math.floor(historicalRates.length / 6) === 0).map((r, i, arr) => {
              const idx = historicalRates.indexOf(r);
              const x = padding.left + (idx / (historicalRates.length - 1)) * (chartW - padding.left - padding.right);
              const label = new Date(r.date).toLocaleDateString('en', { month: 'short', year: '2-digit' });
              return (
                <text key={r.date} x={x} y={chartH - 5} textAnchor="middle" fill="#71717a" fontSize="9">
                  {label}
                </text>
              );
            })}
          </svg>
        </motion.div>
      )}
    </div>
  );
}
