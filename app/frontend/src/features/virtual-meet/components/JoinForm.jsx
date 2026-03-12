import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../helpers/contextProvider";
import { connectSocket } from "../helpers/socketConnection";

const JoinForm = () => {
  const [name, setName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const { socket, room, setMyName, setIsAdmin, setControlsAllowed, setIsWaiting } = useContext(PlayerContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (history.state?.fromAdmin) {
      alert("The meeting has been ended by the admin.");
    }
  }, []);

  const handleJoin = async (roomId, admin) => {
    if (!name.trim()) return;
    setMyName(name);
    setIsAdmin(admin);
    try {
      const { socket: s, room: r, waiting } = await connectSocket(roomId, name);
      socket.current = s;
      room.current = r;
      if (waiting) setIsWaiting(true);
      navigate(`/virtual-meet/${roomId}/meeting`);
    } catch (err) {
      console.error("Failed to connect:", err);
      alert("Could not connect to server. Please try again.");
    }
  };

  const createMeeting = () => {
    const id = Math.random().toString(36).substring(2, 10);
    handleJoin(id, true);
  };

  const joinMeeting = () => {
    if (!meetingId.trim()) return;
    handleJoin(meetingId, false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0B0B0D] to-[#1a1a2e]">
      <div className="bg-[#1e1e2f] rounded-2xl p-8 w-96 shadow-2xl border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Virtual Meet</h1>
        <p className="text-sm text-neutral-400 text-center mb-6">Video Meeting Room</p>

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
            />
          </div>

          <button
            onClick={createMeeting}
            disabled={!name.trim()}
            className="w-full py-3 bg-[#5c89d1] text-white rounded-xl font-semibold text-sm hover:bg-[#4a7bc4] transition-all disabled:opacity-50"
          >
            Create New Meeting
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs text-neutral-500">or join existing</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Meeting ID</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              onFocus={() => setControlsAllowed(false)}
              onBlur={() => setControlsAllowed(true)}
              placeholder="Enter meeting ID"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-[#5c89d1] transition-all"
            />
          </div>

          <button
            onClick={joinMeeting}
            disabled={!name.trim() || !meetingId.trim()}
            className="w-full py-3 bg-white/[0.06] border border-white/[0.08] text-white rounded-xl font-semibold text-sm hover:bg-white/[0.1] transition-all disabled:opacity-50"
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

export default JoinForm;
