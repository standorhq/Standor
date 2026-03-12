import { createContext, useState, useRef } from "react";

const PlayerContext = createContext([]);

const ContextProvider = ({ children }) => {
  const [playerKeys, setPlayerKeys] = useState([]);
  const [myName, setMyName] = useState("");
  const [peerConn, setPeerConn] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [controlsAllowed, setControlsAllowed] = useState(true);
  const [screenShared, setScreenShared] = useState(false);
  const [device, setDevice] = useState({ audio: '', video: '' });

  const socket = useRef(null);
  const peer = useRef(null);
  const room = useRef(null);

  return (
    <PlayerContext.Provider
      value={{
        playerKeys, setPlayerKeys,
        myName, setMyName,
        peerConn, setPeerConn,
        socket, peer, room,
        isAdmin, setIsAdmin,
        isWaiting, setIsWaiting,
        pendingUsers, setPendingUsers,
        controlsAllowed, setControlsAllowed,
        setScreenShared, screenShared,
        device, setDevice,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export { ContextProvider, PlayerContext };
