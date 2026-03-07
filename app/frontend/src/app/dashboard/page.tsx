'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Copy, ExternalLink, Clock, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Session } from '@/types';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_BADGE: Record<Difficulty, string> = {
  easy: 'badge-teal',
  medium: 'badge-amber',
  hard: 'bg-rose-50 text-rose-600 badge ring-1 ring-inset ring-rose-200',
};

export default function DashboardPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ problem: '', difficulty: 'medium' as Difficulty });

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: () => api.get('/api/sessions/my-sessions').then((r) => r.data),
  });

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: (body: { problem: string; difficulty: string }) =>
      api.post('/api/sessions', body).then((r) => r.data),
    onSuccess: (session: Session) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setShowModal(false);
      toast.success('Session created!');
      navigator.clipboard.writeText(session.roomId).catch(() => null);
    },
    onError: () => toast.error('Failed to create session'),
  });

  const filtered = sessions.filter((s) => filter === 'all' || s.status === filter);
  const stats = {
    total: sessions.length,
    active: sessions.filter((s) => s.status === 'active').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
    aiAnalyzed: sessions.filter((s) => s.aiAnalysis).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total sessions', value: stats.total, Icon: Clock, color: 'text-slate-700' },
            { label: 'Active', value: stats.active, Icon: Zap, color: 'text-primary-600' },
            { label: 'Completed', value: stats.completed, Icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'AI analyzed', value: stats.aiAnalyzed, Icon: Zap, color: 'text-accent-500' },
          ].map(({ label, value, Icon, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card flex items-center gap-4 p-5"
            >
              <div className={`rounded-xl bg-slate-100 p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-card">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            New session
          </button>
        </div>

        {/* Session cards */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center py-20 text-center">
            <p className="text-lg font-semibold text-slate-900">No sessions yet</p>
            <p className="mt-1 text-sm text-slate-500">Create your first interview session above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((session, i) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="card p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{session.problem}</h3>
                  <span className={DIFF_BADGE[session.difficulty as Difficulty]}>
                    {session.difficulty}
                  </span>
                </div>

                <p className="mb-4 font-mono text-xs text-slate-400">{session.roomId}</p>

                {session.aiAnalysis && (
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-accent-500">
                    <Zap className="h-3 w-3" />
                    <span>Score: {session.aiAnalysis.overallScore}/10</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <a
                    href={`/room/${session.roomId}`}
                    className="btn-primary flex-1 justify-center py-2 text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {session.status === 'active' ? 'Join' : 'View'}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(session.roomId).catch(() => null);
                      toast.success('Room ID copied');
                    }}
                    className="btn-secondary p-2"
                    aria-label="Copy room ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create session modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="card w-full max-w-md p-6"
          >
            <h2 className="mb-5 text-lg font-extrabold text-slate-900">Create interview session</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSession(form);
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Problem title
                </label>
                <input
                  className="input"
                  required
                  value={form.problem}
                  onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
                  placeholder="e.g. Two Sum, System Design: URL Shortener"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                      className={`flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-colors ${
                        form.difficulty === d
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create session'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
