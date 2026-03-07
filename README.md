# Standor - Code Together

**Standor** is a real-time collaborative coding interview platform with AI-powered evaluation and structured hiring analytics.

## 🌟 Features

- ✅ **Real-time Collaboration** - Monaco Editor with live code syncing via Socket.IO
- ✅ **Video & Audio** - WebRTC peer-to-peer video calls using PeerJS
- ✅ **Code Execution** - Run code in 20+ languages using Piston API
- ✅ **AI Analysis** - DeepSeek Coder via OpenRouter for code evaluation
- ✅ **Email Feedback** - Automated session reports via Nodemailer + Brevo
- ✅ **Authentication** - Better Auth with Google OAuth support
- ✅ **Session Management** - Create, join, and manage interview sessions
- ✅ **Code Snapshots** - Automatic code saving every 30 seconds
- ✅ **Dashboard** - View active and completed sessions

## 🛠️ Tech Stack (100% Free)

### Frontend
- **Framework**: React 18 + Vite
- **UI**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **Code Editor**: Monaco Editor
- **State Management**: Zustand + TanStack Query
- **Real-time**: Socket.IO Client
- **Video**: PeerJS (WebRTC)

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: Better Auth (Google OAuth)
- **Real-time**: Socket.IO
- **Code Execution**: Piston API
- **AI Analysis**: DeepSeek Coder (OpenRouter)
- **Email**: Nodemailer + Brevo SMTP
- **Background Jobs**: node-cron

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Google OAuth credentials (optional)
- OpenRouter API key (free credits)
- Brevo SMTP credentials (free tier)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas (free tier)
DB_URL=<your-mongodb-atlas-connection-string>

# Authentication
AUTH_SECRET=your-secret-key-min-32-chars
JWT_SECRET=your-jwt-secret-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Brevo free tier)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email
SMTP_PASS=your-brevo-password
FROM_EMAIL=noreply@standor.dev

# AI Analysis (OpenRouter free credits)
OPENROUTER_API_KEY=your-openrouter-api-key
```

5. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

4. Start frontend development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🚀 Usage

### Creating an Interview Session

1. Register/Login to your account
2. Click "Create Session" on the dashboard
3. Enter problem title and select difficulty
4. Share the room ID with the candidate
5. Start coding together in real-time!

### Joining a Session

1. Login to your account
2. Enter the room ID provided by the interviewer
3. Click "Join Session"
4. Start collaborating!

### Features During Interview

- **Live Code Editor**: Monaco Editor with syntax highlighting
- **Video Call**: Enable camera/microphone for face-to-face interaction
- **Chat**: Send messages in real-time
- **Code Execution**: Run code and see output instantly
- **AI Analysis**: Get automated code review and suggestions
- **Snapshots**: Code is automatically saved every 30 seconds

### After Interview

- Click "End Session" to complete the interview
- AI analysis is performed automatically
- Both participants receive detailed feedback via email
- View session history in the dashboard

## 📁 Project Structure

```
Standor/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── sessionController.js
│   │   │   └── codeController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Session.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── sessionRoutes.js
│   │   │   └── codeRoutes.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── lib/
│   │   │   ├── socket.js
│   │   │   ├── piston.js
│   │   │   ├── ai.js
│   │   │   ├── email.js
│   │   │   └── auth.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:roomId` - Get session details
- `POST /api/sessions/:roomId/join` - Join session
- `POST /api/sessions/:roomId/snapshot` - Save code snapshot
- `POST /api/sessions/:roomId/analyze` - Analyze code with AI
- `POST /api/sessions/:roomId/end` - End session
- `GET /api/sessions/my-sessions` - Get user's sessions

### Code Execution
- `POST /api/code/execute` - Execute code
- `GET /api/code/languages` - Get supported languages

## 🎨 Branding

- **Name**: Standor
- **Tagline**: Code Together
- **Logo**: ✨ Sparkles icon with gradient (primary → secondary → accent)
- **Colors**:
  - Primary: `#3b82f6` (Blue)
  - Secondary: `#8b5cf6` (Purple)
  - Accent: `#ec4899` (Pink)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js for HTTP security headers
- CORS configuration
- Rate limiting (planned)
- Input validation

## 📊 Database Schema

### User Model
```javascript
{
  email: String (unique),
  name: String,
  password: String (hashed),
  avatar: String,
  googleId: String,
  role: String (user/admin),
  createdAt: Date,
  lastLogin: Date
}
```

### Session Model
```javascript
{
  problem: String,
  difficulty: String (easy/medium/hard),
  host: ObjectId (ref: User),
  participant: ObjectId (ref: User),
  status: String (active/completed),
  roomId: String (unique),
  codeSnapshots: [{
    content: String,
    language: String,
    timestamp: Date
  }],
  aiAnalysis: {
    timeComplexity: String,
    spaceComplexity: String,
    correctness: Number,
    bugs: [String],
    suggestions: [String],
    codeStyle: Number,
    overallScore: Number,
    summary: String,
    analyzedAt: Date
  },
  startedAt: Date,
  endedAt: Date
}
```

## 🌐 Deployment

### Backend (Render/Railway)
1. Create new web service
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster
2. Add database user
3. Whitelist IP addresses
4. Copy connection string

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Vaibhav Kumar** - [@vaibhavkumar-in](https://github.com/vaibhavkumar-in)

## 🙏 Acknowledgments

- [Piston API](https://github.com/engineer-man/piston) for code execution
- [OpenRouter](https://openrouter.ai/) for AI model access
- [Brevo](https://www.brevo.com/) for email service
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting
- [Better Auth](https://www.better-auth.com/) for authentication

---

**Standor** - The Standard for Technical Interviews ✨
