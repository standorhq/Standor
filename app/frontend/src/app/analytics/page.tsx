'use client';

import { LeftNav } from '@/components/LeftNav';
import { TopBar } from '@/components/TopBar';
import { BarChart2, TrendingUp, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const METRICS = [
  { label: 'Sessions this month', value: '—', Icon: BarChart2, color: 'text-teal-400' },
  { label: 'Avg score',           value: '—', Icon: TrendingUp, color: 'text-amber-400' },
  { label: 'Candidates reviewed', value: '—', Icon: Users,      color: 'text-status-info' },
  { label: 'Avg duration',        value: '—', Icon: Clock,       color: 'text-text-secondary' },
];

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-bg-base">
      <LeftNav />
      <div className="flex flex-1 flex-col" style={{ marginLeft: 'var(--nav-w-collapsed)' }}>
        <TopBar />
        <main
          className="flex-1 overflow-y-auto px-6 lg:px-10"
          style={{ paddingTop: 'calc(var(--topbar-h) + 2rem)', paddingBottom: '2rem' }}
        >
          <div className="mb-8">
            <h1 className="text-h2 font-bold text-text-primary">Analytics</h1>
            <p className="mt-1 text-sm text-text-secondary">Track candidate performance and hiring trends.</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map(({ label, value, Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="card flex items-center gap-4 p-5"
              >
                <div className={`rounded-xl bg-bg-elevated p-2.5 ${color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-text-primary">{value}</p>
                  <p className="text-xs text-text-tertiary">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="card flex flex-col items-center py-24 text-center">
            <BarChart2 className="mb-4 h-10 w-10 text-text-tertiary opacity-40" aria-hidden="true" />
            <p className="text-lg font-semibold text-text-primary">Analytics coming soon</p>
            <p className="mt-1 text-sm text-text-secondary">
              Run sessions to start building your performance data.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
