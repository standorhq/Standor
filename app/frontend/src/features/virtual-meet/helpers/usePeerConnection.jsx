import { useContext, useEffect } from "react";
import { PlayerContext } from "./contextProvider";
import { useNavigate, useParams } from "react-router-dom";
import { Peer } from "peerjs";
import { getDefaultDevices, getMediaStreamAudio, getMediaStreamVideo } from "./getMedia";

const usePeerConnection = (getMedia, setLoading, triggerMessagePopup, audioStreamRef, videoStreamRef, setMicOn, setCamOn, setIsOwnVideo) => {
  const { socket, peer, playerKeys, peerConn, setDevice, device } = useContext(PlayerContext);
  const navigate = useNavigate();
  const { meetingId } = useParams();

  useEffect(() => {
    if (!socket.current) {
      navigate(`/virtual-meet/${meetingId}`);
      return;
    }
    sessionStorage.clear();

    try {
      const peerConnection = new Peer();
      peerConnection.on("open", () => {
        peer.current = peerConnection;
        getMedia();
        setLoading(false);
        triggerMessagePopup("You've joined the meeting", 4000);
        getDefaultDevices().then((devices) => {
          setDevice({ audio: devices.audioDevice, video: devices.videoDevice });
          // Auto-start mic and camera
          getMediaStreamAudio(audioStreamRef, [], [], socket, peer, devices.audioDevice).then((ok) => {
            if (ok) setMicOn(true);
          });
          getMediaStreamVideo(videoStreamRef, [], peer, devices.videoDevice).then((ok) => {
            if (ok) { setIsOwnVideo(true); setCamOn(true); }
          });
        });
      });
    } catch (error) {
      console.error("Error initializing Peer:", error);
      alert("Server Error, please try again later");
      navigate("/dashboard");
    }
  }, []);
};

export default usePeerConnection;
