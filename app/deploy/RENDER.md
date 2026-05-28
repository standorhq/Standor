Render deployment guide for Standor backend

This file describes how to deploy `app/backend` to Render using the included `render.yaml` manifest.

1) Connect your GitHub repository to Render
- Go to https://dashboard.render.com and sign in / create an account.
- Click "New" → "Web Service" (or use the "Create from repo" flow).
- When prompted, connect the repository that contains this project and choose the branch you want to deploy (e.g., `main`).

2) Use the manifest in the repo (recommended)
- Render will detect `render.yaml` at the repository root and will create a service named `standor-backend` using the `app/backend/Dockerfile`.
- Ensure the service's build uses Docker (the manifest sets `env: docker`).

3) Required environment variables (set these in the Render service settings, not in the repo)
- `MONGO_URI` — your MongoDB Atlas connection string.
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` — set to `https://api.standor.in/api/auth/google/callback`
- `JWT_SECRET`
- Any other app-specific keys referenced in `app/backend/.env.production.example`

4) Custom domain and DNS
- In Render, go to your service → Settings → Custom Domains and add `api.standor.in`.
- Follow Render's instructions to create a CNAME record in Cloudflare DNS. Typically you'll point `api` to a Render domain like `cname.onrender.com`.
- In Cloudflare, ensure the `api` record is "DNS only" (grey cloud) during setup if Render requests direct mapping; otherwise follow Render's guidance for proxied mode.

5) Update Google Cloud OAuth
- In Google Cloud Console → APIs & Services → OAuth consent and Credentials, add or update the Authorized redirect URI to:
  - `https://api.standor.in/api/auth/google/callback`
- If you have multiple environments (staging/local), keep those entries too.

6) Verify after deploy
- Once Render builds and deploys, check the health endpoint:
```
curl https://api.standor.in/health
```
- Check logs in Render dashboard (Logs tab) for any startup errors.

7) Frontend configuration
- Ensure the frontend uses the backend URL `https://api.standor.in` for API calls and OAuth redirects.
- If the frontend is on Cloudflare Pages, update any backend URL environment in Pages to `https://api.standor.in` and redeploy the frontend.

Notes & troubleshooting
- Do NOT commit secrets to the repository. Use Render's Environment settings to store secrets.
- If your app uses native modules or expects specific OS packages, Dockerfile handles them; confirm the `app/backend/Dockerfile` works locally first:
```
cd app/backend
docker build -t standor-backend .
docker run -e MONGO_URI=<...> -p 4000:4000 standor-backend
```
- If you prefer Fly.io or another host, I can prepare a `fly.toml` instead.

Keeping the service always-on
- Render free plan services may sleep after a period of inactivity. The only sure way to avoid sleep is to use Render's paid "always-on" plan for that service.
- As a lightweight workaround you can use a scheduled GitHub Actions workflow to periodically ping the health endpoint and keep the service warm. This repository includes `.github/workflows/keep-render-awake.yml` which pings `https://api.standor.in/health` every 10 minutes.
- Note: frequent pings are a workaround and may not be as robust as an always-on plan. If uptime is critical (production users, OAuth reliability), prefer the paid always-on plan.

Optional: GitHub Actions to trigger Render deploys
- You can add the included GitHub Actions workflow `.github/workflows/render-ci-deploy.yml` to run on pushes to `main`.
- To let the workflow trigger a Render deploy automatically, add these GitHub repository secrets:
  - `RENDER_API_KEY` — create an API key in Render (Dashboard → Account → API Keys) with deploy permission.
  - `RENDER_SERVICE_ID` — find this in your Render service settings (or from the service URL in the dashboard).
- If these secrets are present the workflow will call the Render API to start a deploy after the CI build.

