# Standor – Project Memory

## Project Overview
**Standor** is a real-time collaborative coding interview platform.
- Branch: `prototype/base`
- Frontend: Vite + React 18, DaisyUI + Tailwind (theme: "standor"), Framer Motion, **Google OAuth** auth, **WebRTC/PeerJS** video, Socket.IO chat, Monaco Editor
- Backend: Node.js + Express (ESM), MongoDB + Mongoose, **JWT auth**, **node-cron**, **Nodemailer + Brevo SMTP**, **OpenRouter/DeepSeek** AI

## Branding
- Project name: **Standor** (NOT "Talent IQ", NOT "InterviewForge")
- Tagline: "Code Together"
- Logo: SparklesIcon with gradient from-primary to-secondary
- DaisyUI theme: "standor" (dark slate with blue/purple/pink accents)

## Free Stack (ALL 100% Free)
- Auth: Google OAuth (`@react-oauth/google` frontend + `google-auth-library` backend) + email/password
- Video: WebRTC + PeerJS (`peerjs` package)
- Chat: Socket.IO (same server as backend)
- Code Editor: Monaco Editor (`@monaco-editor/react`)
- Code Execution: Piston API (free public — `https://emkc.org/api/v2/piston`)
- AI Analysis: OpenRouter API → DeepSeek Coder (free credits)
- Email: Nodemailer + Brevo SMTP (300 emails/day free)
- Background Jobs: node-cron (snapshot every 30s)
- DB: MongoDB Atlas free tier
- Hosting: Vercel (frontend) + Render (backend)

## Key Architecture (CURRENT STATE)
- JWT stored in localStorage, sent via `Authorization: Bearer <token>`
- Socket.IO handles: code-change, chat-message, join-room, user-joined, user-left, WebRTC signaling (webrtc-offer/answer/ice-candidate)
- PeerJS handles peer-to-peer video streams
- AI analysis: POST /api/sessions/:roomId/analyze → OpenRouter DeepSeek Coder
- Snapshots: POST /api/sessions/:roomId/snapshot → stored in MongoDB (max 20)
- End session: POST /api/sessions/:roomId/end → sends Nodemailer email

## Critical File Paths
- `frontend/src/main.jsx` – GoogleOAuthProvider wrapper
- `frontend/src/App.jsx` – Routes + AuthProvider + SocketProvider
- `frontend/src/context/AuthContext.jsx` – JWT auth state (login, register, logout)
- `frontend/src/context/SocketContext.jsx` – Socket.IO connection
- `frontend/src/lib/api.js` – Axios with JWT interceptor
- `frontend/src/pages/HomePage.jsx` – FAANG-level landing page
- `frontend/src/pages/LoginPage.jsx` – Email/pass + Google OAuth
- `frontend/src/pages/RegisterPage.jsx` – Email/pass + Google OAuth
- `frontend/src/pages/DashboardPage.jsx` – Sessions dashboard with stats
- `frontend/src/pages/SessionPage.jsx` – Full interview UI (editor + PeerJS video + chat + AI)
- `frontend/src/components/VideoCallUI.jsx` – Reusable WebRTC video component
- `backend/src/server.js` – Express + Socket.IO + node-cron
- `backend/src/lib/socket.js` – Socket.IO event handlers
- `backend/src/lib/ai.js` – OpenRouter/DeepSeek Coder integration
- `backend/src/lib/email.js` – Nodemailer + Brevo SMTP
- `backend/src/lib/piston.js` – Piston code execution
- `backend/src/controllers/authController.js` – Google OAuth token verification + JWT
- `backend/src/controllers/sessionController.js` – Session lifecycle
- `backend/src/middleware/auth.js` – JWT middleware (sets req.userId)
- `backend/src/models/User.js` – {email, name, password(select:false), avatar, googleId, role}
- `backend/src/models/Session.js` – {problem, difficulty, host, participant, status, roomId, codeSnapshots[], aiAnalysis}

## Backend .env Variables Required
```
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DB_URL=mongodb+srv://...
JWT_SECRET=<random 64 char hex>
GOOGLE_CLIENT_ID=<from google cloud console>
GOOGLE_CLIENT_SECRET=<from google cloud console>
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<brevo login email>
SMTP_PASS=<brevo smtp password>
FROM_EMAIL=noreply@standor.dev
OPENROUTER_API_KEY=sk-or-v1-...
PISTON_API_URL=https://emkc.org/api/v2/piston
```

## Frontend .env Variables Required
```
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=<same as backend GOOGLE_CLIENT_ID>
```

## User Preferences
- Always use Standor branding (never "Talent IQ" or "InterviewForge")
- Framer Motion for all page/component animations
- DaisyUI components for UI (theme: "standor")
- React Query (TanStack Query v5) for all data fetching
- No paid services — everything must be free

## Running Locally
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```
