# Quick deploy notes — Cloudflare Pages + Cloudflared (ephemeral tunnel)

This file shows the minimal commands to publish the frontend to Cloudflare Pages and expose the backend using `cloudflared`.

Frontend (publish from local build):

```powershell
cd "e:\Major Project\Standor\Standor\app\frontend"
npm install
npm run build
# publish using wrangler (requires `wrangler` login/config)
npx wrangler pages publish build --project-name standor-frontend
```

Backend (ephemeral tunnel for testing):

```powershell
cd "e:\Major Project\Standor\Standor\app\backend"
npm install
# run backend locally
npm run dev
# in a separate shell, after installing cloudflared and logging in:
cloudflared login
cloudflared tunnel --url http://localhost:4000
# copy the printed trycloudflare.com URL and set it in Cloudflare Pages env `VITE_BACKEND_URL`
```

Notes:
- For a persistent tunnel mapped to a hostname you'll need to create a named tunnel and add DNS in your Cloudflare dashboard — see `app/backend/.cloudflared/config.yml.example` for a sample.
- Keep sensitive env vars (Mongo URI, API keys) only on the machine running the backend or in Cloudflare Pages / other host secret stores.
