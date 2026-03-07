# Standor - Deployment Guide

## 🚀 Deploy to Production (100% Free)

This guide shows how to deploy Standor using completely free services.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (free)
- Vercel account (free)
- Render account (free)

## 1️⃣ Database Setup (MongoDB Atlas)

### Create Free Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Click "Build a Database"
4. Choose **FREE** M0 cluster
5. Select region closest to you
6. Click "Create"

### Configure Database
1. Create database user:
   - Username: `standor`
   - Password: Generate strong password
   - Save credentials!

2. Network Access:
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allow from anywhere)

3. Get Connection String:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `standor`

Example:
```
<your-mongodb-atlas-connection-string>
```

## 2️⃣ Backend Deployment (Render)

### Push to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

### Deploy on Render
1. Go to https://render.com
2. Sign up / Log in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `standor-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Add Environment Variables
In Render dashboard, add:
```
PORT=5001
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
DB_URL=<your-mongodb-atlas-connection-string>
AUTH_SECRET=your-secret-key-minimum-32-characters-long
JWT_SECRET=your-jwt-secret-key-also-long
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email
SMTP_PASS=your-brevo-password
FROM_EMAIL=noreply@standor.dev
OPENROUTER_API_KEY=your-openrouter-key
```

### Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Copy your backend URL: `https://standor-backend.onrender.com`

## 3️⃣ Frontend Deployment (Vercel)

### Update API URL
Edit `frontend/.env`:
```env
VITE_API_URL=https://standor-backend.onrender.com
VITE_SOCKET_URL=https://standor-backend.onrender.com
```

### Push to GitHub
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

### Deploy on Vercel
1. Go to https://vercel.com
2. Sign up / Log in with GitHub
3. Click "Add New" → "Project"
4. Import your frontend repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Add Environment Variables
In Vercel dashboard:
```
VITE_API_URL=https://standor-backend.onrender.com
VITE_SOCKET_URL=https://standor-backend.onrender.com
```

### Deploy
- Click "Deploy"
- Wait for deployment (2-3 minutes)
- Your app is live! 🎉

## 4️⃣ Update Backend CORS

After frontend is deployed, update backend environment:

In Render dashboard, update:
```
CLIENT_URL=https://your-app.vercel.app
```

Redeploy backend.

## 5️⃣ Optional Services

### OpenRouter (AI Analysis)
1. Go to https://openrouter.ai/
2. Sign up
3. Get free credits
4. Copy API key
5. Add to Render environment: `OPENROUTER_API_KEY`

### Brevo (Email)
1. Go to https://www.brevo.com/
2. Sign up (300 emails/day free)
3. Go to SMTP & API
4. Copy SMTP credentials
5. Add to Render environment

## 🔧 Post-Deployment

### Test Your App
1. Visit your Vercel URL
2. Register new account
3. Create interview session
4. Test all features

### Monitor
- **Render**: Check logs for errors
- **Vercel**: Check deployment logs
- **MongoDB**: Monitor database usage

## 📊 Free Tier Limits

### Render (Backend)
- ✅ 750 hours/month (enough for 1 app)
- ✅ Sleeps after 15 min inactivity
- ✅ Wakes up on request (~30s delay)

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Always on (no sleep)

### MongoDB Atlas
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ No credit card required

### OpenRouter
- ✅ Free credits for testing
- ✅ Pay-as-you-go after

### Brevo
- ✅ 300 emails/day
- ✅ No credit card required

## 🚨 Important Notes

### Render Free Tier
- App sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Keep-alive services can prevent sleep (optional)

### HTTPS Required
- WebRTC requires HTTPS in production
- Both Render and Vercel provide free SSL

### Environment Variables
- Never commit `.env` files
- Use platform environment variable settings
- Update CLIENT_URL after frontend deployment

## 🔄 Continuous Deployment

Both Render and Vercel auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Automatic deployment starts!
```

## 🐛 Troubleshooting

### Backend not connecting to MongoDB
- Check connection string format
- Verify password has no special characters
- Ensure IP whitelist includes `0.0.0.0/0`

### Frontend can't reach backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### Video not working
- HTTPS is required for WebRTC
- Check browser permissions
- Test on Chrome/Firefox first

### Emails not sending
- Verify Brevo credentials
- Check SMTP settings
- Test with simple email first

## 📈 Scaling (When Needed)

### Free → Paid Transition
When you outgrow free tiers:

1. **Render**: $7/month for always-on
2. **MongoDB**: $9/month for M10 cluster
3. **Vercel**: $20/month for Pro
4. **OpenRouter**: Pay per use

But start with free! It's enough for:
- ✅ Development
- ✅ Testing
- ✅ Small user base
- ✅ Portfolio projects

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string copied
- [ ] Backend pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Backend environment variables set
- [ ] Frontend pushed to GitHub
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables set
- [ ] Backend CLIENT_URL updated
- [ ] Test registration
- [ ] Test session creation
- [ ] Test real-time features
- [ ] Test video/audio
- [ ] Test code execution
- [ ] Test AI analysis (if configured)

## 🎉 Success!

Your Standor app is now live and accessible worldwide!

**Share your URL**: `https://your-app.vercel.app`

---

**Standor** - Deployed with 100% free services ✨
