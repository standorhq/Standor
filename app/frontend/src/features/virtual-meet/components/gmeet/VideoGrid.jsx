import { useEffect, useRef, useMemo } from "react";
import { BsMicFill, BsMicMuteFill } from "react-icons/bs";

const VideoTile = ({ name, videoStream, audioStream, audioOn, isSelf, isMuted }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const initials = useMemo(() => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }, [name]);

  const bgColor = useMemo(() => {
    const colors = ["#1a73e8", "#e8710a", "#d93025", "#188038", "#a142f4", "#e52592", "#129eaf"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  const hasVideo = useRef(false);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      const tracks = videoStream.getVideoTracks();
      if (tracks.length > 0 && tracks[0].readyState === "live") {
        videoRef.current.srcObject = videoStream;
        hasVideo.current = true;
      } else {
        hasVideo.current = false;
      }
    } else {
      hasVideo.current = false;
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [videoStream]);

  useEffect(() => {
    if (audioRef.current && audioStream && !isSelf) {
      audioRef.current.srcObject = audioStream;
    }
  }, [audioStream, isSelf]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#3c4043]">
      {/* Avatar fallback */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full flex items-center justify-center text-white font-medium"
          style={{
            backgroundColor: bgColor,
            width: "clamp(48px, 8vw, 96px)",
            height: "clamp(48px, 8vw, 96px)",
            fontSize: "clamp(18px, 3vw, 36px)",
          }}
        >
          {initials}
        </div>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isSelf || isMuted}
        className={`absolute inset-0 w-full h-full object-contain bg-[#202124] ${videoStream ? "" : "hidden"}`}
        style={{ transform: isSelf ? "scaleX(-1)" : "none" }}
      />

      {/* Audio (hidden) */}
      {!isSelf && <audio ref={audioRef} autoPlay />}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between">
        <span className="text-white text-xs font-medium truncate">
          {isSelf ? `${name} (You)` : name}
        </span>
        <div className="flex items-center gap-1">
          {audioOn ? (
            <BsMicFill className="text-white" size={12} />
          ) : (
            <div className="bg-red-600 rounded-full p-0.5">
              <BsMicMuteFill className="text-white" size={10} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoGrid = ({ playerKeys, players, videos, audios, audioIcon, myName, isOwnVideo, videoStreamRef, micOn }) => {
  const totalParticipants = 1 + playerKeys.length;

  const getGridLayout = (count) => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-2 grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    if (count <= 16) return "grid-cols-4 grid-rows-4";
    if (count <= 25) return "grid-cols-5 grid-rows-5";
    return "grid-cols-6 auto-rows-fr";
  };

  const isSingle = totalParticipants === 1;

  return (
    <div className={`w-full h-full grid ${isSingle ? 'gap-0' : 'gap-1 p-1'} ${getGridLayout(totalParticipants)}`}>
      {/* Self tile */}
      <VideoTile
        name={myName}
        videoStream={isOwnVideo ? videoStreamRef.current : null}
        audioStream={null}
        audioOn={micOn}
        isSelf={true}
      />

      {/* Other participants */}
      {playerKeys.map((key) => {
        const player = players.current?.[key.socketId];
        if (!player) return null;
        return (
          <VideoTile
            key={key.socketId}
            name={player.name}
            videoStream={videos?.[key.peerId] || null}
            audioStream={audios?.[key.peerId] || null}
            audioOn={audioIcon?.[key.socketId] || false}
            isSelf={false}
          />
        );
      })}
    </div>
  );
};

export default VideoGrid;
