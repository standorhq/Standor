import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MdOutlineContentCopy } from "react-icons/md";
import { FaCheck, FaLock } from "react-icons/fa6";

const GmeetTopBar = ({ participantCount, notification }) => {
  const { meetingId } = useParams();
  const [time, setTime] = useState("");
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const copyMeetingCode = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/virtual-meet/${meetingId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="h-14 flex items-center justify-between px-4 bg-[#202124] shrink-0">
      {/* Left: Meeting info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FaLock className="text-white/50" size={12} />
            <span className="text-white text-sm font-medium">{meetingId}</span>
          </button>

          {showInfo && (
            <div className="absolute top-full left-0 mt-1 bg-[#2d2e30] rounded-xl p-4 w-80 shadow-2xl z-50 border border-white/10">
              <h3 className="text-white font-medium mb-3">Meeting details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-white/50 text-xs">Meeting link</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[#8ab4f8] text-sm truncate">{window.location.origin}/virtual-meet/{meetingId}</p>
                    <button onClick={copyMeetingCode} className="text-white/60 hover:text-white shrink-0">
                      {copied ? <FaCheck size={14} className="text-green-400" /> : <MdOutlineContentCopy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-white/50 text-xs">
                  <FaLock size={10} />
                  <span>End-to-end encrypted</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Notification */}
      {notification.show && (
        <div className="absolute left-1/2 -translate-x-1/2 top-3 bg-[#3c4043] text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {notification.message}
        </div>
      )}

      {/* Right: Time */}
      <div className="flex items-center gap-4">
        <span className="text-white/70 text-sm">{time}</span>
      </div>
    </div>
  );
};

export default GmeetTopBar;
