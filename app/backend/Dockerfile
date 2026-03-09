# ── Stage 1: Build TypeScript ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# ── Stage 2: Production runtime ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only copy production deps
COPY package*.json ./
RUN npm ci --frozen-lockfile --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -S standor && adduser -S standor -G standor
USER standor

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "dist/server.js"]
