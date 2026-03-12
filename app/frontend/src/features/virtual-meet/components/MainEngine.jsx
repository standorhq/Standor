import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { sendModel } from "../helpers/socketConnection";
import { PlayerContext } from "../helpers/contextProvider";
import { LoaderSync } from "../helpers/loaders";
import usePeerConnection from "../helpers/usePeerConnection";
import useSetupSocketEvents from "../helpers/useSetupSocketEvents";
import usePeerDataHandlers from "../helpers/usePeerDataHandlers";
import GmeetBottomBar from "./gmeet/GmeetBottomBar";
import GmeetTopBar from "./gmeet/GmeetTopBar";
import VideoGrid from "./gmeet/VideoGrid";
import ChatPanel from "./gmeet/ChatPanel";
import ParticipantsPanel from "./gmeet/ParticipantsPanel";
import ScreenShareView from "./gmeet/ScreenShareView";

function MainEngine() {
  const { socket, peer, room, myName, playerKeys, isAdmin, setIsAdmin, pendingUsers, setPendingUsers } =
    useContext(PlayerContext);

  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState(false);
  const [isOwnVideo, setIsOwnVideo] = useState(false);
  const [videos, setVideos] = useState({});
  const [audios, setAudios] = useState({});
  const [audioIcon, setAudioIcon] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [sidePanel, setSidePanel] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);

  const screenShared = useRef(false);
  const audioStreamRef = useRef(null);
  const videoStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const screenShareInfo = useRef(null);
  const povRef = useRef(null);
  const randomPositionX = useRef(0);
  const randomPositionZ = useRef(0);
  const players = useRef(null);
  const playersRef = useRef(new Map());
  const videoRef = useRef(new Map());

  const getMap = useCallback(() => playersRef.current, []);
  const triggerMessagePopup = useCallback((msg, duration) => {
    setNotification({ show: true, message: msg });
    setTimeout(() => setNotification({ show: false, message: "" }), duration);
  }, []);

  const getMedia = useCallback(() => {
    sendModel(socket.current, { peerId: peer.current.id, name: myName });
    if (isAdmin) setIsAdmin(true);
    setupSocket();
    handleIncomingCall();
    handlePeerConnection();
  }, [socket, peer, myName, isAdmin]);

  usePeerConnection(getMedia, setLoading, triggerMessagePopup, audioStreamRef, videoStreamRef, setMicOn, setCamOn, setIsOwnVideo);

  const { handleIncomingCall, handlePeerConnection, dataChannel } = usePeerDataHandlers(
    players, playersRef, videos, audios,
    videoStreamRef, audioStreamRef, screenStreamRef,
    screenShareInfo, povRef, randomPositionX, randomPositionZ,
    setScreen, setVideos, setAudios, setAudioIcon, triggerMessagePopup
  );

  const { setupSocket } = useSetupSocketEvents(
    randomPositionX, randomPositionZ, setLoading, triggerMessagePopup,
    dataChannel, players, playersRef, videos, videoRef,
    audioStreamRef, videoStreamRef, screenStreamRef
  );

  useEffect(() => {
    if (!socket.current || !isAdmin) return;
    const handlePendingUsers = (users) => setPendingUsers(users);
    socket.current.on("vm-pending-users", handlePendingUsers);
    return () => socket.current?.off("vm-pending-users", handlePendingUsers);
  }, [isAdmin]);

  useEffect(() => {
    const onChat = () => {
      if (sidePanel !== "chat") setUnreadChat((p) => p + 1);
    };
    document.addEventListener("chat", onChat);
    return () => document.removeEventListener("chat", onChat);
  }, [sidePanel]);

  useEffect(() => {
    if (sidePanel === "chat") setUnreadChat(0);
  }, [sidePanel]);

  const participantCount = 1 + playerKeys.length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#202124] flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <LoaderSync />
          <p className="text-white/60 text-sm">Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#202124] flex flex-col overflow-hidden select-none z-50">
      <GmeetTopBar participantCount={participantCount} notification={notification} />

      {/* Admin: pending user admission notifications */}
      {isAdmin && pendingUsers.length > 0 && (
        <div className="absolute top-16 right-4 z-[60] space-y-2 max-h-[50vh] overflow-y-auto">
          {pendingUsers.map((user) => (
            <div
              key={user.socketId}
              className="bg-[#303134] rounded-xl p-4 border border-white/10 shadow-lg w-80 flex items-center justify-between animate-slideIn"
            >
              <div>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-neutral-400 text-xs">wants to join this meeting</p>
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <button
                  onClick={() => socket.current?.emit("vm-admit", user.socketId)}
                  className="px-3 py-1.5 bg-[#5c89d1] text-white text-xs font-medium rounded-lg hover:bg-[#4a7bc4] transition-colors"
                >
                  Admit
                </button>
                <button
                  onClick={() => socket.current?.emit("vm-deny", user.socketId)}
                  className="px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/20 transition-colors"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
          {screen && screenStreamRef.current ? (
            <ScreenShareView
              screenStreamRef={screenStreamRef}
              screenShareInfo={screenShareInfo}
              players={players}
              screenShared={screenShared}
              playerKeys={playerKeys}
              videos={videos}
              audios={audios}
              audioIcon={audioIcon}
              myName={myName}
              isOwnVideo={isOwnVideo}
              videoStreamRef={videoStreamRef}
              micOn={micOn}
            />
          ) : (
            <VideoGrid
              playerKeys={playerKeys}
              players={players}
              videos={videos}
              audios={audios}
              audioIcon={audioIcon}
              myName={myName}
              isOwnVideo={isOwnVideo}
              videoStreamRef={videoStreamRef}
              micOn={micOn}
            />
          )}
        </div>

        {sidePanel && (
          <div className="w-[360px] flex flex-col bg-[#202124] shrink-0 animate-slideIn">
            {sidePanel === "chat" && <ChatPanel onClose={() => setSidePanel(null)} />}
            {sidePanel === "people" && (
              <ParticipantsPanel
                onClose={() => setSidePanel(null)}
                playerKeys={playerKeys}
                players={players}
                audioIcon={audioIcon}
                videos={videos}
                myName={myName}
                isAdmin={isAdmin}
                micOn={micOn}
                camOn={camOn}
              />
            )}
          </div>
        )}
      </div>

      <GmeetBottomBar
        audioStreamRef={audioStreamRef}
        videoStreamRef={videoStreamRef}
        screenStreamRef={screenStreamRef}
        setIsOwnVideo={setIsOwnVideo}
        setScreen={setScreen}
        screen={screen}
        micOn={micOn}
        setMicOn={setMicOn}
        camOn={camOn}
        setCamOn={setCamOn}
        sidePanel={sidePanel}
        setSidePanel={setSidePanel}
        participantCount={participantCount}
        unreadChat={unreadChat}
        screenShared={screenShared}
      />
    </div>
  );
}

export default MainEngine;
