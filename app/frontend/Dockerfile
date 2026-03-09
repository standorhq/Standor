# ── Stage 1: Build ──────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_BACKEND_URL=http://localhost:4000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

# ── Stage 2: Serve via nginx (SPA) ──────────────────────────────────
FROM nginx:1.25-alpine AS runner

COPY --from=builder /app/build /usr/share/nginx/html

# nginx config for SPA: all routes → index.html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n  gzip on;\n  gzip_types text/plain text/css application/json application/javascript;\n}\n' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
