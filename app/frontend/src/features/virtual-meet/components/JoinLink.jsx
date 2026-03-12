import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlayerContext } from "../helpers/contextProvider";
import { connectSocket } from "../helpers/socketConnection";

const JoinLink = () => {
  const [name, setName] = useState("");
  const { meetingId } = useParams();
  const { socket, room, setMyName, setIsAdmin, setControlsAllowed, setIsWaiting } = useContext(PlayerContext);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!name.trim()) return;
    setMyName(name);
    setIsAdmin(false);
    try {
      const { socket: s, room: r, waiting } = await connectSocket(meetingId, name);
      socket.current = s;
      room.current = r;
      if (waiting) setIsWaiting(true);
      navigate(`/virtual-meet/${meetingId}/meeting`);
    } catch (err) {
      console.error("Failed to connect:", err);
      alert("Could not connect to server. Please try again.");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0B0B0D] to-[#1a1a2e]">
      <div className="bg-[#1e1e2f] rounded-2xl p-8 w-96 shadow-2xl border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Join Virtual Meet</h1>
        <p className="text-sm text-neutral-400 text-center mb-2">Meeting: <span className="text-[#5c89d1] font-mono">{meetingId}</span></p>
        <p className="text-xs text-neutral-500 text-center mb-6">Enter your name to join the meeting</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setControlsAllowed(false)}
              onBlur={() => setControlsAllowed(true)}
              placeholder="Enter your name"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-[#5c89d1] transition-all"
              onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={!name.trim()}
            className="w-full py-3 bg-[#5c89d1] text-white rounded-xl font-semibold text-sm hover:bg-[#4a7bc4] transition-all disabled:opacity-50"
          >
            Join Meeting
          </button>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-4 py-2 text-neutral-500 text-sm hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default JoinLink;
