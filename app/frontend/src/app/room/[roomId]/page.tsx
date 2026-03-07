'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import {
  Play, Loader2, Video, VideoOff, Mic, MicOff,
  MessageSquare, Sparkles, Copy, LogOut, Clock, Users
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
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
];

type Tab = 'chat' | 'ai';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const socket = useSocket();

  // Editor state
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  // AI state
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Video state
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [videoOn, setVideoOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Active tab
  const [tab, setTab] = useState<Tab>('chat');

  // Yjs CRDT editor sync
  const { code, setCode, editorRef } = useYjsSync(roomId, language);

  const { data: session } = useQuery<Session>({
    queryKey: ['session', roomId],
    queryFn: () => api.get(`/api/sessions/${roomId}`).then((r) => r.data),
    enabled: !!roomId,
  });

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Socket chat handler
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => setMessages((m) => [...m, msg]);
    socket.on('chat-message', handler);
    return () => { socket.off('chat-message', handler); };
  }, [socket]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto snapshot every 30s
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
    setTab('ai');
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

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex h-screen flex-col bg-surface-dark text-slate-100">
      {/* Top bar */}
      <header className="flex h-12 items-center justify-between border-b border-slate-700/50 bg-slate-900 px-4">
        <div className="flex items-center gap-4">
          <span className="font-extrabold tracking-tight text-white">Standor</span>
          <span className="hidden text-sm font-medium text-slate-300 sm:block">
            {session?.problem ?? roomId}
          </span>
          {session?.difficulty && (
            <span className="badge-teal text-xs">{session.difficulty}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {fmt(elapsed)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5" />2
          </div>

          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>

          <button
            onClick={() => { navigator.clipboard.writeText(roomId).catch(() => null); toast.success('Copied'); }}
            className="btn-ghost px-2 py-1 text-xs text-slate-400"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          <button onClick={runCode} disabled={running} className="btn-primary px-3 py-1 text-xs">
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Play className="h-3.5 w-3.5" />Run</>}
          </button>

          <button onClick={analyzeCode} disabled={analyzing} className="btn-secondary px-3 py-1 text-xs border-slate-700 text-slate-300">
            <Sparkles className="h-3.5 w-3.5" />
            {analyzing ? 'Analyzing…' : 'AI'}
          </button>

          <a href="/dashboard" className="btn-ghost px-2 py-1 text-xs text-slate-400">
            <LogOut className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor + output */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <MonacoEditor
            height={output ? '65%' : '100%'}
            language={language}
            value={code}
            onChange={(v) => setCode(v ?? '')}
            onMount={(editor) => { editorRef.current = editor; }}
            theme="vs-dark"
            options={{
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              fontSize: 14,
              lineHeight: 22,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 },
              smoothScrolling: true,
              cursorSmoothCaretAnimation: 'on',
              formatOnPaste: true,
            }}
          />

          {output && (
            <div className="border-t border-slate-700/50 bg-slate-900 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Output</p>
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300">{output}</pre>
            </div>
          )}
        </div>

        {/* Right panel */}
        <aside className="flex w-72 flex-col border-l border-slate-700/50 bg-slate-900">
          {/* Video */}
          <div className="relative border-b border-slate-700/50 p-3">
            <div className="mb-2 aspect-video overflow-hidden rounded-xl bg-slate-800">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              {!videoOn && (
                <div className="absolute inset-3 flex items-center justify-center rounded-xl bg-slate-800 text-xs text-slate-500">
                  Remote video
                </div>
              )}
            </div>
            <div className="relative h-20 overflow-hidden rounded-lg bg-slate-700">
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {!videoOn && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">You</div>
              )}
            </div>
            <div className="mt-2 flex justify-center gap-2">
              <button
                onClick={toggleVideo}
                className={`rounded-full p-2 ${videoOn ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                aria-label="Toggle video"
              >
                {videoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setMicOn((v) => !v)}
                className={`rounded-full p-2 ${micOn ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                aria-label="Toggle mic"
              >
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700/50">
            {([['chat', MessageSquare, 'Chat'], ['ai', Sparkles, 'AI']] as const).map(([t, Icon, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  tab === t ? 'border-b-2 border-primary-500 text-primary-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Chat panel */}
          {tab === 'chat' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                {messages.map((msg, i) => {
                  const isOwn = msg.sender === (user?.name ?? 'You');
                  return (
                    <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs ${
                          isOwn ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {!isOwn && <p className="mb-0.5 font-medium text-primary-300">{msg.sender}</p>}
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendChat} className="border-t border-slate-700/50 p-3">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message…"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                  />
                  <button type="submit" className="btn-primary px-3 py-1.5 text-xs">Send</button>
                </div>
              </form>
            </div>
          )}

          {/* AI panel */}
          {tab === 'ai' && (
            <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
              {analyzing && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
                  <p className="text-xs text-slate-400">Analyzing code…</p>
                </div>
              )}
              {!analyzing && !analysis && (
                <div className="py-12 text-center text-xs text-slate-500">
                  Click <strong>AI</strong> in the toolbar to get instant code feedback.
                </div>
              )}
              {analysis && !analyzing && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Score</span>
                    <span className="text-2xl font-extrabold text-primary-400">{analysis.overallScore}<span className="text-sm text-slate-500">/10</span></span>
                  </div>

                  {[
                    { label: 'Time complexity', value: analysis.timeComplexity },
                    { label: 'Space complexity', value: analysis.spaceComplexity },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="mb-0.5 text-xs text-slate-500">{label}</p>
                      <p className="font-mono text-sm text-slate-200">{value}</p>
                    </div>
                  ))}

                  {analysis.bugs?.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400">Bugs</p>
                      <ul className="space-y-1">
                        {analysis.bugs.map((b, i) => (
                          <li key={i} className="text-xs text-slate-300">• {b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.suggestions?.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary-400">Suggestions</p>
                      <ul className="space-y-1">
                        {analysis.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.summary && (
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Summary</p>
                      <p className="text-xs leading-relaxed text-slate-300">{analysis.summary}</p>
                    </div>
                  )}

                  <button onClick={analyzeCode} className="btn-secondary w-full justify-center border-slate-700 py-2 text-xs text-slate-300">
                    Re-analyze
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
