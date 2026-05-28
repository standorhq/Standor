# Deploying Standor using Cloudflare Pages (frontend) + Cloudflare Tunnel (backend)

This guide walks through deploying the frontend to Cloudflare Pages and exposing the backend via Cloudflare Tunnel (`cloudflared`). It assumes you have a GitHub repo (this repository) and MongoDB Atlas already configured.

-- Summary --
- Frontend: Cloudflare Pages (static site) — fast, free, integrates with GitHub.
- Backend: Run on a host (VM / droplet / VPS / your machine) and expose using Cloudflare Tunnel.

## 1) Cloudflare account & Pages (frontend)

1. Create a Cloudflare account at https://dash.cloudflare.com/ if you don't have one.
2. In Cloudflare, go to **Pages** → **Create a project** → Connect to GitHub and pick this repository.
3. Configure build settings:
   - Project root: `app/frontend`
   - Build command: `npm ci && npm run build`
   - Build output directory: `dist`
4. Set any build-time env variables if needed (e.g., `VITE_API_BASE=https://api.yourdomain.com`).
5. Deploy. Note the generated Pages URL (e.g., `standor.pages.dev`) — this will be your `CLIENT_URL`.

Optional: Add your custom domain in Pages settings and follow Cloudflare instructions to verify.

## 2) Prepare the backend host

You can use any Linux host (small VM or even a home server). The steps below assume Ubuntu/Debian.

1. Install Node.js (use same major version as CI; Node 20 is safe). Example with NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Clone your repo and install backend deps:

```bash
git clone https://github.com/<your-org>/Standor.git
cd Standor/app/backend
npm install
```

3. Copy `.env.production.example` to `.env` and fill values (DB_URL, JWT_SECRET, CLIENT_URL, etc.).

4. Start the backend to test locally:

```bash
NODE_ENV=production DB_URL="<atlas-url>" CLIENT_URL="https://standor.pages.dev" JWT_SECRET="..." npm start
```

## 3) Install and configure Cloudflared (Tunnel)

1. Download and install `cloudflared` (see latest on GitHub releases). Example (Linux .deb):

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i ./cloudflared.deb
```

2. Authenticate and create a tunnel:

```bash
cloudflared tunnel login
cloudflared tunnel create standor-backend
```

This writes a credentials file under `~/.cloudflared/<TUNNEL-UUID>.json`.

3. Route a DNS name to the tunnel (set this hostname in Cloudflare DNS):

```bash
cloudflared tunnel route dns standor-backend api.yourdomain.com
```

4. Edit `app/deploy/ingress.yml` and set `tunnel` to your tunnel UUID and `credentials-file` path. Confirm `hostname` matches `api.yourdomain.com`.

5. Install the tunnel as a systemd service (optional) and place the `ingress.yml` at `/etc/cloudflared/ingress.yml`. Use the `app/deploy/cloudflared.service` template.

Example commands:

```bash
sudo mkdir -p /etc/cloudflared
sudo chown root:root /etc/cloudflared
sudo cp ./app/deploy/ingress.yml /etc/cloudflared/ingress.yml
sudo cp ~/.cloudflared/<TUNNEL-UUID>.json /etc/cloudflared/<TUNNEL-UUID>.json
sudo cp ./app/deploy/cloudflared.service /etc/systemd/system/cloudflared.service
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared
```

6. Confirm the tunnel is running and serving:

```bash
sudo systemctl status cloudflared
curl -v https://api.yourdomain.com/health
```

If you get the backend health response, the tunnel is working.

## 4) Notes on WebSockets (socket.io)

Cloudflare Tunnel supports WebSockets and should work with socket.io. If you use Cloudflare Workers or Pages Functions in front of the tunnel, test sockets thoroughly.

## 5) CI / Auto deploy

- Pages auto-deploys on push to the connected branch.
- Backend updates: you can `git pull` on the host and restart the Node service, or implement a CI/CD job that builds and restarts the host service.

## 6) Security

- Keep `~/.cloudflared` and credentials file secret.
- Store DB and API secrets as host environment variables or use a secret manager.

---

If you want, I can:
- generate a ready-to-edit `ingress.yml` with placeholders (already added under `app/deploy/ingress.yml`),
- generate a `cloudflared` systemd unit file (already added under `app/deploy/cloudflared.service`), and
- create `.env.production.example` (already added).

Next step suggestion: tell me which domain you will use (or if you want to use the default `pages.dev` domain), and I will provide the exact commands you should run (copy-paste ready) to create the tunnel and route the DNS.
