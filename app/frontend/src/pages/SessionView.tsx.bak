import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor, { type OnMount } from '@monaco-editor/react';
type IStandaloneCodeEditor = Parameters<OnMount>[0];
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { toast } from 'sonner';
import {
  ArrowLeft, Play, Loader2, Brain, MessageSquare, ChevronDown,
  Copy, Check, Users, Square, Send, PanelLeftClose, PanelLeftOpen,
  AlertCircle, CheckCircle2, Clock, Zap, Wifi, WifiOff,
  Video, VideoOff, Mic, MicOff, PhoneOff
} from 'lucide-react';
import useStore from '../store/useStore';
import { roomsApi, codeExecutionApi, InterviewRoom, AIAnalysis, ExecutionResult } from '../utils/api';
import { MediaProvider, useMedia } from '../components/session/MediaProvider';
import { EditorSkeleton } from '../components/Skeletons';

const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-accent bg-accent/10 border-accent/20',
  MEDIUM: 'text-accent-secondary bg-accent-secondary/10 border-accent-secondary/20',
  HARD: 'text-accent-tertiary bg-accent-tertiary/10 border-accent-tertiary/20',
};

const STARTER_CODE: Record<string, string> = {
  javascript: '// Write your solution here\nfunction solution() {\n  \n}\n',
  typescript: '// Write your solution here\nfunction solution(): void {\n  \n}\n',
  python: '# Write your solution here\ndef solution():\n    pass\n',
  java: '// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}\n',
  cpp: '// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solution() {\n    \n}\n',
  go: '// Write your solution here\npackage main\n\nfunc solution() {\n\t\n}\n',
  rust: '// Write your solution here\nfn solution() {\n    \n}\n',
};

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust'];

interface ChatMessage {
  sender: string;
  text: string;
  ts: number;
  mine?: boolean;
}

type RightTab = 'ai' | 'chat';

function RemoteVideo({ stream, name }: { stream: MediaStream; name: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden border border-white/10 shadow-xl group">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity">
        {name}
      </div>
    </div>
  );
}

