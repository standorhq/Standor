import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface MediaContextType {
    localStream: MediaStream | null;
    remoteStreams: Map<string, MediaStream>;
    audioEnabled: boolean;
    videoEnabled: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
    joinMedia: (roomId: string, userId: string, userName: string) => void;
    leaveMedia: () => void;
    getPeerConnections: () => Map<string, RTCPeerConnection>;
}

const MediaContext = createContext<MediaContextType | null>(null);

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (!context) throw new Error('useMedia must be used within a MediaProvider');
    return context;
};

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const MediaProvider: React.FC<{ socket: Socket | null; children: React.ReactNode }> = ({ socket, children }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);

    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const currentRoomId = useRef<string | null>(null);
    const currentUserId = useRef<string | null>(null);

    // Initialize local media
    useEffect(() => {
        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setLocalStream(stream);
            } catch (err) {
                console.error('Failed to get local stream:', err);
                toast.error('Camera or microphone access denied');
            }
        };

        if (!localStream) {
            initMedia();
        }

        return () => {
            localStream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const toggleAudio = () => {
        if (localStream) {
            const track = localStream.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setAudioEnabled(track.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const track = localStream.getVideoTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setVideoEnabled(track.enabled);
            }
        }
    };

    const createPeerConnection = (remoteSocketId: string) => {
        if (peerConnections.current.has(remoteSocketId)) {
            return peerConnections.current.get(remoteSocketId)!;
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to the connection
        localStream?.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            const stream = event.streams[0];
            setRemoteStreams(prev => {
                const next = new Map(prev);
                next.set(remoteSocketId, stream);
                return next;
            });
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc:ice-candidate', {
                    to: remoteSocketId,
                    candidate: event.candidate,
                    from: socket.id,
                });
            }
        };

        peerConnections.current.set(remoteSocketId, pc);
        return pc;
    };

    const joinMedia = (roomId: string, userId: string, userName: string) => {
        if (!socket) return;
        currentRoomId.current = roomId;
        currentUserId.current = userId;

        socket.emit('media:join', { roomId, userId, userName });

        // Listen for peer join signals
        socket.on('media:peer-joined', async ({ socketId, userName: peerName }) => {
            console.log(`[WebRTC] Peer joined: ${peerName} (${socketId})`);
            const pc = createPeerConnection(socketId);

            // Generate offer as the person who was already in the room
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('webrtc:offer', {
                to: socketId,
                offer,
                from: socket.id,
            });
        });

        // Receive offer
        socket.on('webrtc:offer', async ({ from, offer }) => {
            const pc = createPeerConnection(from);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('webrtc:answer', {
                to: from,
                answer,
                from: socket.id,
            });
        });

        // Receive answer
        socket.on('webrtc:answer', async ({ from, answer }) => {
            const pc = peerConnections.current.get(from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        // Receive ICE candidate
        socket.on('webrtc:ice-candidate', async ({ from, candidate }) => {
            const pc = peerConnections.current.get(from);
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        // Handle peer leaving
        socket.on('media:user-left', ({ userId: leftUserId }) => {
            console.log(`[WebRTC] Peer left: ${leftUserId}`);
            // Find the socketId associated with this userId if needed, 
            // but usually we just want to cleanup based on the socket that disconnected.
            // For now, let's just listen for the socket-level disconnect too.
        });

        socket.on('user-left', ({ socketId }) => {
            const pc = peerConnections.current.get(socketId);
            if (pc) {
                pc.close();
                peerConnections.current.delete(socketId);
                setRemoteStreams(prev => {
                    const next = new Map(prev);
                    next.delete(socketId);
                    return next;
                });
            }
        });
    };

    const leaveMedia = () => {
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        setRemoteStreams(new Map());
        if (currentRoomId.current && socket) {
            socket.emit('media:leave', { roomId: currentRoomId.current, userId: currentUserId.current });
        }
    };

    return (
        <MediaContext.Provider value={{
            localStream,
            remoteStreams,
            audioEnabled,
            videoEnabled,
            toggleAudio,
            toggleVideo,
            joinMedia,
            leaveMedia,
            getPeerConnections: () => peerConnections.current,
        }}>
            {children}
        </MediaContext.Provider>
    );
};
