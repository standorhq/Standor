# Standor - Quick Start Guide

## ✅ Complete Project Structure Created

All files have been generated using **100% free tools and APIs**:
- ✅ Backend (Node.js + Express + MongoDB + Socket.IO)
- ✅ Frontend (React + Vite + Monaco Editor + PeerJS)
- ✅ Authentication (Better Auth + JWT)
- ✅ Real-time (Socket.IO + WebRTC)
- ✅ AI Analysis (DeepSeek via OpenRouter)
- ✅ Email (Nodemailer + Brevo)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Configure Backend Environment

Create `backend/.env`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas (free tier)
DB_URL=<your-mongodb-atlas-connection-string>

# Authentication
AUTH_SECRET=your-secret-key-minimum-32-characters-long
JWT_SECRET=your-jwt-secret-key-also-long

# Email (Brevo free tier - optional)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email
SMTP_PASS=your-brevo-password
FROM_EMAIL=noreply@standor.dev

# AI Analysis (OpenRouter free credits - optional)
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 3. Configure Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api/health

## 📋 Required Free Services

### MongoDB Atlas (Required)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Create database user
5. Get connection string
6. Add to `DB_URL` in backend/.env

### OpenRouter (Optional - for AI)
1. Go to https://openrouter.ai/
2. Sign up for free
3. Get free credits
4. Copy API key
5. Add to `OPENROUTER_API_KEY` in backend/.env

### Brevo SMTP (Optional - for emails)
1. Go to https://www.brevo.com/
2. Create free account (300 emails/day)
3. Get SMTP credentials
4. Add to backend/.env

## 🎯 Features Available

### Without Optional Services:
- ✅ User registration/login
- ✅ Create interview sessions
- ✅ Real-time code collaboration
- ✅ Monaco code editor
- ✅ Video/audio calls (WebRTC)
- ✅ Chat messaging
- ✅ Code execution (Piston API)
- ✅ Basic code analysis (fallback)

### With Optional Services:
- ✅ AI-powered code analysis (DeepSeek)
- ✅ Email feedback reports

## 🔧 Troubleshooting

### Backend won't start:
- Check MongoDB connection string
- Ensure all required env variables are set
- Run `npm install` again

### Frontend won't start:
- Check if backend is running
- Verify VITE_API_URL in .env
- Run `npm install` again

### Video not working:
- Allow camera/microphone permissions
- Use HTTPS in production
- Check browser compatibility

## 📦 Project Structure

```
Standor/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API logic
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── lib/            # Services (socket, ai, email)
│   │   └── server.js       # Main server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── context/        # Auth & Socket context
│   │   ├── lib/            # API client
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── .env
└── README.md
```

## 🎨 Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS + DaisyUI
- Monaco Editor
- Socket.IO Client
- PeerJS (WebRTC)
- TanStack Query
- Framer Motion

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- Better Auth + JWT
- Piston API
- OpenRouter (DeepSeek)
- Nodemailer

## 🚀 Next Steps

1. **Test locally** - Create account, start session
2. **Customize** - Modify branding, add features
3. **Deploy** - Use Vercel (frontend) + Render (backend)

## 📝 Notes

- All services used are **100% free**
- No credit card required for basic features
- Production-ready architecture
- Scalable to thousands of users

---

**Standor** - The Standard for Technical Interviews ✨
