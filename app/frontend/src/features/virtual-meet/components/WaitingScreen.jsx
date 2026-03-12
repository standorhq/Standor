import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../helpers/contextProvider";

const WaitingScreen = () => {
  const { socket, setIsWaiting } = useContext(PlayerContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.current) return;

    const handleAdmitted = () => {
      setIsWaiting(false);
    };

    const handleDenied = () => {
      socket.current.disconnect();
      navigate("/virtual-meet", {
        replace: true,
        state: { denied: true },
      });
    };

    socket.current.on("vm-admitted", handleAdmitted);
    socket.current.on("vm-denied", handleDenied);

    return () => {
      socket.current?.off("vm-admitted", handleAdmitted);
      socket.current?.off("vm-denied", handleDenied);
    };
  }, []);

  const handleCancel = () => {
    socket.current?.disconnect();
    navigate("/virtual-meet", { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-[#202124] flex items-center justify-center z-50">
      <div className="bg-[#2d2d30] rounded-2xl p-8 w-96 text-center border border-white/10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#5c89d1]/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#5c89d1] animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Asking to be let in...
        </h2>
        <p className="text-sm text-neutral-400 mb-6">
          You'll join the meeting when the host lets you in.
        </p>
        <div className="flex justify-center mb-6">
          <div className="flex space-x-1.5">
            <div
              className="w-2 h-2 bg-[#5c89d1] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-[#5c89d1] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-[#5c89d1] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="px-6 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WaitingScreen;
