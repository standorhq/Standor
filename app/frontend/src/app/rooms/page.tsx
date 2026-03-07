'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Copy, Loader2, Zap } from 'lucide-react';
import { LeftNav } from '@/components/LeftNav';
import { TopBar } from '@/components/TopBar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Session } from '@/types';

const DIFF: Record<string, string> = {
  easy:   'badge-teal',
  medium: 'badge-amber',
  hard:   'badge-error',
};

export default function RoomsPage() {
  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: () => api.get('/api/sessions/my-sessions').then((r) => r.data),
  });

  return (
    <div className="flex min-h-screen bg-bg-base">
      <LeftNav />
      <div className="flex flex-1 flex-col" style={{ marginLeft: 'var(--nav-w-collapsed)' }}>
        <TopBar />
        <main
          className="flex-1 overflow-y-auto px-6 lg:px-10"
          style={{ paddingTop: 'calc(var(--topbar-h) + 2rem)', paddingBottom: '2rem' }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-text-primary">Rooms</h1>
              <p className="mt-1 text-sm text-text-secondary">All your interview sessions.</p>
            </div>
            <Link href="/room/new" className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New room
            </Link>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-teal-400" aria-label="Loading rooms" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="card flex flex-col items-center py-20 text-center">
              <p className="text-lg font-semibold text-text-primary">No rooms yet</p>
              <p className="mt-1 text-sm text-text-secondary">Create your first room to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session, i) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="card-room p-5"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-semibold text-text-primary">{session.problem}</h3>
                    <span className={`badge text-xs ${DIFF[session.difficulty?.toLowerCase() ?? ''] ?? 'badge-slate'}`}>
                      {session.difficulty}
                    </span>
                  </div>
                  <p className="mb-4 font-mono text-xs text-text-tertiary">{session.roomId}</p>
                  {session.aiAnalysis && (
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-400">
                      <Zap className="h-3 w-3" aria-hidden="true" />
                      Score: {session.aiAnalysis.overallScore}/10
                    </div>
                  )}
                  <div className="flex gap-2">
                    <a href={`/room/${session.roomId}`} className="btn-primary flex-1 justify-center py-2 text-xs">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      {session.status === 'active' ? 'Join' : 'View'}
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(session.roomId).catch(() => null); toast.success('Copied'); }}
                      className="btn-secondary p-2"
                      aria-label="Copy room ID"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
