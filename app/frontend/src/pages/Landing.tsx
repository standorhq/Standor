import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import {
  ArrowRight, Code2, ShieldCheck, Brain, Link2, FileCode2,
  BarChart3, Check, GitMerge, Layers, Terminal,
  Play, Sparkles, ChevronRight, Zap, Users, Globe, Lock,
  RefreshCcw, Video, MessageSquare, Database, Clock, Trophy,
} from 'lucide-react';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { HeroFallback } from '../components/3d/HeroFallback';

const HeroScene = lazy(() => import('../components/3d/HeroScene'));

// ── ANIMATED COUNTER ──────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, to, {
      duration: 1.8, ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix; },
    });
    return () => ctrl.stop();
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

// ── BEAM LINE ──────────────────────────────────────────────────────────────────
function BeamLine({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="h-px w-full bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        initial={{ x: '-100%' }} animate={{ x: '100%' }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
      />
    </div>
  );
}

// ── GRID PATTERN ──────────────────────────────────────────────────────────────
function GridBg() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    />
  );
}

// ── DATA ───────────────────────────────────────────────────────────────────────
const CODE_LINES = [
  { code: 'function twoSum(nums: number[], target: number) {', key: 0 },
  { code: '  const map = new Map<number, number>();', key: 1, hl: true },
  { code: '  for (let i = 0; i < nums.length; i++) {', key: 2 },
  { code: '    const comp = target - nums[i];', key: 3 },
  { code: '    if (map.has(comp)) {', key: 4 },
  { code: '      return [map.get(comp)!, i];', key: 5, hl: true },
  { code: '    }', key: 6 },
  { code: '    map.set(nums[i], i);', key: 7 },
  { code: '  }', key: 8 },
  { code: '}', key: 9 },
];

const STEPS = [
  { n: '01', icon: Link2, color: '#137fec', title: 'Create a room', desc: 'Choose a problem from the library, set the language, and get a shareable link in under 30 seconds.' },
  { n: '02', icon: FileCode2, color: '#af25f4', title: 'Code together', desc: 'Both participants type in the same Monaco editor live. Run code against test cases with Piston execution.' },
  { n: '03', icon: Brain, color: '#ccff00', title: 'AI evaluation', desc: 'Instant AI-powered feedback — complexity detection, bug reports, and quality scoring after each run.' },
  { n: '04', icon: BarChart3, color: '#137fec', title: 'Review & decide', desc: 'End the session for a structured report with AI scores, code replay, and full chat transcript.' },
];

