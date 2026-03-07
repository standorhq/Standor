'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, Shield, Users } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FeatureGrid } from '@/components/FeatureGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

// Lazy-load heavy 3D hero — fallback shown until JS hydrates
const Hero3D = dynamic(() => import('@/components/3d/Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] items-center justify-center">
      <div className="h-64 w-64 animate-pulse rounded-full bg-primary-100" />
    </div>
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-24 pt-20">
        {/* Subtle grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f008_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f008_1px,transparent_1px)] bg-[size:48px_48px]"
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left: copy */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="max-w-xl"
            >
              <motion.div variants={fadeUp}>
                <span className="badge-teal mb-6 inline-flex gap-1.5">
                  <Zap className="h-3 w-3" />
                  Real-time · AI-powered · 100% free stack
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-display font-extrabold tracking-tight text-slate-900"
              >
                The standard for{' '}
                <span className="text-gradient">technical interviews</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg leading-8 text-slate-500"
              >
                Collaborate in Monaco editor in real-time, run code in 20+ languages,
                get instant AI feedback, and close hires faster — all in one room.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/register" className="btn-primary text-base px-6 py-3">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="btn-secondary text-base px-6 py-3">
                  <Play className="h-4 w-4" />
                  See a demo
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-5 text-sm text-slate-400"
              >
                {['No credit card', 'Open source', 'WCAG AA'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-primary-400" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: 3D hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <Hero3D />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Social proof numbers ── */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {[
              { label: 'Interviews run', value: '12,000+' },
              { label: 'Languages', value: '20+' },
              { label: 'Avg session', value: '47 min' },
              { label: 'AI accuracy', value: '94%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <FeatureGrid />
      <HowItWorks />

      {/* ── CTA banner ── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-12 shadow-card"
          >
            <Users className="mx-auto mb-4 h-10 w-10 text-primary-500" />
            <h2 className="text-display-sm font-extrabold text-slate-900">
              Ready to run better interviews?
            </h2>
            <p className="mt-3 text-slate-500">
              Create your first room in 30 seconds — no setup required.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register" className="btn-primary px-8 py-3 text-base">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
