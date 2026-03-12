import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const connectSocket = (room, userName) => {
  return new Promise((resolve, reject) => {
    const socket = io(BACKEND_URL, { transports: ["websocket", "polling"] });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error("Socket connection timeout"));
    }, 10000);

    socket.on("connect", () => {
      socket.emit("join", room, userName);
      socket.on("joined-room", (r) => {
        clearTimeout(timeout);
        resolve({ socket, room: r, waiting: false });
      });
      socket.on("vm-waiting", () => {
        clearTimeout(timeout);
        resolve({ socket, room, waiting: true });
      });
      socket.on("room-full", () => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(new Error("Meeting is full (max 150 participants)"));
      });
    });

    socket.on("connect_error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};

export const sendModel = (socket, model) => {
  socket.emit("user-model", model);
};