function SessionInner({ socket }: { socket: Socket | null }) {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useStore();
  const {
    localStream,
    remoteStreams,
    joinMedia,
    leaveMedia,
    toggleAudio,
    toggleVideo,
    audioEnabled,
    videoEnabled
  } = useMedia();

  // Room state
  const [room, setRoom] = useState<InterviewRoom | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Execution state
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // UI state
  const [rightTab, setRightTab] = useState<RightTab>('chat');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [copied, setCopied] = useState(false);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<Array<{ name: string; color: string }>>([]);

  // Yjs refs
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const yjsProviderRef = useRef<WebsocketProvider | null>(null);
  const monacoEditorRef = useRef<IStandaloneCodeEditor | null>(null);
  const [yjsConnected, setYjsConnected] = useState(false);

  // Load room
  useEffect(() => {
    if (!roomId) return;
    roomsApi.getOne(roomId)
      .then(async r => {
        setRoom(r);
        setLanguage(r.language || 'javascript');
        const lastSnap = r.codeSnapshots?.[r.codeSnapshots.length - 1];
        setCode(lastSnap?.content || STARTER_CODE[r.language || 'javascript'] || '');
        const lastAnalysis = r.analyses?.[r.analyses.length - 1];
        if (lastAnalysis) setAnalysis(lastAnalysis);
        if (r.messages?.length) {
          setMessages(r.messages.map(m => ({
            sender: m.sender,
            text: m.text,
            ts: new Date(m.timestamp).getTime(),
          })));
        }
        // Join media
        if (user?.name) joinMedia(roomId, (user as any)._id || (user as any).id, user.name);
      })
      .catch(() => toast.error('Session not found'))
      .finally(() => setLoadingRoom(false));
  }, [roomId, user]);

  // Socket logic
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on('room-info', ({ participants: p }: { participants: number }) => setParticipants(p));
    socket.on('user-joined', () => {
      setParticipants(p => p + 1);
      toast('Someone joined', { icon: '👋', duration: 2000 });
    });
    socket.on('user-left', () => setParticipants(p => Math.max(1, p - 1)));
    socket.on('chat-message', (msg: any) => {
      setMessages(prev => [...prev, { ...msg, mine: msg.sender === user?.name }]);
    });
    socket.on('user-typing', ({ userName }: { userName: string }) => {
      setTypingUsers(prev => new Set(prev).add(userName));
    });
    socket.on('user-stop-typing', ({ userName }: { userName: string }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userName);
        return next;
      });
    });

    return () => {
      socket.off('room-info');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('chat-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [socket, roomId, user?.name]);

  // Yjs Logic
  useEffect(() => {
    if (!roomId || !room || !token) return;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('code');
    ydocRef.current = ydoc;
    ytextRef.current = ytext;

    const wsUrl = `${WS_BASE}/yjs?token=${encodeURIComponent(token)}`;
    const provider = new WebsocketProvider(wsUrl, roomId, ydoc, { connect: true });
    yjsProviderRef.current = provider;

    provider.on('status', ({ status }: any) => setYjsConnected(status === 'connected'));

    const COLORS = ['#60a5fa', '#f472b6', '#34d399', '#fb923c', '#a78bfa', '#facc15'];
    const myColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    provider.awareness.setLocalStateField('user', { name: user?.name || 'Anonymous', color: myColor });

    let remoteDecorationIds: string[] = [];
    const updateRemoteUsers = () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const others = states.filter(([clientId]) => clientId !== ydoc.clientID);
      setRemoteUsers(others.map(([, state]) => state.user).filter(Boolean));

      const editor = monacoEditorRef.current;
      if (!editor) return;

      const newDecorations: any[] = [];
      states.forEach(([clientId, state]) => {
        if (clientId === ydoc.clientID || !state.user || !state.selection) return;
        const { anchor, head } = state.selection;
        const model = editor.getModel();
        if (!model) return;
        const startPos = model.getPositionAt(Math.min(anchor, head));
        const endPos = model.getPositionAt(Math.max(anchor, head));
        const cursorPos = model.getPositionAt(head);

        if (anchor !== head) {
          newDecorations.push({
            range: new (window as any).monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
            options: { className: 'yRemoteSelection', stickiness: 1 }
          });
        }
        newDecorations.push({
          range: new (window as any).monaco.Range(cursorPos.lineNumber, cursorPos.column, cursorPos.lineNumber, cursorPos.column),
          options: { className: 'yRemoteSelectionHead', beforeContentClassName: `yRemoteSelectionHeadLabel-${clientId}`, stickiness: 1 }
        });
        const styleId = `yjs-cursor-style-${clientId}`;
        let styleEl = document.getElementById(styleId);
        if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
        styleEl.innerHTML = `.yRemoteSelectionHeadLabel-${clientId}::after { content: "${state.user.name}"; background-color: ${state.user.color}; } .yRemoteSelectionHead { border-color: ${state.user.color}; }`;
      });
      remoteDecorationIds = editor.deltaDecorations(remoteDecorationIds, newDecorations);
    };
    provider.awareness.on('change', updateRemoteUsers);

    const handleSelectionChange = () => {
      const editor = monacoEditorRef.current;
      const model = editor?.getModel();
      if (!editor || !model) return;
      const selection = editor.getSelection();
      if (selection) {
        provider.awareness.setLocalStateField('selection', {
          anchor: model.getOffsetAt(selection.getStartPosition()),
          head: model.getOffsetAt(selection.getEndPosition())
        });
      }
    };
    const monacoSelectionSub = monacoEditorRef.current?.onDidChangeCursorSelection(handleSelectionChange);

    ytext.observe(() => {
      const newContent = ytext.toString();
      setCode(newContent);
      const editorModel = monacoEditorRef.current?.getModel();
      if (editorModel && editorModel.getValue() !== newContent) {
        const pos = monacoEditorRef.current?.getPosition();
        editorModel.setValue(newContent);
        if (pos) monacoEditorRef.current?.setPosition(pos);
      }
    });

    const initialContent = room.codeSnapshots?.[room.codeSnapshots.length - 1]?.content || STARTER_CODE[room.language || 'javascript'] || '';
    if (ytext.length === 0 && initialContent) ydoc.transact(() => { ytext.insert(0, initialContent); });

    return () => {
      provider.disconnect();
      ydoc.destroy();
      yjsProviderRef.current = null;
    };
  }, [roomId, room, token]);

  // Chat typing logic
  useEffect(() => {
    if (!socket || !roomId) return;
    const timeout = setTimeout(() => {
      socket.emit('stop-typing', { roomId });
    }, 2000);
    if (chatInput) socket.emit('typing', { roomId });
    return () => clearTimeout(timeout);
  }, [chatInput, socket, roomId]);

  // Lifecycle helpers
  useEffect(() => {
    if (!room) return;
    const start = new Date(room.startedAt).getTime();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [room]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleEditorMount = useCallback((editorInstance: IStandaloneCodeEditor) => {
    monacoEditorRef.current = editorInstance;
    editorInstance.onDidChangeModelContent((e) => {
      const ytext = ytextRef.current;
      const ydoc = ydocRef.current;
      if (!ytext || !ydoc) return;
      ydoc.transact(() => {
        const changes = [...e.changes].sort((a, b) => b.rangeOffset - a.rangeOffset);
        changes.forEach(change => {
          if (change.rangeLength > 0) ytext.delete(change.rangeOffset, change.rangeLength);
          if (change.text) ytext.insert(change.rangeOffset, change.text);
        });
      });
    });
  }, []);

  const handleRun = async () => {
    if (!code.trim()) return;
    setExecuting(true);
    try {
      const result = await codeExecutionApi.execute({ language, code, stdin: stdin || undefined });
      setExecResult(result);
    } catch (err: any) {
      toast.error('Execution failed');
    } finally { setExecuting(false); }
  };

  const handleAnalyze = async () => {
    if (!code.trim() || !roomId) return;
    setAnalyzing(true);
    setRightTab('ai');
    try {
      const { aiAnalysis } = await roomsApi.analyze(roomId, { code, language });
      setAnalysis(aiAnalysis);
      toast.success('AI analysis complete');
    } catch (err: any) {
      toast.error('Analysis failed');
    } finally { setAnalyzing(false); }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    socket.emit('chat-message', { roomId, sender: user?.name || 'You', text: chatInput.trim(), ts: Date.now() });
    setChatInput('');
  };

  const handleEndSession = async () => {
    if (!roomId) return;
    if (!window.confirm('Are you sure you want to end this interview? This will generate the final report and close the room.')) return;

    setEnding(true);
    try {
      await roomsApi.end(roomId);
      toast.success('Interview completed. Final report generated.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Failed to end session');
    } finally {
      setEnding(false);
    }
  };

  if (loadingRoom || !room) return (
    <div className="min-h-screen bg-bg-900 flex flex-col h-screen overflow-hidden">
      <div className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0 animate-pulse">
        <div className="w-24 h-4 bg-white/5 rounded" />
        <div className="w-px h-4 bg-border" />
        <div className="w-48 h-4 bg-white/5 rounded" />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-border bg-bg-900 p-4 space-y-3 animate-pulse">
          <div className="h-4 w-1/2 bg-white/5 rounded" />
          <div className="h-20 w-full bg-white/5 rounded" />
        </div>
        <div className="flex-1">
          <EditorSkeleton />
        </div>
      </div>
    </div>
  );

  const isHost = room.hostId === (user as any)?._id || room.hostId === (user as any)?.id;

  return (
    <div className="min-h-screen bg-bg-900 flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0 z-20">
        <button onClick={() => { leaveMedia(); navigate('/dashboard'); }} className="flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors text-xs">
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className="w-px h-4 bg-border" />
        <span className="text-white font-semibold text-sm truncate max-w-xs">{room.problem}</span>
        <div className="flex-1" />

        {/* Media Controls */}
        <div className="flex items-center gap-1.5 glass-panel px-1 py-1 rounded-xl">
          <button onClick={toggleAudio} className={`p-1.5 rounded-lg transition-colors ${audioEnabled ? 'text-neutral-400 hover:bg-white/10' : 'text-red-400 bg-red-400/10'}`}>
            {audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
          </button>
          <button onClick={toggleVideo} className={`p-1.5 rounded-lg transition-colors ${videoEnabled ? 'text-neutral-400 hover:bg-white/10' : 'text-red-400 bg-red-400/10'}`}>
            {videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
          <Clock size={13} />
          <span>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
        </div>

        {/* Analyze */}
        <button onClick={handleAnalyze} disabled={analyzing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-neutral-300 hover:bg-white/[0.08] text-xs">
          {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />} Analyze
        </button>

        {isHost && room.status === 'ACTIVE' && (
          <button
            onClick={handleEndSession}
            disabled={ending}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {ending ? <Loader2 size={12} className="animate-spin" /> : <Square size={12} />} End Session
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Problem */}
        <div className={`flex flex-col border-r border-border bg-bg-900 ${leftCollapsed ? 'w-10' : 'w-72'} transition-all shrink-0`}>
          <div className="flex items-center px-3 py-2 border-b border-border">
            {!leftCollapsed && <span className="text-[10px] uppercase font-mono text-neutral-600 tracking-widest">Problem</span>}
            <button onClick={() => setLeftCollapsed(!leftCollapsed)} className="ml-auto text-neutral-600 hover:text-white transition-colors">
              {leftCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          </div>
          {!leftCollapsed && <div className="p-4 text-neutral-400 text-xs leading-relaxed">{room.problem} description...</div>}
        </div>

        {/* Center: Editor */}
        <div className="flex flex-col flex-1 overflow-hidden bg-black/20">
          <div className="flex items-center gap-3 px-3 h-10 border-b border-border shrink-0">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">{language}</span>
            <div className="flex-1" />
            <div className={`w-1.5 h-1.5 rounded-full ${yjsConnected ? 'bg-accent shadow-[0_0_8px_rgba(19,127,236,0.4)]' : 'bg-neutral-700'}`} />
            <button onClick={handleRun} disabled={executing} className="px-3 py-1 bg-accent text-white rounded text-[10px] font-bold hover:bg-accent-secondary transition-colors uppercase tracking-wider">
              {executing ? <Loader2 size={10} className="animate-spin" /> : 'Run Code'}
            </button>
          </div>

          <div className="flex-1 relative">
            <Editor
              language={language}
              value={code}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 }
              }}
            />

            {/* WebRTC Video Overlay */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-3 pointer-events-none">
              {localStream && (
                <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden border border-white/20 shadow-2xl pointer-events-auto">
                  <video ref={v => { if (v) v.srcObject = localStream }} autoPlay muted playsInline className="w-full h-full object-cover grayscale opacity-80" />
                  <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-white">You</div>
                </div>
              )}
              {Array.from(remoteStreams.entries()).map(([sid, stream]) => (
                <div key={sid} className="pointer-events-auto">
                  <RemoteVideo stream={stream} name="Participant" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Tab */}
        <div className="flex flex-col border-l border-border bg-bg-900 w-80 shrink-0">
          <div className="flex border-b border-border">
            {['chat', 'ai'].map(t => (
              <button key={t} onClick={() => setRightTab(t as RightTab)} className={`flex-1 py-2.5 text-[10px] uppercase font-mono tracking-widest border-b-2 transition-colors ${rightTab === t ? 'text-white border-white' : 'text-neutral-600 border-transparent hover:text-neutral-400'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            {rightTab === 'chat' ? (
              <div className="flex-1 flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-neutral-600 font-mono mb-1">{m.sender}</span>
                    <div className={`px-3 py-1.5 rounded-xl text-xs max-w-[90%] ${m.mine ? 'bg-accent text-white' : 'glass-panel text-neutral-300'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono italic animate-pulse">
                    <Users size={10} />
                    {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-5">
                {analyzing ? (
                  <div className="flex flex-col items-center justify-center h-40 text-neutral-500 gap-3">
                    <Loader2 size={24} className="animate-spin text-teal-500" />
                    <span className="text-xs font-mono uppercase tracking-widest animate-pulse">Deep Analysis in Progress...</span>
                  </div>
                ) : analysis ? (
                  <div className="space-y-6">
                    {/* Score Gauge */}
                    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain size={60} className="text-accent" />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-4">Overall Score</span>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold text-white leading-none">{analysis.overallScore}</span>
                        <span className="text-xl text-neutral-600 font-medium pb-1">/10</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.05] rounded-full mt-4 overflow-hidden">
                        <div
                          className="h-full bg-accent shadow-[0_0_10px_rgba(19,127,236,0.5)] transition-all duration-1000"
                          style={{ width: `${(analysis.overallScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Complexity Badges */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-panel rounded-xl p-3">
                        <span className="text-[9px] font-mono text-neutral-600 uppercase block mb-1">Time</span>
                        <span className="text-xs font-mono text-accent font-semibold">{analysis.timeComplexity}</span>
                      </div>
                      <div className="glass-panel rounded-xl p-3">
                        <span className="text-[9px] font-mono text-neutral-600 uppercase block mb-1">Space</span>
                        <span className="text-xs font-mono text-accent font-semibold">{analysis.spaceComplexity}</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} /> Executive Summary
                      </span>
                      <p className="text-xs text-neutral-400 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                        {analysis.summary}
                      </p>
                    </div>

                    {/* Issues/Bugs */}
                    {analysis.bugs.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-red-400/80 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle size={12} /> Critical Issues
                        </span>
                        <ul className="space-y-2">
                          {analysis.bugs.map((bug, i) => (
                            <li key={i} className="text-[11px] text-neutral-300 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg flex gap-2.5">
                              <span className="text-red-500">•</span> {bug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {analysis.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-accent-tertiary/80 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} /> Growth Suggestions
                        </span>
                        <ul className="space-y-2">
                          {analysis.suggestions.map((s, i) => (
                            <li key={i} className="text-[11px] text-neutral-300 bg-accent-tertiary/10 border border-accent-tertiary/20 p-2.5 rounded-lg flex gap-2.5">
                              <span className="text-accent-tertiary">•</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-20 text-center px-4 gap-4">
                    <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-neutral-600">
                      <Brain size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">AI Analysis Ready</h4>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        Execute the "Analyze" command to get FAANG-level feedback on complexity, correctness, and style.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {rightTab === 'chat' && (
            <form onSubmit={handleSendChat} className="p-3 border-t border-border flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 glass-panel px-3 py-2 text-xs text-white placeholder:text-neutral-700 outline-none focus:border-accent/40 transition-all" />
              <button disabled={!chatInput.trim()} className="p-2 bg-accent text-white rounded-xl hover:bg-accent-secondary transition-colors disabled:opacity-40">
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SessionView() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useStore();

  useEffect(() => {
    if (!token) return;
    const s = io(API_BASE, { auth: { token }, transports: ['websocket', 'polling'] });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [token]);

  return (
    <MediaProvider socket={socket}>
      <SessionInner socket={socket} />
    </MediaProvider>
  );
}
