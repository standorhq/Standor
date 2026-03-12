import { useEffect, useRef } from "react";

const ScreenShareView = ({
  screenStreamRef, screenShareInfo, players, screenShared,
  playerKeys, videos, audios, audioIcon, myName, isOwnVideo, videoStreamRef, micOn,
}) => {
  const screenVideoRef = useRef(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStreamRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [screenStreamRef.current]);

  const sharerName = (() => {
    if (screenShared.current) return myName + " (You)";
    if (screenShareInfo.current && players.current) {
      const sharer = Object.values(players.current).find(
        (p) => p.peerId === screenShareInfo.current.peerId
      );
      return sharer?.name || "Someone";
    }
    return "Someone";
  })();

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* Screen share (main view) */}
      <div className="flex-1 relative rounded-lg overflow-hidden bg-black min-h-0">
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 rounded-lg text-white text-xs">
          {sharerName} is presenting
        </div>
      </div>

      {/* Participant strip at bottom */}
      <div className="h-28 flex gap-2 overflow-x-auto shrink-0 pb-1">
        {/* Self */}
        <SmallTile
          name={myName}
          videoStream={isOwnVideo ? videoStreamRef.current : null}
          audioOn={micOn}
          isSelf
        />
        {playerKeys.map((key) => {
          const player = players.current?.[key.socketId];
          if (!player) return null;
          return (
            <SmallTile
              key={key.socketId}
              name={player.name}
              videoStream={videos?.[key.peerId] || null}
              audioStream={audios?.[key.peerId] || null}
              audioOn={audioIcon?.[key.socketId] || false}
            />
          );
        })}
      </div>
    </div>
  );
};

const SmallTile = ({ name, videoStream, audioStream, audioOn, isSelf }) => {
  const vRef = useRef(null);
  const aRef = useRef(null);

  useEffect(() => {
    if (vRef.current && videoStream) vRef.current.srcObject = videoStream;
    else if (vRef.current) vRef.current.srcObject = null;
  }, [videoStream]);

  useEffect(() => {
    if (aRef.current && audioStream && !isSelf) aRef.current.srcObject = audioStream;
  }, [audioStream, isSelf]);

  const initials = (() => {
    if (!name) return "?";
    const p = name.trim().split(" ");
    return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
  })();

  const bgColor = (() => {
    const colors = ["#1a73e8", "#e8710a", "#d93025", "#188038", "#a142f4", "#e52592", "#129eaf"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  })();

  return (
    <div className="relative w-40 h-full rounded-lg overflow-hidden bg-[#3c4043] shrink-0">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: bgColor }}>
          {initials}
        </div>
      </div>
      <video ref={vRef} autoPlay playsInline muted={isSelf} className={`absolute inset-0 w-full h-full object-cover ${videoStream ? "" : "hidden"}`} style={{ transform: isSelf ? "scaleX(-1)" : "none" }} />
      {!isSelf && <audio ref={aRef} autoPlay />}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent">
        <span className="text-white text-[10px] truncate block">{isSelf ? "You" : name}</span>
      </div>
    </div>
  );
};

export default ScreenShareView;
