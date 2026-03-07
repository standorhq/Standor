import { useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Standalone video call panel using WebRTC native APIs.
 * Accepts localVideoRef and remoteVideoRef forwarded from parent.
 */
export default function VideoCallUI({
  localVideoRef,
  remoteVideoRef,
  localName = 'You',
  remoteName = 'Participant',
  remoteConnected = false
}) {
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const streamRef = useRef(null);

  const toggleVideo = async () => {
    try {
      if (!videoEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: audioEnabled });
        streamRef.current = stream;
        if (localVideoRef?.current) localVideoRef.current.srcObject = stream;
        setVideoEnabled(true);
      } else {
        streamRef.current?.getVideoTracks().forEach((t) => t.stop());
        if (localVideoRef?.current) localVideoRef.current.srcObject = null;
        setVideoEnabled(false);
      }
    } catch {
      toast.error('Camera access denied');
    }
  };

  const toggleAudio = async () => {
    try {
      if (!audioEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

  return (
    <div className="space-y-2">
      {/* Remote video */}
      <div className="relative aspect-video bg-base-300 rounded-xl overflow-hidden">
        <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
        {!remoteConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Users className="size-6 text-base-content/20 mb-1" />
            <p className="text-xs text-base-content/30">Waiting for {remoteName}...</p>
          </div>
        )}
        <div className="absolute bottom-1 left-2 text-xs text-white/60 bg-black/40 rounded px-1.5 py-0.5">
          {remoteName}
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
        <div className="absolute bottom-1 left-2 text-xs text-white/60 bg-black/40 rounded px-1.5 py-0.5">
          {localName}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
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
          title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {audioEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </button>
      </div>
    </div>
  );
}
