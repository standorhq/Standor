import { useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { BsMicFill, BsMicMuteFill, BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import { MdAdminPanelSettings } from "react-icons/md";

const MAX_PARTICIPANTS = 150;

const ParticipantRow = ({ name, audioOn, camOn, isHost, isSelf }) => {
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

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-lg transition-colors">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-white text-sm truncate">{name}</span>
          {isSelf && <span className="text-white/40 text-xs">(You)</span>}
          {isHost && <MdAdminPanelSettings className="text-[#8ab4f8] shrink-0" size={14} title="Host" />}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {camOn ? (
          <BsCameraVideoFill className="text-white/60" size={14} />
        ) : (
          <BsCameraVideoOffFill className="text-white/40" size={14} />
        )}
        {audioOn ? (
          <BsMicFill className="text-white/60" size={14} />
        ) : (
          <BsMicMuteFill className="text-white/40" size={14} />
        )}
      </div>
    </div>
  );
};

const ParticipantsPanel = ({ onClose, playerKeys, players, audioIcon, videos, myName, isAdmin, micOn, camOn }) => {
  const participantCount = 1 + playerKeys.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <h3 className="text-white font-medium">People ({participantCount}/{MAX_PARTICIPANTS})</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10">
          <IoClose size={20} />
        </button>
      </div>

      {/* In this call */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium">In this call</p>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto px-1">
        {/* Self */}
        <ParticipantRow name={myName} audioOn={micOn} camOn={camOn} isHost={isAdmin} isSelf={true} />

        {/* Others */}
        {playerKeys.map((key) => {
          const player = players.current?.[key.socketId];
          if (!player) return null;
          const hasVideo = !!(videos?.[key.peerId]);
          return (
            <ParticipantRow
              key={key.socketId}
              name={player.name}
              audioOn={audioIcon?.[key.socketId] || false}
              camOn={hasVideo}
              isHost={player.isAdmin || false}
              isSelf={false}
            />
          );
        })}
      </div>

      {/* Capacity */}
      {participantCount > MAX_PARTICIPANTS * 0.8 && (
        <div className="px-4 py-3 border-t border-white/10 shrink-0">
          <p className="text-amber-400 text-xs">
            {MAX_PARTICIPANTS - participantCount} spots remaining (max {MAX_PARTICIPANTS})
          </p>
        </div>
      )}
    </div>
  );
};

export default ParticipantsPanel;
