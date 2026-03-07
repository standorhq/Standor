import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import {
  Video, VideoOff, Mic, MicOff, Play, Sparkles, MessageSquare,
  ChevronRight, Copy, LogOut, Loader2, X, Send, AlertCircle,
  Clock, Users, Code2
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'typescript', label: 'TypeScript' }
];

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return { time: fmt(seconds), start: () => setRunning(true), stop: () => setRunning(false) };
}

export default function SessionPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const timer = useTimer();

  // Editor state
  const [code, setCode] = useState('// Start coding...\n');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  // AI Analysis state
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  // Video state
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const snapshotTimerRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', roomId],
    queryFn: async () => {
      const { data } = await api.get(`/sessions/${roomId}`);
      return data.session;
    }
  });

  // Join room via socket
  useEffect(() => {
    if (!socket || !user || !session) return;

    socket.emit('join-room', {
      roomId,
      userId: user.id,
      userName: user.name,
      role: session?.host?._id === user.id ? 'host' : 'participant'
    });

    timer.start();

    return () => {
      socket.emit('leave-room', { roomId });
      timer.stop();
    };
  }, [socket, user, session, roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onCodeUpdate = ({ code: newCode, language: newLang }) => {
      isRemoteUpdate.current = true;
      setCode(newCode);
      if (newLang) setLanguage(newLang);
    };

    const onChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onUserJoined = ({ userName }) => {
      toast.success(`${userName} joined the session`);
      setRemoteConnected(true);
    };

    const onUserLeft = ({ userName }) => {
      toast(`${userName} left the session`, { icon: '' });
      setRemoteConnected(false);
    };

    socket.on('code-update', onCodeUpdate);
    socket.on('chat-message', onChatMessage);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);

    return () => {
      socket.off('code-update', onCodeUpdate);
      socket.off('chat-message', onChatMessage);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
    };
  }, [socket]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Snapshot every 30s
  useEffect(() => {
    snapshotTimerRef.current = setInterval(async () => {
      if (code && code.trim() !== '// Start coding...\n') {
        try {
          await api.post(`/sessions/${roomId}/snapshot`, { content: code, language });
        } catch {
          // Silent fail for snapshots
        }
      }
    }, 30000);
    return () => clearInterval(snapshotTimerRef.current);
  }, [code, language, roomId]);

  // PeerJS setup
  useEffect(() => {
    let peer;
    const setupPeer = async () => {
      try {
        const { default: Peer } = await import('peerjs');
        peer = new Peer();
        peerRef.current = peer;

        peer.on('open', (id) => {
          if (socket) {
            socket.emit('peer-ready', { roomId, peerId: id });
          }
        });

        peer.on('call', (call) => {
          if (streamRef.current) {
            call.answer(streamRef.current);
            call.on('stream', (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                setRemoteConnected(true);
              }
            });
          }
        });
      } catch {
        // PeerJS not critical
      }
    };

    setupPeer();
    return () => { peer?.destroy(); };
  }, [socket, roomId]);

  const handleCodeChange = useCallback((value) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    setCode(value || '');
    if (socket) {
      socket.emit('code-change', { roomId, code: value, language });
    }
  }, [socket, roomId, language]);

  const toggleVideo = async () => {
    try {
      if (!videoEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: audioEnabled });
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setVideoEnabled(true);
      } else {
        streamRef.current?.getVideoTracks().forEach((t) => t.stop());
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        setVideoEnabled(false);
      }
    } catch {
      toast.error('Camera access denied');
    }
  };

  const toggleAudio = async () => {
    try {
      if (!audioEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: videoEnabled });
        streamRef.current = stream;
        setAudioEnabled(true);
      } else {
        streamRef.current?.getAudioTracks().forEach((t) => t.stop());
        setAudioEnabled(false);
      }
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const runCode = async () => {
    setRunning(true);
    setOutput('');
    try {
      const { data } = await api.post('/code/execute', { code, language });
      setOutput(data.output || data.error || 'No output');
    } catch {
      setOutput('Execution failed. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const analyzeCode = async () => {
    setAnalyzing(true);
    setShowAnalysis(true);
    setActiveTab('analysis');
    try {
      const { data } = await api.post(`/sessions/${roomId}/analyze`, { code, language });
      setAnalysis(data.analysis);
      toast.success('Analysis complete!');
    } catch {
      toast.error('Analysis failed');
      setShowAnalysis(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    socket.emit('chat-message', { roomId, message: message.trim(), userName: user.name });
    setMessage('');
  };

  const endSession = async () => {
    if (!confirm('End this session? Both participants will receive an email report.')) return;
    try {
      await api.post(`/sessions/${roomId}/end`);
      toast.success('Session ended. Check your email for the report!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to end session');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Session link copied!');
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <Loader2 className="size-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-base-content/60">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <AlertCircle className="size-10 text-error mx-auto mb-3" />
          <p className="font-bold mb-2">Session not found</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isHost = session?.host?._id === user?.id;

  return (
    <div className="h-screen flex flex-col bg-base-100 overflow-hidden">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Code2 className="size-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm truncate">{session.problem}</h1>
            <div className="flex items-center gap-2">
              <span className={`badge badge-xs capitalize ${session.difficulty === 'easy' ? 'badge-success' : session.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>
                {session.difficulty}
              </span>
              <span className="text-xs text-base-content/40 font-mono">#{session.roomId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Timer */}
          <div className="hidden sm:flex items-center gap-1.5 bg-base-300 rounded-lg px-3 py-1.5 text-xs font-mono">
            <Clock className="size-3 text-primary" />
            {timer.time}
          </div>

          {/* Participants */}
          <div className="hidden sm:flex items-center gap-1.5 bg-base-300 rounded-lg px-3 py-1.5 text-xs">
            <Users className="size-3 text-success" />
            <span className={remoteConnected ? 'text-success' : 'text-base-content/40'}>
              {remoteConnected ? '2/2' : '1/2'}
            </span>
          </div>

          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              if (socket) socket.emit('code-change', { roomId, code, language: e.target.value });
            }}
            className="select select-xs select-bordered rounded-lg"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>

          <button onClick={copyLink} className="btn btn-ghost btn-xs gap-1 rounded-lg">
            <Copy className="size-3" />
          </button>

          <button
            onClick={runCode}
            disabled={running}
            className="btn btn-success btn-xs gap-1 rounded-lg"
          >
            {running ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" />}
            Run
          </button>

          <button onClick={analyzeCode} className="btn btn-secondary btn-xs gap-1 rounded-lg" disabled={analyzing}>
            <Sparkles className="size-3" />
            AI
          </button>

          {isHost && (
            <button onClick={endSession} className="btn btn-error btn-xs gap-1 rounded-lg">
              <LogOut className="size-3" />
              End
            </button>
          )}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* CODE EDITOR */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                tabSize: 2,
                wordWrap: 'on',
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                formatOnPaste: true
              }}
            />
          </div>

          {/* OUTPUT PANEL */}
          <div className="border-t border-base-300 bg-base-300 flex flex-col" style={{ height: output ? '160px' : '36px', transition: 'height 0.2s' }}>
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-base-300/50">
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Output</span>
              {output && (
                <button onClick={() => setOutput('')} className="text-base-content/40 hover:text-base-content">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            {output && (
              <div className="flex-1 overflow-auto p-3">
                <pre className="text-xs font-mono text-base-content/80 whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 xl:w-80 flex flex-col bg-base-200 border-l border-base-300 flex-shrink-0">
          {/* VIDEO SECTION */}
          <div className="p-3 border-b border-base-300">
            <div className="space-y-2">
              {/* Remote video */}
              <div className="relative aspect-video bg-base-300 rounded-xl overflow-hidden">
                <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                {!remoteConnected && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Users className="size-6 text-base-content/20 mb-1" />
                    <p className="text-xs text-base-content/30">Waiting for participant...</p>
                  </div>
                )}
                <div className="absolute bottom-1 left-2 text-xs text-white/60 bg-black/40 rounded px-1">
                  {session.participant?.name || 'Participant'}
                </div>
              </div>

              {/* Local video */}
              <div className="relative aspect-video bg-base-300 rounded-xl overflow-hidden">
                <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff className="size-6 text-base-content/20" />
                  </div>
                )}
                <div className="absolute bottom-1 left-2 text-xs text-white/60 bg-black/40 rounded px-1">
                  You
                </div>
              </div>
            </div>

            {/* Video controls */}
            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={toggleVideo}
                className={`btn btn-sm btn-circle ${videoEnabled ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
              </button>
              <button
                onClick={toggleAudio}
                className={`btn btn-sm btn-circle ${audioEnabled ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                title={audioEnabled ? 'Mute' : 'Unmute'}
              >
                {audioEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex border-b border-base-300">
            {[
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
              { id: 'analysis', icon: Sparkles, label: 'AI' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${activeTab === id ? 'text-primary border-b-2 border-primary bg-base-100/50' : 'text-base-content/50 hover:text-base-content'}`}
              >
                <Icon className="size-3.5" />
                {label}
                {id === 'chat' && messages.length > 0 && (
                  <span className="badge badge-primary badge-xs ml-0.5">{messages.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'chat' ? (
              <>
                <div className="flex-1 overflow-auto p-3 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="size-6 text-base-content/20 mx-auto mb-2" />
                      <p className="text-xs text-base-content/40">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.userName === user.name ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-base-content/40 mb-0.5 px-1">{msg.userName}</span>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.userName === user.name ? 'bg-primary text-primary-content rounded-tr-sm' : 'bg-base-300 rounded-tl-sm'}`}>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-3 border-t border-base-300 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input input-sm input-bordered flex-1 rounded-xl"
                    placeholder="Type a message..."
                  />
                  <button type="submit" className="btn btn-primary btn-sm btn-square rounded-xl">
                    <Send className="size-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 overflow-auto p-3">
                {analyzing ? (
                  <div className="text-center py-8">
                    <Loader2 className="size-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-base-content/60">Analyzing your code...</p>
                    <p className="text-xs text-base-content/40 mt-1">This may take a few seconds</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-3">
                    {/* Score */}
                    <div className="text-center py-3 bg-base-300 rounded-xl">
                      <p className="text-3xl font-black mb-1">
                        <span className={analysis.overallScore >= 70 ? 'text-success' : analysis.overallScore >= 50 ? 'text-warning' : 'text-error'}>
                          {analysis.overallScore}
                        </span>
                        <span className="text-base-content/30 text-lg">/100</span>
                      </p>
                      <p className="text-xs text-base-content/50">Overall Score</p>
                    </div>

                    {/* Complexity */}
                    <div className="bg-base-300 rounded-xl p-3 space-y-1.5">
                      <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">Complexity</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/50">Time</span>
                        <span className="font-mono font-bold text-primary">{analysis.timeComplexity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/50">Space</span>
                        <span className="font-mono font-bold text-secondary">{analysis.spaceComplexity}</span>
                      </div>
                    </div>

                    {/* Bugs */}
                    {analysis.bugs?.length > 0 && (
                      <div className="bg-error/10 border border-error/20 rounded-xl p-3">
                        <p className="text-xs font-semibold text-error mb-2">Issues Found</p>
                        <ul className="space-y-1">
                          {analysis.bugs.map((bug, i) => (
                            <li key={i} className="text-xs text-base-content/70 flex gap-1.5">
                              <span className="text-error mt-0.5">•</span>
                              {bug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {analysis.suggestions?.length > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                        <p className="text-xs font-semibold text-primary mb-2">Suggestions</p>
                        <ul className="space-y-1">
                          {analysis.suggestions.map((s, i) => (
                            <li key={i} className="text-xs text-base-content/70 flex gap-1.5">
                              <ChevronRight className="size-3 text-primary flex-shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Summary */}
                    {analysis.summary && (
                      <div className="bg-base-300 rounded-xl p-3">
                        <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1.5">Summary</p>
                        <p className="text-xs text-base-content/70 leading-relaxed">{analysis.summary}</p>
                      </div>
                    )}

                    <button onClick={analyzeCode} className="btn btn-secondary btn-sm w-full rounded-xl gap-2">
                      <Sparkles className="size-3.5" /> Re-analyze
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="size-8 text-base-content/20 mx-auto mb-3" />
                    <p className="text-sm text-base-content/60 mb-1">No analysis yet</p>
                    <p className="text-xs text-base-content/40 mb-4">Click the AI button to analyze your code</p>
                    <button onClick={analyzeCode} className="btn btn-secondary btn-sm rounded-xl gap-2">
                      <Sparkles className="size-3.5" /> Analyze Code
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
