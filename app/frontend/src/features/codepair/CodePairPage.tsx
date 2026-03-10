import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Copy, Link, Users, LogOut, Check } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { ChatPanel } from './ChatPanel';
import useStore from '../../store/useStore';
import { toast } from 'sonner';

// Initialize socket outside component to prevent recreation, but we'll connect it inside
let socketInstance: Socket | null = null;

export default function CodePairPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { user } = useStore();
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [initialCode, setInitialCode] = useState('');
    const [initialLanguage, setInitialLanguage] = useState('javascript');
    const [copied, setCopied] = useState(false);

    // Use a fallback random name if user is not logged in
    const userName = user?.name || `Guest-${Math.floor(Math.random() * 1000)}`;

    useEffect(() => {
        if (!roomId) {
            navigate('/dashboard');
            return;
        }

        // Need trailing slash or correct path based on backend config, using generic connection
        const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socketInstance = newSocket;

        newSocket.on('connect', () => {
            setConnected(true);
            newSocket.emit('codepair:join', { 
                roomId, 
                user: { id: newSocket.id, name: userName }
            });
        });

        newSocket.on('codepair:init', (data) => {
            setInitialCode(data.code);
            setInitialLanguage(data.language);
            setParticipants(data.participants);
        });

        newSocket.on('codepair:user-joined', (data) => {
            setParticipants(data.participants);
            toast.success("A user joined the session");
        });

        newSocket.on('codepair:user-left', (data) => {
            setParticipants(data.participants);
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [roomId, navigate, userName]);

    const copyInviteLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("Invite link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const leaveSession = () => {
        navigate('/dashboard');
    };

    if (!socket || !connected) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-neutral-400">Connecting to collaborative session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#0a0a0a] text-white flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="h-14 border-b border-neutral-800 bg-[#111111] flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600/20 text-blue-500 font-bold">
                        {'</>'}
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight">CodePair Session</h1>
                        <p className="text-xs text-neutral-500 font-mono">{roomId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-2 mr-2">
                        {participants.slice(0, 3).map((p, i) => (
                            <div 
                                key={i} 
                                className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-[#111111] flex items-center justify-center text-xs font-medium"
                                title={p.name}
                            >
                                {p.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {participants.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-[#111111] flex items-center justify-center text-xs font-medium">
                                +{participants.length - 3}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={copyInviteLink}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition-colors"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Link size={16} />}
                        Share
                    </button>
                    
                    <button 
                        onClick={leaveSession}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-sm font-medium transition-colors"
                    >
                        <LogOut size={16} />
                        Leave
                    </button>
                </div>
            </header>

            {/* Main Content Workspace */}
            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-4 overflow-hidden">
                    <CodeEditor 
                        socket={socket} 
                        roomId={roomId!} 
                        initialCode={initialCode}
                        initialLanguage={initialLanguage}
                    />
                </div>
                
                <div className="w-80 shrink-0 border-l border-neutral-800 hidden md:block">
                    <ChatPanel
                        socket={socket}
                        roomId={roomId!}
                        currentUser={userName}
                    />
                </div>
            </main>
        </div>
    );
}
