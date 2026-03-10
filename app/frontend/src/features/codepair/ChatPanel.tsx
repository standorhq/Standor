import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Send, User } from 'lucide-react';

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
    isSelf: boolean;
}

interface ChatPanelProps {
    socket: Socket;
    roomId: string;
    currentUser: string;
}

export const ChatPanel = ({ socket, roomId, currentUser }: ChatPanelProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleNewMessage = (msg: { sender: string, text: string }) => {
            setMessages(prev => [...prev, {
                id: Math.random().toString(36).substring(7),
                sender: msg.sender,
                text: msg.text,
                timestamp: Date.now(),
                isSelf: msg.sender === currentUser
            }]);
        };

        socket.on('codepair:chat-message', handleNewMessage);

        return () => {
            socket.off('codepair:chat-message', handleNewMessage);
        };
    }, [socket, currentUser]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (!inputValue.trim()) return;

        const msgData = {
            sender: currentUser,
            text: inputValue.trim()
        };

        // Optimistically add to local state
        setMessages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            ...msgData,
            timestamp: Date.now(),
            isSelf: true
        }]);

        socket.emit('codepair:chat', { roomId, message: msgData });
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-full bg-[#111111] border-l border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">Session Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-xs text-center">
                        No messages yet.<br/>Say hello to your collaborator!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                        >
                            <span className="text-[10px] text-neutral-500 mb-1 px-1">
                                {msg.isSelf ? 'You' : msg.sender}
                            </span>
                            <div 
                                className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${
                                    msg.isSelf 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-[#111111] border-t border-neutral-800">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 placeholder:text-neutral-600"
                    />
                    <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};
