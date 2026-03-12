import { useState, useContext, useEffect, useRef } from "react";
import { PlayerContext } from "../../helpers/contextProvider";
import { IoClose, IoSend } from "react-icons/io5";

const ChatPanel = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const { peerConn, socket, myName, setControlsAllowed } = useContext(PlayerContext);
  const bottomRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("all");
    if (stored) setChats(JSON.parse(stored).reverse());
  }, []);

  useEffect(() => {
    const onChatEvent = () => {
      const data = JSON.parse(sessionStorage.getItem("all"));
      if (data) setChats([...data].reverse());
    };
    document.addEventListener("chat", onChatEvent);
    return () => document.removeEventListener("chat", onChatEvent);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const curr = { id: socket.current.id, name: myName, message };
    let data = JSON.parse(sessionStorage.getItem("all"));
    if (!data) data = [curr];
    else {
      if (data[0].id === socket.current.id) data.unshift({ ...curr, prev: true });
      else data.unshift(curr);
    }
    sessionStorage.setItem("all", JSON.stringify(data));
    setChats([...data].reverse());
    setMessage("");
    peerConn.forEach((conn) => {
      conn.send({ type: "chat", channel: "all", id: socket.current.id, message });
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <h3 className="text-white font-medium">In-call messages</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10">
          <IoClose size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chats.length === 0 && (
          <div className="text-center text-white/40 text-sm mt-8">
            <p>Messages can only be seen by people in the call and are deleted when the call ends.</p>
          </div>
        )}
        {chats.map((chat, i) => {
          const isSelf = chat.id === socket.current?.id;
          const showName = !chat.prev;
          return (
            <div key={i} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
              {showName && (
                <span className="text-white/50 text-xs mb-1">
                  {isSelf ? "You" : chat.name}
                </span>
              )}
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm break-words ${
                  isSelf
                    ? "bg-[#1a73e8] text-white rounded-br-sm"
                    : "bg-[#3c4043] text-white rounded-bl-sm"
                }`}
              >
                {chat.message}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 bg-[#3c4043] rounded-full px-4 py-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            onFocus={() => setControlsAllowed(false)}
            onBlur={() => setControlsAllowed(true)}
            placeholder="Send a message"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="text-[#8ab4f8] hover:text-[#aecbfa] disabled:text-white/20 transition-colors"
          >
            <IoSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
