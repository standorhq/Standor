import express from "express";
import path from "path";
import cors from "cors";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import webauthnRoutes from "./routes/webauthnRoutes.js";
import problemsRoutes from "./routes/problemsRoutes.js";
import executionRoutes from "./routes/executionRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";

import { createServer } from "http";
import { initSocket } from "./lib/socket.js";

const app = express();
const httpServer = createServer(app);

const __dirname = path.resolve();

function normalizeOrigin(value) {
  return typeof value === "string" ? value.trim().replace(/\/$/, "") : "";
}

function parseAllowedOrigins() {
  const configured = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (configured.length > 0) {
    return configured.map(normalizeOrigin);
  }

  return ENV.CLIENT_URL ? [normalizeOrigin(ENV.CLIENT_URL)] : [];
}

function isOriginAllowed(origin, rules) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return true;
  if (rules.length === 0) return true;

  return rules.some((rule) => {
    if (!rule) return false;
    if (rule === normalizedOrigin) return true;

    if (rule.includes("*")) {
      const escaped = rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`).test(normalizedOrigin);
    }

    return false;
  });
}

// middleware
app.use(express.json());
// Allow multiple origins via ALLOWED_ORIGINS (comma-separated) or fallback to ENV.CLIENT_URL
const allowedOrigins = parseAllowedOrigins();
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    if (isOriginAllowed(origin, allowedOrigins)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
}));

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/rooms", sessionRoutes);
app.use("/api/webauthn", webauthnRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/execution", executionRoutes);
app.use("/api/meetings", meetingRoutes);

// Replay endpoint (returns session snapshots for replay)
app.get("/api/replay/:roomId", async (req, res) => {
  try {
    const { default: Session } = await import("./models/Session.js");
    const mongoose = await import("mongoose");
    let session;
    if (mongoose.default.Types.ObjectId.isValid(req.params.roomId)) {
      session = await Session.findById(req.params.roomId);
    } else {
      session = await Session.findOne({ roomId: req.params.roomId });
    }
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({
      snapshots: session.codeSnapshots,
      messages: session.messages,
      analyses: session.analyses,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

import { setupCodePairSocket } from "./features/codepair/socketHandler.js";

const startServer = async () => {
  try {
    await connectDB();

    // Initialize Socket.IO
    const io = initSocket(httpServer);

    // Initialize CodePair Socket
    setupCodePairSocket(io);

    httpServer.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("Error starting the server", error);
  }
};

startServer();

// Global error handling to avoid silent exits and aid debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // It's safer to exit on uncaught exceptions in many apps, but for local
  // dev we log and keep the process alive so we can inspect the state.
});