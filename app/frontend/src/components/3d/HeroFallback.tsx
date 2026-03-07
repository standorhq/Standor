'use client';

/**
 * HeroFallback — static poster for low-end devices / before 3D loads.
 * Renders a pure CSS animated dot grid + accent node; zero JS overhead.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroFallback() {
  return (
    <div
      className="relative flex h-[480px] w-full flex-col items-center justify-center overflow-hidden rounded-panel border border-border bg-bg-base"
      aria-label="Standor signal refinement — static visualization"
      role="img"
    >
      {/* Dot grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#1F2937_1px,transparent_0)] bg-[size:28px_28px]"
      />

      {/* Radial vignette glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(14,165,164,0.08),transparent)]"
      />

      {/* Concentric rings */}
      {[140, 100, 64, 36].map((size, i) => (
        <div
          key={size}
          aria-hidden
          className="absolute rounded-full border border-teal-500/10"
          style={{ width: size, height: size, opacity: 1 - i * 0.2 }}
        />
      ))}

      {/* Central node */}
      <div
        aria-hidden
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/15 shadow-glow-teal"
      >
        <div className="h-6 w-6 rounded-full bg-teal-500/80" />
        {/* Pulse ring */}
        <div className="absolute inset-0 animate-ping rounded-full bg-teal-500/10" />
      </div>

      {/* Label */}
      <p className="mt-6 rounded-full border border-teal-500/20 bg-bg-surface/80 px-4 py-1 text-xs font-medium text-teal-400 backdrop-blur-sm">
        Signal refinement · Standor
      </p>

      {/* CTA */}
      <div className="mt-8 flex gap-3">
        <Link
          href="/register"
          className="btn-primary px-5 py-2.5 text-sm"
        >
          Start for free <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