const BENTO_FEATURES = [
  {
    id: 'editor', wide: true, icon: Code2, color: '#137fec',
    title: 'Live VS Code Environment',
    desc: 'Monaco Editor with full syntax highlighting, IntelliSense, multi-cursor, and all familiar shortcuts. Candidates feel at home — not fighting the tool.',
    badge: 'Monaco Editor',
    demo: (
      <div className="font-mono text-xs leading-6 select-none mt-4 overflow-hidden">
        {CODE_LINES.slice(0, 6).map(l => (
          <div key={l.key} className={`px-2 rounded ${(l as any).hl ? 'bg-accent/10 text-accent' : 'text-[#A6AAB0]'}`}>{l.code}</div>
        ))}
      </div>
    ),
  },
  {
    id: 'ai', wide: false, icon: Brain, color: '#af25f4',
    title: 'AI Code Analysis',
    desc: 'Instant complexity scoring, bug detection, and improvement suggestions powered by advanced AI.',
    badge: 'AI Powered',
    demo: (
      <div className="mt-4 space-y-2">
        {[['Time', 'O(n)', false], ['Space', 'O(n)', false], ['Score', '9/10', true]].map(([k, v, accent]) => (
          <div key={k as string} className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <span className="text-xs text-[#6B7178]">{k}</span>
            <span className={`text-xs font-bold ${accent ? 'text-accent' : 'text-accent-tertiary'}`}>{v}</span>
          </div>
        ))}
        <div className="text-[10px] text-accent-tertiary text-center pt-1">&#10003; Correct — passes all test cases</div>
      </div>
    ),
  },
  {
    id: 'langs', wide: false, icon: Terminal, color: '#ccff00',
    title: '12+ Languages',
    desc: 'Python, TypeScript, Go, Java, Rust, C++, Ruby, Swift — all sandboxed via Piston Runtime.',
    badge: 'Piston Runtime',
    demo: (
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['Python', 'TypeScript', 'Go', 'Java', 'Rust', 'C++', 'Ruby', 'Swift'].map(l => (
          <span key={l} className="text-[10px] px-2 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#A6AAB0] font-mono">{l}</span>
        ))}
      </div>
    ),
  },
  {
    id: 'sync', wide: false, icon: GitMerge, color: '#137fec',
    title: 'CRDT Real-Time Sync',
    desc: 'Yjs conflict-free sync — every keystroke propagates under 50ms with zero merge conflicts.',
    badge: 'Yjs CRDTs',
    demo: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
          <span className="text-xs text-[#A6AAB0]">AK — typing...</span>
          <span className="ml-auto text-[10px] font-mono text-accent">12ms</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse shrink-0" />
          <span className="text-xs text-[#A6AAB0]">RS — reviewing</span>
          <span className="ml-auto text-[10px] font-mono text-accent-secondary">18ms</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden mt-2">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-accent to-accent-secondary animate-pulse" />
        </div>
      </div>
    ),
  },
  {
    id: 'replay', wide: false, icon: Layers, color: '#af25f4',
    title: 'Session Replay',
    desc: 'Review any interview like a video — code snapshots every 30s, full AI report post-session.',
    badge: 'Auto-snapshot',
    demo: (
      <div className="mt-4 space-y-1.5">
        {['0:00 — Room opened', '2:15 — First approach', '14:40 — Optimized to O(n)', '22:10 — AI analysis run'].map((e, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px] text-[#6B7178]">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary shrink-0" />
            {e}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'security', wide: true, icon: ShieldCheck, color: '#0EA5A4',
    title: 'Enterprise-Ready Security',
    desc: 'Argon2id password hashing, JWT refresh rotation, Helmet headers, rate limiting, CORS, and GDPR-compliant data handling. Security is not an afterthought.',
    badge: 'SOC 2 Ready',
    demo: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {['TLS 1.2+', 'Argon2id', 'GDPR', 'Rate Limit', 'CORS', 'Audit Log'].map(f => (
          <div key={f} className="flex items-center gap-1.5 text-[10px] text-[#A6AAB0]">
            <Check size={10} className="text-green-400 shrink-0" /> {f}
          </div>
        ))}
      </div>
    ),
  },
];

const METRICS = [
  { value: 10000, suffix: '+', label: 'Interviews Conducted' },
  { value: 50, suffix: 'ms', label: 'Avg Sync Latency' },
  { value: 12, suffix: '+', label: 'Languages Supported' },
  { value: 99, suffix: '%+', label: 'Uptime' },
];

const PROBLEMS = [
  { title: 'Two Sum', difficulty: 'EASY', tags: ['HashMap', 'Two Pointer'], time: '~20 min' },
  { title: 'LRU Cache', difficulty: 'MEDIUM', tags: ['LinkedList', 'HashMap'], time: '~45 min' },
  { title: 'Word Break', difficulty: 'MEDIUM', tags: ['DP', 'BFS'], time: '~40 min' },
  { title: 'Merge K Sorted Lists', difficulty: 'HARD', tags: ['Heap', 'Divide & Conquer'], time: '~50 min' },
];

const DIFF_CLS: Record<string, string> = {
  EASY: 'bg-green-500/10 border-green-500/20 text-green-400',
  MEDIUM: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  HARD: 'bg-red-500/10 border-red-500/20 text-red-400',
};

const TESTIMONIALS = [
  { name: 'Rahul S.', role: 'Engineering Manager · Flipkart', text: 'We cut interview setup time from 20 minutes to under a minute. The AI analysis gives consistent, objective feedback that supplements our human evaluation.' },
  { name: 'Priya M.', role: 'Senior SDE · Amazon', text: "The session replay feature is a game-changer. Scrubbing through a candidate's thought process — including every keystroke — reveals so much more than the final solution." },
  { name: 'Alex K.', role: 'Tech Lead · Stripe', text: "Monaco Editor means candidates use the same tool they code in daily. No fighting a custom editor. The real-time collaboration just works." },
  { name: 'Wei L.', role: 'Staff Engineer · Google', text: 'The AI complexity analysis catches things humans miss under time pressure. O(n log n) vs O(n²) is immediately surfaced without the interviewer needing to calculate.' },
  { name: 'Samantha B.', role: 'VP Engineering · Razorpay', text: 'We ran 500+ interviews last quarter. The structured reports helped us standardize evaluation across 8 interviewers with dramatically better consistency.' },
  { name: 'David C.', role: 'CTO · YC W24 Startup', text: 'Free, open, no vendor lock-in, and it handles WebRTC, Monaco, and AI analysis out of the box. Would have taken months to build in-house.' },
];

const FEATURES_GRID = [
  { icon: Video, title: 'HD Video + Screen Share', desc: 'WebRTC peer connections with mute, camera, and screen-share controls.' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Persistent chat with code snippets and system events during the session.' },
  { icon: Database, title: 'Snapshot History', desc: 'Code auto-saved every 30s. Full history browsable after the session ends.' },
  { icon: Clock, title: 'Session Timer', desc: 'Elapsed time shown to all participants. End session to generate the final report.' },
  { icon: Lock, title: 'Secure by Default', desc: 'JWT auth, rate-limited endpoints, Argon2id hashes, and audit trail on every action.' },
  { icon: RefreshCcw, title: 'Instant Replay', desc: 'Reconstruct any interview step-by-step with playback speed controls.' },
  { icon: Trophy, title: 'Structured Reports', desc: 'AI score, complexity analysis, bug list, and recruiter notes — all in one view.' },
  { icon: Globe, title: 'Multi-language', desc: 'Starter code in every language, test cases included, Piston-executed.' },
];

const TECH_STACK = ['Monaco Editor', 'Yjs CRDTs', 'WebRTC', 'Socket.IO', 'Piston API', 'MongoDB', 'Redis', 'BullMQ', 'TypeScript', 'React + Vite', 'Node.js', 'Docker', 'Kubernetes'];

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function Landing() {
  const [visibleLines, setVisibleLines] = useState(0);
  const demoRef = useRef<HTMLDivElement>(null);
  const demoInView = useInView(demoRef, { once: true });

  useEffect(() => {
    if (!demoInView) return;
    let i = 0;
    const t = setInterval(() => { i++; setVisibleLines(i); if (i >= CODE_LINES.length) clearInterval(t); }, 110);
    return () => clearInterval(t);
  }, [demoInView]);

  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-bg-900 overflow-hidden">
      <style>{`
        @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: scrollLeft 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* 1. HERO */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center mt-[-64px] pt-16">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<HeroFallback />}><HeroScene /></Suspense>
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(19,127,236,0.08) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-mono text-[#A6AAB0] uppercase tracking-wider">Open beta · Free for engineering teams</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-[80px] font-bold tracking-tight text-white leading-[1.02] mb-6">
            The interview platform<br />
            <span className="bg-gradient-to-r from-[#137fec] via-[#af25f4] to-[#ccff00] bg-clip-text text-transparent">
              built for real engineers.
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#6B7178] max-w-2xl mb-12 leading-relaxed">
            Real-time collaborative Monaco editor, AI-powered code analysis, sandboxed execution in 12+ languages, and structured session reports — all in one link.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-all text-sm shadow-2xl group">
              Start for free <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 px-8 py-4 border border-[#333] text-white font-medium rounded-xl hover:border-[#555] transition-all text-sm">
              <Play size={14} /> See how it works
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex items-center gap-8 mt-14 flex-wrap justify-center">
            {['No credit card', 'Free forever', 'Open source'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[#444]">
                <Check size={11} className="text-accent" /> {item}
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#2a2a2a] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#333] to-transparent" />
        </motion.div>
      </section>

      {/* 2. TECH MARQUEE */}
      <section className="w-full py-10 border-y border-[#111] bg-[#070709] overflow-hidden">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#070709] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#070709] to-transparent z-10 pointer-events-none" />
          <div className="flex overflow-hidden">
            <div className="marquee-track flex items-center gap-12 whitespace-nowrap">
              {[...TECH_STACK, ...TECH_STACK].map((t, i) => (
                <span key={i} className="text-[11px] font-mono text-[#2a2a2a] uppercase tracking-[0.2em] flex items-center gap-4">
                  {t} <span className="w-1 h-1 rounded-full bg-[#2a2a2a] inline-block shrink-0" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO FEATURES */}
      <section className="w-full py-24 sm:py-32 border-t border-[#111] bg-bg-900 relative">
        <GridBg />
        <BeamLine className="top-0 left-0 right-0 h-px w-full" />
        <div className="ns-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">Capabilities</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">Everything you need.<br />Nothing you don&apos;t.</h2>
            <p className="text-[#6B7178] text-lg">A complete interview stack — no stitching tools together.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] gap-4">
            {BENTO_FEATURES.map((feat, i) => (
              <motion.div key={feat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className={feat.wide ? 'md:col-span-2' : ''}>
                <SpotlightCard spotlightColor={feat.color + '30'}
                  className="h-full p-6 rounded-2xl border border-[#1a1a1a] bg-[#0B1220] hover:border-[#2a2a2a] transition-all duration-300 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}25` }}>
                      <feat.icon size={18} style={{ color: feat.color }} />
                    </div>
                    <span className="text-[9px] font-mono px-2 py-1 rounded-full border border-white/[0.06] bg-white/[0.03] text-[#6B7178] uppercase tracking-wider">{feat.badge}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-[#6B7178] leading-relaxed flex-1">{feat.desc}</p>
                  <div className="shrink-0">{feat.demo}</div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIVE DEMO */}
      <section ref={demoRef} className="w-full py-24 border-t border-[#111] bg-[#0F1722] relative">
        <GridBg />
        <div className="ns-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">Live Collaboration</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Both of you in the<br />same editor. Always.</h2>
              <p className="text-[#6B7178] mb-8 leading-relaxed">Yjs CRDT sync means every keystroke appears in under 50ms. No refreshes, no conflicts. The interviewer sees exactly what the candidate sees — in real time.</p>
              <ul className="space-y-3 mb-8">
                {['Multi-cursor presence — coloured badges per participant', 'Language selector syncs both users instantly', 'Code auto-saved as snapshots every 30 seconds'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#A6AAB0]">
                    <Check size={14} className="text-accent shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/create-session" className="inline-flex items-center gap-2 text-white font-semibold hover:text-accent transition-colors group">
                Try it now <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ perspective: '1200px' }}>
              <motion.div whileHover={{ rotateX: -3, rotateY: 5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="rounded-2xl border border-[#1a1a1a] bg-[#0B1220] shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
                <div className="flex items-center gap-2 px-4 h-10 bg-[#111827] border-b border-[#1a1a1a]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" /><div className="w-3 h-3 rounded-full bg-[#FFBD2E]" /><div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <span className="ml-3 text-xs font-mono text-[#6B7178]">twoSum.ts — Standor Interview</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <div className="flex -space-x-1">
                      {['var(--accent)', 'var(--accent-secondary)'].map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-[#0B1220] flex items-center justify-center text-[8px] font-bold text-white" style={{ background: c }}>{['AK', 'RS'][i]}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-5 font-mono text-xs leading-7 min-h-[220px]">
                  {CODE_LINES.map((line, i) => (
                    <div key={line.key} className={`flex items-center transition-all duration-300 rounded px-1 ${i < visibleLines ? 'opacity-100' : 'opacity-0'} ${(line as any).hl ? 'bg-accent/10' : ''}`}>
                      <span className="text-[#2a2a2a] w-5 text-right mr-4 shrink-0 select-none">{i + 1}</span>
                      <span className={(line as any).hl ? 'text-accent' : 'text-[#A6AAB0]'}>{line.code}</span>
                      {i === visibleLines - 1 && <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-t border-[#1a1a1a] bg-[#0B1220]/60">
                  <span className="text-[10px] font-mono text-[#6B7178]">TypeScript · Piston Runtime</span>
                  <button className="flex items-center gap-1.5 text-[10px] font-bold text-black bg-accent px-3 py-1 rounded-md"><Play size={9} fill="black" /> Run</button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                className="mt-3 mx-4 p-4 rounded-xl border border-accent-secondary/30 bg-accent-secondary/10 flex items-center gap-4">
                <Brain size={20} className="text-accent-secondary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">AI Analysis complete</p>
                  <p className="text-[10px] text-[#6B7178] truncate">O(n) time · O(n) space · Score 9/10 · No bugs found</p>
                </div>
                <span className="text-[10px] font-bold text-accent-tertiary shrink-0">✓ Correct</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="w-full py-24 sm:py-32 border-t border-[#111] bg-bg-900">
        <div className="ns-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">Workflow</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">From invite to report<br />in minutes.</h2>
            <p className="text-[#6B7178] text-lg">No setup. No installs. Share a link and start coding.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative p-7 rounded-2xl border border-[#1a1a1a] bg-[#0B1220] hover:border-[#2a2a2a] transition-colors group">
                <div className="flex items-start justify-between mb-6">
                  <span className="text-[10px] font-mono text-[#222]">{step.n}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${step.color}15`, border: `1px solid ${step.color}25` }}>
                    <step.icon size={16} style={{ color: step.color }} />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-accent transition-colors">{step.title}</h3>
                <p className="text-sm text-[#6B7178] leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && <ChevronRight size={14} className="absolute -right-3 top-1/2 -translate-y-1/2 text-[#222] hidden lg:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. METRICS */}
      <section className="w-full py-20 border-t border-[#111] bg-[#0F1722] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(19,127,236,0.05) 0%, transparent 70%)' }} />
        <div className="ns-container relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {METRICS.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2 tabular-nums">
                  <Counter to={m.value} suffix={m.suffix} />
                </div>
                <p className="text-[11px] font-mono text-[#6B7178] uppercase tracking-wider">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PROBLEM LIBRARY */}
      <section className="w-full py-24 sm:py-32 border-t border-[#111] bg-bg-900">
        <div className="ns-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">Problem Library</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">100+ curated problems.<br />Ready to use instantly.</h2>
              <p className="text-[#6B7178] mb-8 leading-relaxed">Handpicked EASY, MEDIUM, and HARD problems across algorithms, data structures, system design, and dynamic programming. Starter code in every language, test cases included.</p>
              <div className="flex gap-3">
                <Link to="/problems" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-all">Browse library <ArrowRight size={14} /></Link>
                <Link to="/create-session" className="inline-flex items-center gap-2 px-6 py-3 border border-[#333] text-white font-medium rounded-xl hover:border-white/40 transition-all">Start interview</Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-2.5">
              {PROBLEMS.map((p, i) => (
                <motion.div key={p.title} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#1a1a1a] bg-[#0B1220] hover:border-[#333] transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${DIFF_CLS[p.difficulty]}`}>{p.difficulty}</span>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors">{p.title}</p>
                      <p className="text-[10px] text-[#6B7178] font-mono mt-0.5">{p.tags.slice(0, 2).join(' · ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#6B7178]">
                    <span className="text-[10px] font-mono hidden sm:block">{p.time}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
              <div className="text-center pt-2">
                <Link to="/problems" className="text-xs text-[#333] hover:text-[#6B7178] transition-colors">+ 96 more problems in the library →</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. PLATFORM FEATURES GRID */}
      <section className="w-full py-24 border-t border-[#111] bg-[#0F1722] relative">
        <GridBg />
        <div className="ns-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 max-w-xl mx-auto">
            <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for scale from day one.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES_GRID.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-[#1a1a1a] bg-[#0B1220] hover:border-[#2a2a2a] transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-accent/30 transition-colors">
                  <f.icon size={15} className="text-[#6B7178] group-hover:text-accent transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{f.title}</h4>
                <p className="text-[11px] text-[#6B7178] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="w-full py-24 sm:py-32 border-t border-[#111] bg-bg-900">
        <div className="ns-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">Trusted by teams</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Engineers love Standor.</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="p-6 rounded-2xl border border-[#1a1a1a] bg-[#0B1220] hover:border-[#2a2a2a] transition-colors flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-3 h-3 fill-accent" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[#A6AAB0] leading-relaxed flex-1">"{t.text}"</p>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-[11px] text-[#6B7178]">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="w-full py-28 border-t border-[#111] relative overflow-hidden bg-[#0F1722]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-accent/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-accent-secondary/10 blur-[80px] rounded-full" />
        </div>
        <BeamLine className="top-0 left-0 right-0 h-px w-full" />
        <div className="ns-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-accent/30 bg-accent/10">
              <Sparkles size={13} className="text-accent" />
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider">Free forever — no credit card required</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">Ready to run<br />better interviews?</h2>
            <p className="text-[#6B7178] text-lg mb-12 max-w-lg mx-auto leading-relaxed">Create your first interview room in 30 seconds. No setup, no installs, no credit card.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-100 transition-all shadow-2xl group">
                Get Started Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/how-it-works" className="inline-flex items-center gap-2 px-10 py-4 border border-[#333] text-white font-medium rounded-xl hover:border-[#555] transition-all">
                See how it works
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 mt-14 flex-wrap">
              {['No credit card', 'Unlimited rooms', 'Open source'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#555]">
                  <Check size={11} className="text-accent" /> {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
