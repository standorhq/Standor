'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import {
  Play, Loader2, Video, VideoOff, Mic, MicOff,
  MessageSquare, Sparkles, Copy, LogOut, Clock, Users,
  ChevronRight, Zap, Bug, Lightbulb
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useYjsSync } from '@/hooks/useYjsSync';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Session, Message, AIAnalysis } from '@/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGES = [
  { id: 'javascript', label: 'JS' },
  { id: 'typescript', label: 'TS' },
  { id: 'python',     label: 'Python' },
  { id: 'java',       label: 'Java' },
  { id: 'cpp',        label: 'C++' },
  { id: 'go',         label: 'Go' },
  { id: 'rust',       label: 'Rust' },
];

type RightTab = 'chat' | 'ai';

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function langFilename(lang: string) {
  const map: Record<string, string> = {
    javascript: 'solution.js', typescript: 'solution.ts',
    python: 'solution.py', java: 'Solution.java',
    cpp: 'solution.cpp', go: 'solution.go', rust: 'solution.rs',
  };
  return map[lang] ?? 'solution.txt';
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const socket = useSocket();

  const [language, setLanguage]   = useState('javascript');
  const [output, setOutput]       = useState('');
  const [running, setRunning]     = useState(false);
  const [analysis, setAnalysis]   = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [videoOn, setVideoOn] = useState(false);
  const [micOn, setMicOn]     = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  const [elapsed, setElapsed]     = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [rightTab, setRightTab]   = useState<RightTab>('chat');
  const [rightOpen, setRightOpen] = useState(true);
  const [outputOpen, setOutputOpen] = useState(false);

  const { code, setCode, editorRef } = useYjsSync(roomId, language);

  const { data: session } = useQuery<Session>({
    queryKey: ['session', roomId],
    queryFn: () => api.get(`/api/sessions/${roomId}`).then((r) => r.data),
    enabled: !!roomId,
  });

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => setMessages((m) => [...m, msg]);
    socket.on('chat-message', handler);
    return () => { socket.off('chat-message', handler); };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const id = setInterval(async () => {
      if (!code.trim()) return;
      await api.post(`/api/sessions/${roomId}/snapshot`, { content: code, language }).catch(() => null);
    }, 30_000);
    return () => clearInterval(id);
  }, [code, language, roomId]);

  const runCode = useCallback(async () => {
    setRunning(true);
    setOutput('');
    setOutputOpen(true);
    try {
      const { data } = await api.post('/api/code/execute', { language, code });
      setOutput(data.run?.output ?? data.run?.stderr ?? 'No output');
    } catch {
      setOutput('Execution failed. Check language/syntax.');
    } finally {
      setRunning(false);
    }
  }, [code, language]);

  const analyzeCode = useCallback(async () => {
    setAnalyzing(true);
    setRightTab('ai');
    setRightOpen(true);
    try {
      const { data } = await api.post(`/api/sessions/${roomId}/analyze`, { code, language });
      setAnalysis(data.aiAnalysis);
    } catch {
      toast.error('AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }, [code, language, roomId]);

  const sendChat = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    const msg: Message = { sender: user?.name ?? 'You', text: chatInput.trim(), ts: Date.now() };
    socket.emit('chat-message', { roomId, ...msg });
    setMessages((m) => [...m, msg]);
    setChatInput('');
  }, [chatInput, socket, roomId, user]);

  const toggleVideo = useCallback(async () => {
    if (!videoOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micOn });
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setVideoOn(true);
      } catch {
        toast.error('Camera access denied');
      }
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setVideoOn(false);
    }
  }, [videoOn, micOn]);

  const diffBadge = session?.difficulty?.toLowerCase();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base text-text-primary">

      {/* ── Top bar (64px) ──────────────────────────────────────────────── */}
      <header className="flex h-[var(--topbar-h)] shrink-0 items-center justify-between border-b border-border bg-bg-surface px-4 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-teal-500/15" aria-hidden="true">
            <Zap className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <span className="hidden text-sm font-semibold text-text-primary sm:block truncate max-w-[200px]">
            {session?.problem ?? roomId}
          </span>
          {diffBadge && (
            <span className={`badge text-xs ${
              diffBadge === 'easy' ? 'badge-teal' : diffBadge === 'medium' ? 'badge-amber' : 'badge-error'
            }`}>
              {diffBadge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select language"
            className="h-8 rounded-lg border border-border bg-bg-elevated px-2.5 text-xs text-text-primary
                       focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 font-mono text-xs text-text-secondary" aria-label={`Elapsed: ${fmt(elapsed)}`}>
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {fmt(elapsed)}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-secondary" aria-label="2 participants">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />2
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { navigator.clipboard.writeText(roomId).catch(() => null); toast.success('Room ID copied'); }}
            className="btn-ghost h-8 px-2 text-xs"
            aria-label="Copy room ID"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button onClick={runCode} disabled={running} className="btn-run h-8 px-3 text-xs">
            {running
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Running code" />
              : <><Play className="h-3.5 w-3.5" aria-hidden="true" />Run</>}
          </button>
          <button onClick={analyzeCode} disabled={analyzing} className="btn-primary h-8 px-3 text-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {analyzing ? 'Analyzing…' : 'AI'}
          </button>
          <a href="/dashboard" className="btn-ghost h-8 px-2 text-xs" aria-label="Leave room">
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* ── Three-column body ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT RAIL: problem + participants + video (20% / 280px) ── */}
        <aside
          className="flex w-[280px] shrink-0 flex-col border-r border-border bg-bg-surface overflow-y-auto scrollbar-thin"
          aria-label="Problem description and participants"
        >
          <div className="border-b border-border p-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">Problem</p>
            <h2 className="text-sm font-semibold text-text-primary leading-snug">
              {session?.problem ?? 'Loading…'}
            </h2>
          </div>

          <div className="p-4 border-b border-border">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">Participants</p>
            <ul className="space-y-2" aria-label="Participants">
              {[user?.name ?? 'You', 'Candidate'].map((name, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-xs font-bold text-teal-400" aria-hidden="true">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-text-primary">{name}</span>
                  {i === 0 && <span className="ml-auto text-xs text-text-tertiary">You</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Video strip */}
          <div className="mt-auto p-4 space-y-3">
            <div className="aspect-video overflow-hidden rounded-lg bg-bg-panel">
              <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" aria-label="Remote video" />
              {!videoOn && (
                <div className="flex h-full items-center justify-center text-xs text-text-tertiary">Remote video</div>
              )}
            </div>
            <div className="relative h-16 overflow-hidden rounded-lg bg-bg-elevated">
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" aria-label="Your camera" />
              {!videoOn && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-text-tertiary">You</div>
              )}
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={toggleVideo}
                aria-label={videoOn ? 'Turn off camera' : 'Turn on camera'}
                className={`rounded-full p-2 transition-colors duration-120 ${
                  videoOn ? 'bg-teal-500/20 text-teal-400' : 'bg-bg-elevated text-text-tertiary hover:bg-bg-panel'
                }`}
              >
                {videoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setMicOn((v) => !v)}
                aria-label={micOn ? 'Mute' : 'Unmute'}
                className={`rounded-full p-2 transition-colors duration-120 ${
                  micOn ? 'bg-teal-500/20 text-teal-400' : 'bg-bg-elevated text-text-tertiary hover:bg-bg-panel'
                }`}
              >
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </aside>

        {/* ── CENTER: Editor (flex-grow) + output console drawer ── */}
        <main className="flex flex-1 flex-col overflow-hidden bg-bg-card">
          {/* Editor tab bar */}
          <div className="flex h-9 items-center border-b border-border bg-bg-panel shrink-0">
            <div className="editor-tab-active">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" />
              {langFilename(language)}
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={(v) => setCode(v ?? '')}
              onMount={(editor) => { editorRef.current = editor; }}
              theme="vs-dark"
              options={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 14,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                renderLineHighlight: 'gutter',
                overviewRulerLanes: 0,
                scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
              }}
            />
          </div>

          {/* Output drawer */}
          <div
            className={`shrink-0 border-t border-border bg-bg-panel transition-[height] duration-220 ease-[var(--ease-enter)] ${
              outputOpen ? 'h-40' : 'h-9'
            }`}
          >
            <button
              onClick={() => setOutputOpen((v) => !v)}
              aria-expanded={outputOpen}
              aria-label={outputOpen ? 'Collapse output' : 'Expand output'}
              className="flex h-9 w-full items-center gap-2 px-4 text-xs font-medium text-text-tertiary
                         transition-colors duration-120 hover:text-text-secondary"
            >
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform duration-180 ${outputOpen ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
              Output
              {output && !outputOpen && (
                <span className="ml-2 rounded-full bg-teal-500/10 px-2 py-0.5 text-teal-400">new</span>
              )}
            </button>
            {outputOpen && (
              <div
                className="h-[calc(100%-2.25rem)] overflow-y-auto px-4 pb-4 scrollbar-thin"
                role="region"
                aria-label="Code execution output"
              >
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-secondary">
                  {output || 'Run your code to see output here.'}
                </pre>
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT: Chat / AI sidebar (collapsible 320px) ── */}
        <aside
          className={`flex flex-col border-l border-border bg-bg-surface overflow-hidden
                      transition-[width] duration-220 ease-[var(--ease-enter)] ${
            rightOpen ? 'w-[var(--editor-sidebar)]' : 'w-10'
          }`}
          aria-label="Chat and AI analysis panel"
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setRightOpen((v) => !v)}
            aria-label={rightOpen ? 'Collapse panel' : 'Expand panel'}
            className="flex h-9 w-full shrink-0 items-center justify-end border-b border-border px-3
                       text-text-tertiary transition-colors duration-120 hover:text-text-secondary"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-220 ${rightOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {rightOpen && (
            <>
              {/* Tab bar */}
              <div className="flex shrink-0 border-b border-border" role="tablist">
                {([['chat', MessageSquare, 'Chat'], ['ai', Sparkles, 'AI Analysis']] as const).map(([t, Icon, label]) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={rightTab === t}
                    onClick={() => setRightTab(t)}
                    className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors duration-120 ${
                      rightTab === t
                        ? 'border-b-2 border-teal-500 text-teal-400'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Chat ── */}
              {rightTab === 'chat' && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div
                    className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin"
                    role="log"
                    aria-live="polite"
                    aria-label="Chat messages"
                  >
                    {messages.length === 0 && (
                      <p className="py-10 text-center text-xs text-text-tertiary">No messages yet.</p>
                    )}
                    {messages.map((msg, i) => {
                      const isOwn = msg.sender === (user?.name ?? 'You');
                      return (
                        <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                            isOwn ? 'bg-teal-500/15 text-teal-100' : 'bg-bg-elevated text-text-primary'
                          }`}>
                            {!isOwn && <p className="mb-0.5 font-semibold text-teal-400">{msg.sender}</p>}
                            <p>{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={sendChat} className="shrink-0 border-t border-border p-3">
                    <div className="flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Message…"
                        aria-label="Chat message"
                        className="flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-1.5
                                   text-xs text-text-primary placeholder:text-text-tertiary
                                   focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                      />
                      <button type="submit" className="btn-primary h-8 px-3 text-xs">Send</button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── AI Analysis ── */}
              {rightTab === 'ai' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin" aria-label="AI analysis results">
                  {analyzing && (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <Loader2 className="h-7 w-7 animate-spin text-teal-400" aria-label="Analyzing" />
                      <p className="text-xs text-text-tertiary">Analyzing code…</p>
                    </div>
                  )}
                  {!analyzing && !analysis && (
                    <div className="py-16 text-center">
                      <Sparkles className="mx-auto mb-3 h-7 w-7 text-text-tertiary opacity-40" aria-hidden="true" />
                      <p className="text-xs text-text-tertiary">
                        Click <strong className="text-text-secondary">AI</strong> in the toolbar for instant feedback.
                      </p>
                    </div>
                  )}
                  {analysis && !analyzing && (
                    <div className="space-y-3 animate-fade-in">
                      {/* Score + confidence meter */}
                      <div className="card-flat p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="analysis-card__label">Score</p>
                          <span className="text-2xl font-extrabold text-teal-400">
                            {analysis.overallScore}<span className="text-sm font-medium text-text-tertiary">/10</span>
                          </span>
                        </div>
                        <div className="confidence-meter" aria-label={`Score ${analysis.overallScore} out of 10`}>
                          <div className="confidence-meter__fill" style={{ width: `${(analysis.overallScore / 10) * 100}%` }} />
                        </div>
                      </div>

                      {/* Complexity */}
                      <div className="card-flat p-4 space-y-2.5">
                        {[
                          { label: 'Time complexity',  value: analysis.timeComplexity  },
                          { label: 'Space complexity', value: analysis.spaceComplexity },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="analysis-card__label">{label}</p>
                            <p className="analysis-card__value">{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Bugs */}
                      {analysis.bugs?.length > 0 && (
                        <div className="card-flat p-4">
                          <div className="mb-2 flex items-center gap-1.5">
                            <Bug className="h-3.5 w-3.5 text-status-error" aria-hidden="true" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-status-error">Bugs</p>
                          </div>
                          <ul className="space-y-1.5">
                            {analysis.bugs.map((b, i) => (
                              <li key={i} className="text-xs leading-relaxed text-text-secondary">• {b}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggestions */}
                      {analysis.suggestions?.length > 0 && (
                        <div className="card-flat p-4">
                          <div className="mb-2 flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Suggestions</p>
                          </div>
                          <ul className="space-y-1.5">
                            {analysis.suggestions.map((s, i) => (
                              <li key={i} className="text-xs leading-relaxed text-text-secondary">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Summary */}
                      {analysis.summary && (
                        <div className="card-flat p-4">
                          <p className="analysis-card__label mb-1.5">Summary</p>
                          <p className="text-xs leading-relaxed text-text-secondary">{analysis.summary}</p>
                        </div>
                      )}

                      <button onClick={analyzeCode} className="btn-secondary w-full justify-center py-2 text-xs">
                        Re-analyze
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
