'use client';

/**
 * DemoPlayer — interactive mock interview demo.
 *
 * Simulates: create room → candidate types code → run → AI analysis.
 * All events are deterministic and pre-scripted; no real sockets.
 *
 * Stages:
 *   idle      Show static editor; "▶ Play demo" button visible
 *   typing    Code appears character-by-character (~45 chars/s)
 *   running   "Run" button pulses; fake output appears
 *   analyzing AI panel fills progressively
 *   done      Full results; "Replay" button appears
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Loader2, Play as RunIcon, Sparkles, Bug, Lightbulb, Check } from 'lucide-react';

// ── Demo script ───────────────────────────────────────────────────────────────

const FULL_CODE = `def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test
print(two_sum([2, 7, 11, 15], 9))  # → [0, 1]
print(two_sum([3, 2, 4], 6))       # → [1, 2]`;

const OUTPUT = `[0, 1]
[1, 2]`;

const AI_RESULT = {
  score: 9,
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  bugs: [] as string[],
  suggestions: [
    'Add input validation for empty list edge case',
    'Consider adding type hints for return type clarity',
  ],
  summary:
    'Clean, optimal hash-map solution. Single pass with O(n) time and space. Clear variable naming and idiomatic Python.',
};

const PRESENCE = [
  { initials: 'AK', color: '#0EA5A4', name: 'Alex K (Interviewer)' },
  { initials: 'JR', color: '#F59E0B', name: 'Jordan R (Candidate)'  },
];

type Stage = 'idle' | 'typing' | 'running' | 'analyzing' | 'done';

// ── Syntax-highlight helper (minimal, no dep) ─────────────────────────────────

function highlight(code: string): React.ReactNode {
  // Split into lines, color keywords/strings/comments
  return code.split('\n').map((line, li) => {
    const parts: React.ReactNode[] = [];
    const remaining = line;
    // Very simple tokenizer — color: comment > string > keyword > default
    const commentIdx = remaining.indexOf('#');
    if (commentIdx !== -1) {
      const before = remaining.slice(0, commentIdx);
      const comment = remaining.slice(commentIdx);
      parts.push(<span key="b">{colorTokens(before)}</span>);
      parts.push(<span key="c" className="text-text-tertiary italic">{comment}</span>);
    } else {
      parts.push(<span key="t">{colorTokens(remaining)}</span>);
    }
    return (
      <span key={li} className="block leading-[1.65]">
        {parts}
      </span>
    );
  });
}

function colorTokens(text: string): React.ReactNode {
  const keywords = /\b(def|return|for|in|if|print|list|dict|int)\b/g;
  const strings  = /(".*?"|'.*?')/g;

  // Build a flat array of styled spans
  const tokens: React.ReactNode[] = [];
  let last = 0;

  // Merge matches sorted by index
  const matches: Array<{ idx: number; len: number; type: 'kw' | 'str' }> = [];
  let m;
  while ((m = keywords.exec(text)) !== null) matches.push({ idx: m.index, len: m[0].length, type: 'kw' });
  while ((m = strings.exec(text))  !== null) matches.push({ idx: m.index, len: m[0].length, type: 'str' });
  matches.sort((a, b) => a.idx - b.idx);

  for (const { idx, len, type } of matches) {
    if (idx < last) continue;
    if (idx > last) tokens.push(<span key={`t${last}`}>{text.slice(last, idx)}</span>);
    const slice = text.slice(idx, idx + len);
    tokens.push(
      type === 'kw'
        ? <span key={`k${idx}`} className="text-teal-400 font-medium">{slice}</span>
        : <span key={`s${idx}`} className="text-amber-400">{slice}</span>,
    );
    last = idx + len;
  }
  if (last < text.length) tokens.push(<span key={`te${last}`}>{text.slice(last)}</span>);
  return tokens;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DemoPlayer() {
  const [stage, setStage]   = useState<Stage>('idle');
  const [typed, setTyped]   = useState(0);           // chars revealed so far
  const [showOutput, setShowOutput]   = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiStep, setAiStep] = useState(0);           // 0..4 AI sections revealed
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const reset = useCallback(() => {
    clearTimers();
    setStage('idle');
    setTyped(0);
    setShowOutput(false);
    setShowAI(false);
    setAiStep(0);
  }, []);

  const play = useCallback(() => {
    reset();
    setStage('typing');

    // Typing: ~45 chars/s → FULL_CODE.length / 45 * 1000 ms ≈ 3200ms
    const TYPING_SPEED = 22; // ms per char
    let charIdx = 0;
    const typeNext = () => {
      charIdx++;
      setTyped(charIdx);
      if (charIdx < FULL_CODE.length) {
        schedule(typeNext, TYPING_SPEED + Math.random() * 8 - 4);
      } else {
        // Typing done → run
        schedule(() => setStage('running'), 300);
        schedule(() => setShowOutput(true), 900);
        schedule(() => { setStage('analyzing'); setShowAI(true); }, 1400);
        // Progressively reveal AI sections
        [0, 1, 2, 3, 4].forEach((i) => {
          schedule(() => setAiStep(i + 1), 1400 + (i + 1) * 350);
        });
        schedule(() => setStage('done'), 1400 + 5 * 350 + 200);
      }
    };
    schedule(typeNext, TYPING_SPEED);
  }, [reset]);

  useEffect(() => () => clearTimers(), []);

  const displayCode = stage === 'idle' ? '' : FULL_CODE.slice(0, typed);
  const isRunning   = stage === 'running';
  const isAnalyzing = stage === 'analyzing';

  return (
    <div className="w-full">
      {/* Demo shell */}
      <div className="overflow-hidden rounded-panel border border-border bg-bg-card shadow-elevation-2">
        {/* Toolbar */}
        <div className="flex h-10 items-center justify-between border-b border-border bg-bg-panel px-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#FF5C5C]/60" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]/60" />
              <span className="h-3 w-3 rounded-full bg-[#16A34A]/60" />
            </div>
            <span className="ml-2 text-xs font-medium text-text-tertiary">solution.py</span>
          </div>

          {/* Presence badges */}
          <div className="flex items-center gap-2">
            {stage !== 'idle' && PRESENCE.map(({ initials, color, name }) => (
              <motion.div
                key={initials}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.12, ease: [0.2, 0.9, 0.2, 1] }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-bg-base"
                style={{ backgroundColor: color }}
                title={name}
                aria-label={name}
              >
                {initials}
              </motion.div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={stage !== 'idle' && stage !== 'done'}
              onClick={isRunning ? undefined : () => setStage('running')}
              aria-label="Run code"
              className={`flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-180 ${
                isRunning
                  ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                  : 'border-border bg-bg-elevated text-text-secondary hover:text-text-primary'
              } ${isRunning ? 'shadow-glow-teal' : ''}`}
            >
              {isRunning
                ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                : <RunIcon className="h-3 w-3" aria-hidden="true" />}
              {isRunning ? 'Running…' : 'Run'}
            </button>

            <button
              disabled={stage !== 'idle' && stage !== 'done'}
              className={`flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-180 ${
                isAnalyzing
                  ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                  : 'border-border bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
              aria-label="AI analysis"
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {isAnalyzing ? 'Analyzing…' : 'AI'}
            </button>
          </div>
        </div>

        {/* Three-column layout: line numbers | editor | AI panel */}
        <div className="flex" style={{ height: 340 }}>
          {/* Line numbers */}
          <div className="w-10 shrink-0 select-none border-r border-border bg-bg-card pt-4 text-right" aria-hidden="true">
            {Array.from({ length: 13 }, (_, i) => (
              <div key={i} className="px-2 font-mono text-[11px] leading-[1.65] text-text-tertiary/50">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code area */}
          <div className="relative flex-1 overflow-hidden bg-bg-card p-4 font-mono text-xs">
            {stage === 'idle' ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-text-tertiary">Press Play to start the demo</p>
              </div>
            ) : (
              <pre className="leading-[1.65] text-text-primary">
                {highlight(displayCode)}
                {/* Blinking cursor */}
                {stage === 'typing' && (
                  <span
                    className="inline-block h-3.5 w-0.5 bg-teal-400 align-middle"
                    style={{ animation: 'livePulse 0.8s ease-in-out infinite' }}
                    aria-hidden="true"
                  />
                )}
              </pre>
            )}

            {/* Output drawer */}
            <AnimatePresence>
              {showOutput && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="absolute bottom-0 left-0 right-0 border-t border-border bg-bg-panel px-4 py-3"
                >
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Output</p>
                  <pre className="font-mono text-xs text-status-success">{OUTPUT}</pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI analysis panel */}
          <div className="w-60 shrink-0 overflow-y-auto border-l border-border bg-bg-surface p-3 scrollbar-thin">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">AI Analysis</p>

            <AnimatePresence>
              {!showAI && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-text-tertiary"
                >
                  {stage === 'idle' ? 'Awaiting code…' : 'Running analysis…'}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Score */}
            <AnimatePresence>
              {aiStep >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="mb-3 rounded-lg border border-border bg-bg-card p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Score</p>
                    <span className="text-xl font-extrabold text-teal-400">
                      {AI_RESULT.score}<span className="text-xs text-text-tertiary">/10</span>
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-bg-elevated">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${(AI_RESULT.score / 10) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Complexity */}
            <AnimatePresence>
              {aiStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="mb-3 space-y-2 rounded-lg border border-border bg-bg-card p-3"
                >
                  {[
                    { label: 'Time', value: AI_RESULT.timeComplexity  },
                    { label: 'Space', value: AI_RESULT.spaceComplexity },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">{label}</p>
                      <p className="font-mono text-xs text-text-primary">{value}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No bugs */}
            <AnimatePresence>
              {aiStep >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="mb-3 flex items-center gap-1.5 rounded-lg border border-[#16A34A]/20 bg-[#16A34A]/5 p-3"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-status-success" aria-hidden="true" />
                  <p className="text-[11px] text-status-success">No bugs found</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions */}
            <AnimatePresence>
              {aiStep >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="mb-3 rounded-lg border border-border bg-bg-card p-3"
                >
                  <div className="mb-1.5 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-amber-400" aria-hidden="true" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Suggestions</p>
                  </div>
                  <ul className="space-y-1.5">
                    {AI_RESULT.suggestions.map((s, i) => (
                      <li key={i} className="text-[11px] leading-relaxed text-text-secondary">• {s}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary */}
            <AnimatePresence>
              {aiStep >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-lg border border-border bg-bg-card p-3"
                >
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-text-tertiary">Summary</p>
                  <p className="text-[11px] leading-relaxed text-text-secondary">{AI_RESULT.summary}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Play / Replay controls */}
      <div className="mt-6 flex justify-center gap-3" aria-label="Demo controls">
        {stage === 'idle' && (
          <button
            onClick={play}
            className="btn-primary px-6 py-2.5"
            aria-label="Play interactive demo"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Play demo
          </button>
        )}

        {stage === 'done' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={reset}
            className="btn-secondary px-6 py-2.5"
            aria-label="Replay demo"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Replay
          </motion.button>
        )}

        {stage !== 'idle' && stage !== 'done' && (
          <div className="flex items-center gap-2 text-sm text-text-tertiary" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin text-teal-400" aria-hidden="true" />
            {stage === 'typing'    && 'Candidate typing…'}
            {stage === 'running'   && 'Running code…'}
            {stage === 'analyzing' && 'AI analyzing…'}
          </div>
        )}
      </div>
    </div>
  );
}
