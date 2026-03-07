import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2, Video, Zap, ArrowRight, CheckCircle, Star,
  Shield, Clock, BarChart2, ChevronRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const features = [
  { icon: Code2, title: 'Live Code Editor', desc: 'Monaco-powered editor with real-time sync, syntax highlighting, and 10+ languages.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Video, title: 'Face-to-Face Video', desc: 'Crystal-clear WebRTC video and audio — no plugins, just your browser.', gradient: 'from-violet-500 to-purple-600' },
  { icon: Zap, title: 'AI Code Analysis', desc: 'DeepSeek-powered analysis: time complexity, bugs, suggestions — in seconds.', gradient: 'from-pink-500 to-rose-500' },
  { icon: BarChart2, title: 'Instant Execution', desc: 'Run code in 20+ languages via Piston API. See results immediately.', gradient: 'from-amber-500 to-orange-500' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT-secured sessions. Your code and interviews stay private.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Clock, title: 'Session Snapshots', desc: 'Automatic code snapshots every 30 seconds. Review the full timeline.', gradient: 'from-sky-500 to-blue-600' }
];

const steps = [
  { step: '01', title: 'Create a Room', desc: 'Pick a problem, set difficulty, share the link.' },
  { step: '02', title: 'Code Together', desc: 'Both parties type in the same editor, in real-time.' },
  { step: '03', title: 'AI Feedback', desc: 'Get instant analysis on correctness, complexity, style.' },
  { step: '04', title: 'Email Report', desc: 'Receive a detailed report after the session ends.' }
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-hidden">
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-base-100/80 border-b border-base-300/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl gradient-text font-mono tracking-wide">Standor</span>
              <p className="text-xs text-base-content/50 -mt-0.5">Code Together</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm rounded-xl">
                Dashboard <ArrowRight className="size-4" />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm rounded-xl">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-xl">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="size-4" />
            AI-Powered Technical Interviews
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl md:text-7xl font-black leading-tight mb-6">
            The smarter way to
            <br />
            <span className="gradient-text">conduct interviews</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-base-content/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time collaborative coding, face-to-face video, AI analysis, and automated reports.
            Everything a technical interview needs — in one beautiful platform.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="btn btn-primary btn-lg rounded-2xl gap-2 shadow-lg shadow-primary/25"
            >
              Start for Free <ArrowRight className="size-5" />
            </Link>
            <a href="#how-it-works" className="btn btn-ghost btn-lg rounded-2xl gap-2 border border-base-300">
              See how it works <ChevronRight className="size-5" />
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center gap-8 text-sm text-base-content/50 flex-wrap">
            {['100% Free Stack', 'No Credit Card', 'Open Source'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="size-4 text-success" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Preview window */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 max-w-5xl mx-auto rounded-2xl border border-base-300 bg-base-200 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-base-300 border-b border-base-300">
            <div className="size-3 rounded-full bg-error/70" />
            <div className="size-3 rounded-full bg-warning/70" />
            <div className="size-3 rounded-full bg-success/70" />
            <span className="ml-3 text-xs text-base-content/40 font-mono">two-sum.js — Interview Room #A9K2</span>
          </div>
          <div className="grid grid-cols-3 h-64">
            <div className="col-span-2 p-6 font-mono text-sm text-left overflow-hidden border-r border-base-300">
              <div className="text-base-content/30 mb-2">{'// Two Sum — find indices that sum to target'}</div>
              <div><span className="text-blue-400">function </span><span className="text-yellow-400">twoSum</span><span>(nums, target) {'{'}</span></div>
              <div className="ml-4"><span className="text-blue-400">const </span><span>map = </span><span className="text-blue-400">new </span><span className="text-yellow-400">Map</span><span>();</span></div>
              <div className="ml-4"><span className="text-blue-400">for </span><span>(</span><span className="text-blue-400">let </span><span>i = 0; i {'<'} nums.length; i++) {'{'}</span></div>
              <div className="ml-8"><span className="text-blue-400">const </span><span>comp = target - nums[i];</span></div>
              <div className="ml-8"><span className="text-blue-400">if </span><span>(map.has(comp)) </span><span className="text-blue-400">return </span><span>[map.get(comp), i];</span></div>
              <div className="ml-8"><span>map.set(nums[i], i);</span></div>
              <div className="ml-4">{'}'}</div>
              <div>{'}'}</div>
            </div>
            <div className="p-4 text-xs space-y-3">
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <p className="text-success font-semibold mb-1">AI Analysis</p>
                <p className="text-base-content/60">Time: <span className="text-success">O(n)</span></p>
                <p className="text-base-content/60">Space: <span className="text-success">O(n)</span></p>
                <p className="text-base-content/60">Score: <span className="text-success font-bold">95/100</span></p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-primary font-semibold mb-1">Output</p>
                <p className="text-base-content/60 font-mono">[0, 1]</p>
                <p className="text-success text-xs mt-1">All tests passed</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-primary font-semibold mb-3">Everything you need</p>
            <h2 className="text-4xl font-black mb-4">Built for serious interviews</h2>
            <p className="text-base-content/60 max-w-xl mx-auto">Every feature is purpose-built for technical interviews. No bloat, just what matters.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon className="size-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-base-content/60 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-secondary font-semibold mb-3">Simple workflow</p>
            <h2 className="text-4xl font-black mb-4">How it works</h2>
            <p className="text-base-content/60 max-w-xl mx-auto">Go from zero to a professional technical interview in under a minute.</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-primary">{s.step}</span>
                </div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-base-content/60 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-px"
        >
          <div className="bg-base-100 rounded-[calc(1.5rem-1px)] p-16 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-[calc(1.5rem-1px)]" />
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/25">
                  <Sparkles className="size-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-black mb-4">Ready to upgrade your interviews?</h2>
              <p className="text-base-content/60 max-w-lg mx-auto mb-8">
                Join developers and hiring managers who run better technical interviews with Standor.
              </p>
              <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg rounded-2xl gap-2 shadow-lg shadow-primary/25">
                Get Started Free <ArrowRight className="size-5" />
              </Link>
              <p className="text-base-content/40 text-sm mt-4">No credit card required. Free forever.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-base-300 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-base-content/40">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="font-mono font-bold gradient-text">Standor</span>
            <span>— Code Together</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Built with 100% free tools</span>
            <span className="flex items-center gap-1"><Star className="size-3 text-warning" /> Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
