'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Official blocked account amount (updated from official sources)
const OFFICIAL_BLOCKED_AMOUNT_EUR = 11904; // 2024/2025 requirement: €11,904/year

// Frankfurter API v1 (ECB reference rates, CORS-enabled, free)
const API_BASE = 'https://api.frankfurter.dev/v1';

const BLOCKED_ACCOUNT_PROVIDERS = [
  { name: 'Expatrio',        url: 'https://www.expatrio.com',       description: 'Most popular choice for Indian students' },
  { name: 'Fintiba',         url: 'https://www.fintiba.com',        description: 'Quick digital setup, good support' },
  { name: 'Deutsche Bank',   url: 'https://www.deutsche-bank.de',   description: 'Traditional bank option' },
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

type GraphMode = 'rate' | 'total';

export default function BlockedAccountCalculator({ className = '' }: { className?: string }) {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    rate: 0,
    date: new Date().toISOString().split('T')[0],
    loading: true,
    error: null,
  });
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [graphLoading, setGraphLoading]       = useState(true);
  const [graphError, setGraphError]           = useState<string | null>(null);
  const [customAmount, setCustomAmount]       = useState<number>(OFFICIAL_BLOCKED_AMOUNT_EUR);
  const [graphMode, setGraphMode]             = useState<GraphMode>('rate');

  // Fetch live spot rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res  = await fetch(`${API_BASE}/latest?from=EUR&to=INR`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setExchangeRate({ rate: data.rates.INR, date: data.date, loading: false, error: null });
      } catch (err) {
        console.warn('EUR/INR rate fetch failed:', err);
        setExchangeRate(prev => ({ ...prev, loading: false, error: 'Could not fetch live rate' }));
      }
    };
    fetchRate();
  }, []);

  // Fetch 1-year historical rates (dynamic: today → 1 year ago)
  useEffect(() => {
    const fetchHistory = async () => {
      setGraphLoading(true);
      setGraphError(null);
      try {
        const endDate   = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const res       = await fetch(`${API_BASE}/${startDate}..${endDate}?from=EUR&to=INR`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data      = await res.json();
        const ratesData = data.rates as Record<string, Record<string, number>>;
        const entries   = Object.entries(ratesData);
        if (!entries.length) throw new Error('No data returned');
        const rates: HistoricalRate[] = entries
          .map(([date, rv]) => ({ date, rate: rv.INR }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setHistoricalRates(rates);
      } catch (err) {
        console.warn('Historical rates fetch failed:', err);
        setGraphError('Could not load exchange rate history. Please check your internet connection.');
      } finally {
        setGraphLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const inrAmount = exchangeRate.rate > 0 ? customAmount * exchangeRate.rate : 0;

  // Merge today's live rate into the historical series
  const displayRates = [...historicalRates];
  const todayStr = new Date().toISOString().split('T')[0];
  if (displayRates.length > 0 && !exchangeRate.loading && exchangeRate.rate > 0) {
    const last = displayRates[displayRates.length - 1];
    if (exchangeRate.date > last.date) {
      displayRates.push({ date: exchangeRate.date, rate: exchangeRate.rate });
    } else if (last.date === exchangeRate.date) {
      displayRates[displayRates.length - 1] = { date: exchangeRate.date, rate: exchangeRate.rate };
    }
    const newLast = displayRates[displayRates.length - 1];
    if (newLast.date !== todayStr) {
      displayRates.push({ date: todayStr, rate: exchangeRate.rate });
    }
  }

  const minRate = displayRates.length ? Math.min(...displayRates.map(r => r.rate)) : 0;
  const maxRate = displayRates.length ? Math.max(...displayRates.map(r => r.rate)) : 0;
  const avgRate = displayRates.length
    ? displayRates.reduce((s, r) => s + r.rate, 0) / displayRates.length
    : 0;

  const chartData = displayRates.map(r => ({ ...r, totalValue: r.rate * customAmount }));
  const hasChartData = chartData.length > 2;

  const isRate = graphMode === 'rate';

  return (
    <div className={`space-y-6 ${className} pb-6`} id="blocked-account-calculator">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-all duration-300"
      >
        {/* ── Header ── */}
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

        {/* ── Inputs ── */}
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
              {exchangeRate.rate > 0 ? (
                <>
                  <span>1 EUR = <span className="text-amber-600 dark:text-amber-500 font-bold">₹{exchangeRate.rate.toFixed(2)}</span></span>
                  <span className="text-xs text-muted-foreground">{exchangeRate.date}</span>
                </>
              ) : exchangeRate.loading ? (
                <span className="text-sm text-muted-foreground animate-pulse">Fetching…</span>
              ) : (
                <span className="text-sm text-muted-foreground">Unavailable</span>
              )}
            </div>
          </div>

          {/* INR Result */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Total (INR)</label>
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-lg font-black text-amber-600 dark:text-amber-400 shadow-sm">
              {inrAmount > 0
                ? `₹${inrAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : '—'}
            </div>
          </div>
        </div>

        {exchangeRate.error && (
          <p className="text-xs text-yellow-500/70 mb-3">⚠️ {exchangeRate.error}</p>
        )}

        {/* ── Providers ── */}
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

        {/* ── EUR / INR Exchange Rate Graph ── */}
        <div className="mt-6 pt-6 border-t border-border/40">
          {/* Graph header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border transition-colors duration-300 ${isRate ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                <TrendingUp className={`w-4 h-4 transition-colors duration-300 ${isRate ? 'text-indigo-500' : 'text-blue-500'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {isRate ? 'EUR → INR Exchange Rate' : 'Total Cost Trend (INR)'}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {isRate ? '1-year daily rate · live data from ECB' : `Based on €${customAmount.toLocaleString()} · 1-year history`}
                </p>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => setGraphMode('rate')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  isRate
                    ? 'bg-background text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-border/50'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                € / ₹ Rate
              </button>
              <button
                onClick={() => setGraphMode('total')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  !isRate
                    ? 'bg-background text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-border/50'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Total (INR)
              </button>
            </div>
          </div>

          {/* Stats pills — only shown when data is available */}
          {hasChartData && (
            <div className="flex flex-wrap gap-2 text-[12px] mb-4">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                <span className="text-muted-foreground font-bold">Low</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {isRate
                    ? `₹${minRate.toFixed(2)}`
                    : `₹${(minRate * customAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-bold">Avg</span>
                <span className="text-foreground font-black">
                  {isRate
                    ? `₹${avgRate.toFixed(2)}`
                    : `₹${(avgRate * customAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                <span className="text-muted-foreground font-bold">High</span>
                <span className="text-rose-600 dark:text-rose-400 font-black">
                  {isRate
                    ? `₹${maxRate.toFixed(2)}`
                    : `₹${(maxRate * customAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </span>
              </div>
              {isRate && (
                <div className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-lg border border-border/50 ml-auto">
                  <span className="text-muted-foreground font-bold">Swing</span>
                  <span className={`font-black ${maxRate - minRate > 3 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                    ₹{(maxRate - minRate).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Chart area */}
          {graphLoading ? (
            /* Loading state */
            <div className="h-[220px] bg-muted/30 rounded-2xl flex items-center justify-center border border-border/30">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 text-muted-foreground/50 animate-spin" />
                <p className="text-xs text-muted-foreground font-medium">Fetching 1-year rate history…</p>
              </div>
            </div>
          ) : graphError ? (
            /* Error state */
            <div className="h-[220px] bg-muted/20 rounded-2xl flex items-center justify-center border border-border/30">
              <div className="flex flex-col items-center gap-3 max-w-xs text-center">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <TrendingUp className="w-5 h-5 text-amber-500/60" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">{graphError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : hasChartData ? (
            /* Chart */
            <div className="h-[220px] w-full" id="currency-graph">
              <AnimatePresence mode="wait">
                <motion.div
                  key={graphMode}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />

                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en', { month: 'short', year: '2-digit' })}
                        minTickGap={28}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        dy={8}
                      />

                      <YAxis
                        dataKey={isRate ? 'rate' : 'totalValue'}
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(val: number) => {
                          if (isRate) return `₹${val.toFixed(1)}`;
                          if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                          if (val >= 100000)   return `₹${(val / 100000).toFixed(1)}L`;
                          if (val >= 1000)     return `₹${(val / 1000).toFixed(0)}k`;
                          return `₹${val.toFixed(0)}`;
                        }}
                        tickLine={false}
                        axisLine={false}
                        dx={-4}
                        width={56}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderRadius: '12px',
                          border: '1px solid hsl(var(--border))',
                          boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.15)',
                          padding: '8px 12px',
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: 12 }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: 2, fontSize: 11 }}
                        labelFormatter={(label) =>
                          new Date(label).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
                        }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any, _name: any, props: any) => {
                          if (isRate) {
                            return [`1 EUR = ₹${Number(value).toFixed(2)}`, 'Exchange Rate'];
                          }
                          return [
                            `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}  (₹${props.payload.rate.toFixed(2)}/€)`,
                            'Total in INR',
                          ];
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey={isRate ? 'rate' : 'totalValue'}
                        stroke={isRate ? '#6366f1' : '#3b82f6'}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={isRate ? 'url(#gradRate)' : 'url(#gradTotal)'}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, stroke: isRate ? '#6366f1' : '#3b82f6', fill: 'hsl(var(--card))' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : null}

          {/* Attribution */}
          {hasChartData && (
            <p className="text-[10px] text-muted-foreground/50 text-center mt-2 font-medium">
              Live data from{' '}
              <a href="https://frankfurter.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground transition-colors">
                Frankfurter API
              </a>
              {' '}· ECB reference rates · {displayRates.length} data points · Updates daily
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
