'use client';

import { motion } from 'framer-motion';
import { Code2, Video, Zap, Brain, MailCheck, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    Icon: Code2,
    title: 'Monaco Editor + Yjs',
    desc: 'Google Docs–style real-time editing with CRDT conflict resolution. 0ms latency on same region.',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    Icon: Video,
    title: 'WebRTC Video',
    desc: 'Peer-to-peer video with PeerJS. No extra infra, no plugins — works in every modern browser.',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    Icon: Zap,
    title: '20+ Languages',
    desc: 'Run code instantly via Piston API. Python, JS, Java, C++, Go, Rust and more — 2s timeout.',
    color: 'text-accent-500 bg-accent-50',
  },
  {
    Icon: Brain,
    title: 'AI Code Analysis',
    desc: 'DeepSeek Coder via OpenRouter reviews your code: complexity, bugs, style, tests — in seconds.',
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    Icon: MailCheck,
    title: 'Email Reports',
    desc: 'Both participants get a detailed HTML summary with AI scores and code snapshots after each session.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    Icon: BarChart3,
    title: 'Hiring Analytics',
    desc: 'Track candidate performance across sessions. Compare scores, filter by difficulty, export CSV.',
    color: 'text-slate-700 bg-slate-100',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-display-sm font-extrabold text-slate-900"
          >
            Everything in one room
          </motion.h2>
          <p className="mt-4 text-slate-500">
            No cobbling together Zoom + LeetCode + Notion. Standor is your complete interview stack.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="card p-6"
            >
              <div className={`mb-4 inline-flex rounded-xl p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
