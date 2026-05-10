import { io } from "socket.io-client";

function resolveSocketBaseUrl() {
  const envSocket = import.meta.env.VITE_SOCKET_URL;
  const envBackend = import.meta.env.VITE_BACKEND_URL;

  if (typeof envSocket === "string" && envSocket.trim() && envSocket !== "undefined") {
    return envSocket.trim();
  }

  if (typeof envBackend === "string" && envBackend.trim() && envBackend !== "undefined") {
    return envBackend.trim();
  }

  const isLocalHost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  if (isLocalHost) {
    return "http://localhost:4000";
  }

  return typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";
}

const BACKEND_URL = resolveSocketBaseUrl();

export const connectSocket = (room, userName) => {
  return new Promise((resolve, reject) => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

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
      const details = err?.message || "Unknown socket connection error";
      reject(new Error(`Socket connect error: ${details}`));
    });
  });
};

export const sendModel = (socket, model) => {
  socket.emit("user-model", model);
};
