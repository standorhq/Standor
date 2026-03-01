# Standor

Standor is a real-time collaborative coding interview platform with AI-powered evaluation and structured hiring analytics.

## Vision

To become the standard infrastructure for technical interviews.

## Core Features (Planned)

- Real-time collaborative code editor (Monaco + WebSockets)
- AI-based code analysis (complexity, bug detection, style scoring)
- Interview room management
- Code snapshots & persistence
- Recruiter analytics dashboard
- Scalable WebSocket architecture

## Tech Stack

- Frontend: Next.js 15 + TypeScript
- Backend: Node.js + Express + Socket.io
- Database: MongoDB + Prisma
- AI: OpenAI
- Realtime Sync: Yjs (CRDT)
- Deployment: Vercel + MongoDB Atlas

## Architecture (Planned)

apps/
  web/        -> Frontend application
  server/     -> Backend API + WebSocket server

packages/
  ai-engine/  -> AI analysis layer
  shared/     -> Shared utilities & types

docs/
  Architecture & design documents

---

**Standor — The Standard for Technical Interviews**
