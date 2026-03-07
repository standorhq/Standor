'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { LeftNav } from '@/components/LeftNav';
import { TopBar } from '@/components/TopBar';
import { api } from '@/lib/api';

interface Problem {
  title: string;
  difficulty: string;
  tags: string[];
  description: string;
}

const DIFF: Record<string, string> = {
  EASY:   'badge-teal',
  MEDIUM: 'badge-amber',
  HARD:   'badge-error',
};

export default function ProblemsPage() {
  const { data: problems = [], isLoading } = useQuery<Problem[]>({
    queryKey: ['problems'],
    queryFn: () => api.get('/api/problems').then((r) => r.data),
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
          <div className="mb-8">
            <h1 className="text-h2 font-bold text-text-primary">Problems</h1>
            <p className="mt-1 text-sm text-text-secondary">Curated interview problems across difficulties.</p>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-teal-400" aria-label="Loading problems" />
            </div>
          ) : problems.length === 0 ? (
            <div className="card flex flex-col items-center py-20 text-center">
              <BookOpen className="mb-4 h-10 w-10 text-text-tertiary opacity-40" aria-hidden="true" />
              <p className="text-lg font-semibold text-text-primary">No problems loaded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {problems.map((problem, i) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.03 }}
                  className="card flex items-center gap-4 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary truncate">{problem.title}</h3>
                      <span className={`badge text-xs shrink-0 ${DIFF[problem.difficulty] ?? 'badge-slate'}`}>
                        {problem.difficulty.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-1">{problem.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    {problem.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge-slate text-xs">{tag}</span>
                    ))}
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
