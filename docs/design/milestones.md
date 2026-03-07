# Standor — 4-Week Milestone Plan

## Branching Strategy

- `main` — protected, requires PR + CI pass
- `refactor/standor-architecture` — current: full TypeScript monorepo
- `feature/*` — individual features
- `fix/*` — bug fixes
- Commit convention: `type(scope): message` (feat/fix/chore/docs/test/ci)

---

## Week 1 — Prototype (branch: `prototype/base`)

**Goal:** Two users can collaborate in a shared Monaco editor room.

### Deliverables
- [x] Next.js + Express scaffold
- [x] Google OAuth + JWT auth
- [x] Create / join session flow
- [x] Socket.IO code-change sync
- [x] Monaco editor integration
- [x] Basic chat
- [x] WebRTC video (PeerJS)
- [x] Piston code execution

### Acceptance Criteria
- [ ] Two browser tabs join same room, see each other's keystrokes in < 200ms
- [ ] `Run` button executes Python "Hello World" and shows output
- [ ] Auth: register, login, logout cycle works

### E2E smoke test
```bash
pnpm exec playwright test tests/smoke.spec.ts
# Checks: homepage loads, register, create session, join session, type in editor
```

---

## Week 2 — Monorepo & Core (branch: `refactor/standor-architecture`)

**Goal:** Production-grade architecture with TypeScript, Prisma, Yjs CRDT, snapshots.

### Deliverables
- [x] pnpm workspaces + Turborepo
- [x] `apps/web` (Next.js 14 App Router + TypeScript)
- [x] `apps/server` (Express + TypeScript + Prisma)
- [x] `packages/ai-engine` (pluggable adapter)
- [x] Prisma schema with Session, User, CodeSnapshot, AIAnalysis
- [x] Yjs CRDT editor sync via `y-websocket`
- [x] Snapshot persistence every 30s (max 20 per session)
- [x] Zod validation on all routes
- [x] Rate limiting (global + per-endpoint)

### Acceptance Criteria
- [ ] `pnpm typecheck` — zero errors across monorepo
- [ ] `pnpm test` — unit tests pass, coverage > 60% on server core
- [ ] Snapshot saved to DB visible in MongoDB Atlas after 30s
- [ ] Yjs: two editors stay in sync after 100 rapid keystrokes

---

## Week 3 — AI + 3D UI (in progress)

**Goal:** AI analysis, 3D hero, Lighthouse ≥ 85.

### Deliverables
- [x] `packages/ai-engine` OpenRouter → DeepSeek Coder adapter
- [x] `/api/sessions/:roomId/analyze` endpoint
- [x] AI panel in room page (score, complexity, bugs, suggestions)
- [x] 3D hero (`react-three-fiber`, procedural, no GLTF)
- [x] Teal/amber design system (no purple)
- [ ] Playwright E2E: create room → join → type → analyze → verify JSON

### Acceptance Criteria
- [ ] AI endpoint returns valid JSON schema for sample code in < 15s
- [ ] Hero canvas: ≥ 45 FPS on mid device (Chrome DevTools CPU 4× throttle)
- [ ] Lighthouse Performance score ≥ 85 on homepage
- [ ] WCAG AA contrast pass on all text

---

## Week 4 — Polish & CI/CD

**Goal:** Shippable product with CI, E2E, deployment guide.

### Deliverables
- [ ] GitHub Actions CI: lint + typecheck + test + build on every PR
- [ ] Branch protection: `main` requires CI green + 1 review
- [ ] Playwright E2E suite (≥ 5 tests covering critical flows)
- [ ] Email report after session end
- [ ] Deployment guide (Vercel + Render + MongoDB Atlas + Upstash)
- [ ] Demo video recorded

### Acceptance Criteria
- [ ] CI passes on a clean PR to `main`
- [ ] E2E: create room, join, editor sync, run code, AI analyze — all green
- [ ] Demo URL accessible and working
- [ ] No console errors in production build

---

## Commands Quick Reference

```bash
# Bootstrap
git clone https://github.com/standorhq/Standor
cd Standor
corepack enable
pnpm install

# Dev
pnpm dev                   # starts web (3000) + server (4000)

# Check
pnpm typecheck             # TS check all packages
pnpm lint                  # ESLint all packages
pnpm test                  # Jest all packages

# Build
pnpm build                 # full production build

# Database
cd apps/server
pnpm migrate               # prisma db push
pnpm generate              # prisma generate

# E2E
cd apps/web
pnpm exec playwright test
```
