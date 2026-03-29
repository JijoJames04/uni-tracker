'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
        const ratesData = data.rates as Record<string, Record<string, number>>;
        const rates: HistoricalRate[] = Object.entries(ratesData).map(([date, rateValues]) => ({
          date,
          rate: rateValues.INR,
        }));
        setHistoricalRates(rates);
      } catch {
        // Silently fail — graph just won't show
      }
    };
    fetchHistory();
  }, []);

  const inrAmount = customAmount * exchangeRate.rate;
  
  const displayRates = [...historicalRates];
  const todayStr = new Date().toISOString().split('T')[0];
  if (displayRates.length > 0 && !exchangeRate.loading && !exchangeRate.error) {
    const lastPoint = displayRates[displayRates.length - 1];
    if (lastPoint.date !== exchangeRate.date && exchangeRate.date > lastPoint.date) {
      displayRates.push({ date: exchangeRate.date, rate: exchangeRate.rate });
    } else if (lastPoint.date === exchangeRate.date && lastPoint.rate !== exchangeRate.rate) {
      displayRates[displayRates.length - 1] = { date: exchangeRate.date, rate: exchangeRate.rate };
    }
    
    const newLastPoint = displayRates[displayRates.length - 1];
    if (newLastPoint.date !== todayStr) {
      displayRates.push({ date: todayStr, rate: exchangeRate.rate });
    }
  }

  const minRate = displayRates.length ? Math.min(...displayRates.map(r => r.rate)) : 0;
  const maxRate = displayRates.length ? Math.max(...displayRates.map(r => r.rate)) : 0;
  const avgRate = displayRates.length ? displayRates.reduce((s, r) => s + r.rate, 0) / displayRates.length : 0;

  return (
    <div className={`space-y-6 ${className} pb-6`} id="blocked-account-calculator">
      {/* Calculator Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl border border-amber-500/20 shadow-inner">
            <Calculator className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-foreground tracking-tight text-lg">Blocked Account Calculator</h3>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              Official requirement: €{OFFICIAL_BLOCKED_AMOUNT_EUR.toLocaleString()}/year
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* EUR Input */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Amount (EUR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-muted-foreground font-semibold">€</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full bg-background border border-border/50 rounded-xl pl-8 pr-4 py-3 text-foreground font-medium shadow-sm focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                id="blocked-account-eur-input"
              />
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              Today&apos;s Rate (EUR → INR)
              {exchangeRate.loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />}
            </label>
            <div className="bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-[15px] font-medium text-foreground shadow-sm flex items-center justify-between">
              <span>1 EUR = <span className="text-amber-600 dark:text-amber-500 font-bold">₹{exchangeRate.rate.toFixed(2)}</span></span>
              <span className="text-xs text-muted-foreground">{exchangeRate.date}</span>
            </div>
          </div>

          {/* INR Result */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Total (INR)</label>
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-lg font-black text-amber-600 dark:text-amber-400 shadow-sm">
              ₹{inrAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {exchangeRate.error && (
          <p className="text-xs text-yellow-500/70 mb-3">⚠️ {exchangeRate.error}</p>
        )}

        {/* Blocked Account Providers */}
        <div className="mt-6 pt-6 border-t border-border/40">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Recommended Providers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BLOCKED_ACCOUNT_PROVIDERS.map((provider) => (
              <a
                key={provider.name}
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-background border border-border/50 hover:border-amber-500/40 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-bold text-sm tracking-tight">
                    {provider.name}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{provider.description}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-amber-500/10 group-hover:scale-110 transition-all">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-500" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Currency History */}
      {displayRates.length > 10 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-all duration-300"
          id="currency-graph"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl border border-blue-500/20 shadow-inner">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-foreground tracking-tight text-lg">Exchange Rate Trends</h3>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">Historical overview (1 Year)</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-[12px]">
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
                <span className="text-muted-foreground font-bold tracking-tight">Lowest:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">₹{minRate.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
                <span className="text-muted-foreground font-bold tracking-tight">Average:</span>
                <span className="text-foreground font-black">₹{avgRate.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
                <span className="text-muted-foreground font-bold tracking-tight">Highest:</span>
                <span className="text-rose-600 dark:text-rose-400 font-black">₹{maxRate.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Responsive Area Chart */}
          <div className="h-[250px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayRates} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en', { month: 'short', year: '2-digit' })}
                  minTickGap={30}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(val) => `₹${val.toFixed(0)}`}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Exchange Rate']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
