import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsMicFill, BsMicMuteFill,
  BsCameraVideoFill, BsCameraVideoOffFill,
} from "react-icons/bs";
import { LuScreenShare, LuScreenShareOff } from "react-icons/lu";
import { MdCallEnd, MdPeopleAlt, MdChat, MdMoreVert } from "react-icons/md";
import { IoSettings } from "react-icons/io5";
import { PlayerContext } from "../../helpers/contextProvider";
import { getMediaStreamAudio, getMediaStreamVideo, getMediaStreamScreen } from "../../helpers/getMedia";

const GmeetBottomBar = ({
  audioStreamRef, videoStreamRef, screenStreamRef,
  setIsOwnVideo, setScreen, screen,
  micOn, setMicOn, camOn, setCamOn,
  sidePanel, setSidePanel,
  participantCount, unreadChat, screenShared,
}) => {
  const [showLeaveMenu, setShowLeaveMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const { peerConn, socket, peer, playerKeys, setPlayerKeys, setPeerConn, isAdmin, setScreenShared, device, setDevice } =
    useContext(PlayerContext);
  const navigate = useNavigate();
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMic = async () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
      setMicOn(false);
      peerConn.forEach((conn) => {
        conn.send({ type: "audio", audio: false, socketId: socket.current.id });
      });
    } else {
      const done = await getMediaStreamAudio(audioStreamRef, playerKeys, peerConn, socket, peer, device.audio);
      if (done) {
        setMicOn(true);
        peerConn.forEach((conn) => {
          conn.send({ type: "audio", audio: true, socketId: socket.current.id });
        });
      }
    }
  };

  const handleCamera = async () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
      setIsOwnVideo(false);
      setCamOn(false);
    } else {
      const done = await getMediaStreamVideo(videoStreamRef, playerKeys, peer, device.video);
      if (done) { setIsOwnVideo(true); setCamOn(true); }
    }
  };

  const handleScreenShare = () => {
    if (screenShared.current) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      setScreen(false);
      setScreenShared(false);
      screenStreamRef.current = null;
      peerConn.forEach((conn) => {
        conn.send({ type: "screen", screen: false, peerId: peer.current.id });
      });
      return;
    }
    if (screen) return; // someone else is sharing
    getMediaStreamScreen(screenStreamRef, playerKeys, peerConn, peer).then((done) => {
      if (done) {
        setScreen(true);
        setScreenShared(true);
        screenStreamRef.current.getTracks()[0].onended = () => {
          setScreen(false);
          setScreenShared(false);
          screenStreamRef.current = null;
          peerConn.forEach((conn) => {
            conn.send({ type: "screen", screen: false, peerId: peer.current.id });
          });
        };
      }
    });
  };

  const stopAllMedia = () => {
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioStreamRef.current = null;
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
  };

  const leaveMeeting = () => {
    stopAllMedia();
    socket.current.disconnect();
    peer.current.destroy();
    setPlayerKeys([]);
    setPeerConn([]);
    navigate("/dashboard", { replace: true });
  };

  const endForAll = () => {
    stopAllMedia();
    socket.current.emit("end-for-all");
    socket.current.disconnect();
    peer.current.destroy();
    setPlayerKeys([]);
    setPeerConn([]);
    navigate("/dashboard", { replace: true });
  };

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
    } catch { /* ignore */ }
  };

  const ControlButton = ({ onClick, active, danger, children, badge, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
        danger
          ? "bg-[#ea4335] hover:bg-[#d33426] text-white"
          : active
          ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white"
          : "bg-[#ea4335] hover:bg-[#d33426] text-white"
      }`}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#1a73e8] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="h-20 bg-[#202124] flex items-center justify-between px-4 shrink-0 relative border-t border-white/10">
      {/* Left: Meeting info */}
      <div className="flex items-center w-[200px]">
        <span className="text-white/60 text-xs">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Center: Controls */}
      <div className="flex items-center gap-3">
        <ControlButton onClick={handleMic} active={micOn} title={micOn ? "Turn off microphone" : "Turn on microphone"}>
          {micOn ? <BsMicFill size={20} /> : <BsMicMuteFill size={20} />}
        </ControlButton>

        <ControlButton onClick={handleCamera} active={camOn} title={camOn ? "Turn off camera" : "Turn on camera"}>
          {camOn ? <BsCameraVideoFill size={20} /> : <BsCameraVideoOffFill size={20} />}
        </ControlButton>

        <ControlButton
          onClick={handleScreenShare}
          active={!screenShared.current}
          title={screenShared.current ? "Stop presenting" : "Present now"}
        >
          {screenShared.current ? <LuScreenShareOff size={20} /> : <LuScreenShare size={20} />}
        </ControlButton>

        {/* People */}
        <button
          onClick={() => setSidePanel(sidePanel === "people" ? null : "people")}
          title="People"
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            sidePanel === "people" ? "bg-[#8ab4f8] text-[#202124]" : "bg-[#3c4043] hover:bg-[#4a4d51] text-white"
          }`}
        >
          <MdPeopleAlt size={20} />
          <span className="absolute -top-1 -right-1 bg-[#3c4043] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center border border-white/20">
            {participantCount}
          </span>
        </button>

        {/* Chat */}
        <button
          onClick={() => setSidePanel(sidePanel === "chat" ? null : "chat")}
          title="Chat"
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            sidePanel === "chat" ? "bg-[#8ab4f8] text-[#202124]" : "bg-[#3c4043] hover:bg-[#4a4d51] text-white"
          }`}
        >
          <MdChat size={20} />
          {unreadChat > 0 && sidePanel !== "chat" && (
            <span className="absolute -top-1 -right-1 bg-[#1a73e8] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
              {unreadChat > 9 ? "9+" : unreadChat}
            </span>
          )}
        </button>

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => { setShowSettings(!showSettings); loadDevices(); }}
            title="Settings"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3c4043] hover:bg-[#4a4d51] text-white transition-colors"
          >
            <IoSettings size={20} />
          </button>

          {showSettings && (
            <div className="absolute bottom-full mb-2 right-0 bg-[#2d2e30] rounded-xl p-4 w-72 shadow-2xl z-50 border border-white/10">
              <h3 className="text-white text-sm font-medium mb-3">Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs block mb-1">Microphone</label>
                  <select
                    value={device.audio}
                    onChange={(e) => setDevice((p) => ({ ...p, audio: e.target.value }))}
                    className="w-full bg-[#3c4043] text-white text-sm rounded-lg px-3 py-2 border border-white/10 outline-none"
                  >
                    {audioDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || "Microphone"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-xs block mb-1">Camera</label>
                  <select
                    value={device.video}
                    onChange={(e) => setDevice((p) => ({ ...p, video: e.target.value }))}
                    className="w-full bg-[#3c4043] text-white text-sm rounded-lg px-3 py-2 border border-white/10 outline-none"
                  >
                    {videoDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || "Camera"}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leave / End call */}
        <div className="relative">
          <button
            onClick={() => setShowLeaveMenu(!showLeaveMenu)}
            title="Leave call"
            className="w-14 h-12 rounded-full flex items-center justify-center bg-[#ea4335] hover:bg-[#d33426] text-white transition-colors"
          >
            <MdCallEnd size={24} />
          </button>

          {showLeaveMenu && (
            <div className="absolute bottom-full mb-2 right-0 bg-[#2d2e30] rounded-xl overflow-hidden shadow-2xl z-50 border border-white/10 w-52">
              <button
                onClick={leaveMeeting}
                className="w-full px-4 py-3 text-left text-white text-sm hover:bg-white/10 transition-colors"
              >
                Leave meeting
              </button>
              {isAdmin && (
                <button
                  onClick={endForAll}
                  className="w-full px-4 py-3 text-left text-[#ea4335] text-sm hover:bg-white/10 transition-colors border-t border-white/10"
                >
                  End meeting for all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right spacer */}
      <div className="w-[200px]" />
    </div>
  );
};

export default GmeetBottomBar;
