Standor — What it is and where to try it
======================================

Deployed sites
 - Frontend (public website): https://standor.in
 - Backend API (used by the site): https://api.standor.in

What Standor does (plain language)
 - Standor helps teams capture and understand meetings and sessions quickly.
 - Users can sign in (Google sign-in is supported) and create or join sessions.
 - Sessions let you record or upload audio, and the system extracts transcripts and short "meeting insights" (highlights, action items, and key points).
 - There are collaboration features such as sharing session links and a code-pairing area for technical interviews or live coding.

Key features (user-facing)
 - Easy sign-in with Google.
 - Create, name, and manage sessions.
 - Record or upload meeting audio and get automatic transcripts.
 - Auto-generated meeting insights and highlights to save time.
 - Share sessions with teammates via a link.
 - Live code-pairing area for collaborative coding during sessions.

Where the code lives (quick map)
 - `app/frontend` — the website code (what users visit).
 - `app/backend` — the server code (handles sign-in, data, and session processing).
 - `app/deploy` — example deployment files (cloudflared ingress, service templates).
 - `app/scripts` — helper scripts to run the backend and tunnel on Windows.

Quick start (non-technical)
1. Prepare the machine that will run the server (Windows or Linux). Install Node.js and `cloudflared`.
2. Copy the example environment file and fill secrets locally (do NOT commit these):
	- Copy `app/backend/.env.production.example` → `app/backend/.env` and edit values (database, Google keys, JWT secret).
3. From Windows, start the backend and tunnel together with the helper script:
	- Open PowerShell, go to the scripts folder, and run:

```powershell
cd app/scripts
.\start-backend-and-tunnel.ps1
```

4. Before that script works, make sure your Cloudflare Tunnel config exists at `C:\Users\<you>\\.cloudflared\config.yml` and points at `http://localhost:4000`.
	- Use `app/deploy/ingress.yml` as the template and replace the tunnel UUID and credentials file path.
	- If you want to test just the tunnel by itself, run:

```powershell
cloudflared tunnel --config "~/.cloudflared/config.yml" run <your-tunnel-name>
```

5. Visit the public site and try signing in. If using Google sign-in, ensure the OAuth redirect in Google Cloud Console is set to `https://api.standor.in/api/auth/google/callback`.

Security & secrets (short)
 - Never commit `.env` or files under `~/.cloudflared` to GitHub.
 - Use the provided `.env.production.example` as a template — keep real secrets only on the server where the backend runs.

Need help?
 - Quick checks:
	- Backend health: `curl https://api.standor.in/health` (should return a simple OK message).
	- Tunnel: `cloudflared tunnel list` and `cloudflared tunnel run <name>` for logs.
 - Want step-by-step Windows instructions, a scheduled-run helper, or help verifying Google sign-in? Tell me which and I'll add it.

Auto-start tunnel on Windows (recommended fix for intermittent Error 1033)
- If `https://api.standor.in` sometimes shows "Error 1033" when the tunnel connector is offline, run the included installer to keep the tunnel running under your user profile.
- Script: `app/scripts/install-cloudflared-scheduled-task.ps1` — it creates a Scheduled Task that runs the tunnel runner (`app/scripts/run-cloudflared.ps1`) at user logon using your profile credentials (no secrets are moved to the system account).

Run (from PowerShell as the user who owns the tunnel):

```powershell
cd app/scripts
.\install-cloudflared-scheduled-task.ps1
```

Notes:
- The task runs the runner under your account so the tunnel uses `C:\Users\<you>\\.cloudflared` where your credentials live. This avoids the `systemprofile` credential mismatch that commonly causes service failures.
- If you previously tried to install `cloudflared` as a Windows service and it failed (WIN32_EXIT_CODE 1067), the installer attempts to stop/disable that service (best-effort) but you may still need to remove or disable it as Administrator.
- To run the task immediately after creation: `Start-ScheduledTask -TaskName 'Standor - cloudflared tunnel (user)'` (requires an interactive session).
