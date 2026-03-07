'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { step: '01', title: 'Create a room', desc: 'Set a problem title and difficulty. Share the room ID with your candidate — that\'s it.' },
  { step: '02', title: 'Code together', desc: 'Open Monaco editor synced in real-time via Yjs CRDT. Enable video for face-to-face.' },
  { step: '03', title: 'Run & analyze', desc: 'Execute code in any language. Click AI to get instant feedback on complexity and correctness.' },
  { step: '04', title: 'Get the report', desc: 'End the session and receive a detailed email report with code snapshots and AI scoring.' },
];

export function HowItWorks() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-display-sm font-extrabold text-slate-900">How it works</h2>
        </motion.div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent lg:block" />

          {STEPS.map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-200 bg-white font-extrabold text-primary-600 shadow-card">
                {step}
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
