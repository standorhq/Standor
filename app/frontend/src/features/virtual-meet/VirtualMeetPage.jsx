import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { ContextProvider, PlayerContext } from "./helpers/contextProvider";
import JoinForm from "./components/JoinForm";
import JoinLink from "./components/JoinLink";
import MainEngine from "./components/MainEngine";
import WaitingScreen from "./components/WaitingScreen";

const MeetingGate = () => {
  const { isWaiting } = useContext(PlayerContext);
  return isWaiting ? <WaitingScreen /> : <MainEngine />;
};

const VirtualMeetPage = () => {
  return (
    <ContextProvider>
      <Routes>
        <Route path="/" element={<JoinForm />} />
        <Route path="/:meetingId" element={<JoinLink />} />
        <Route path="/:meetingId/meeting" element={<MeetingGate />} />
      </Routes>
    </ContextProvider>
  );
};

export default VirtualMeetPage;
