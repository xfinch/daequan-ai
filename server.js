require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schemas
const DecisionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'task', 'alert', 'insight', 'action'
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  metadata: mongoose.Schema.Types.Mixed,
  userId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  photo: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const Decision = mongoose.model('Decision', DecisionSchema);
const User = mongoose.model('User', UserSchema);

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'daequan-ai-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0]?.value,
        photo: profile.photos[0]?.value
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Socket.io authentication middleware
io.use((socket, next) => {
  const sessionId = socket.handshake.auth.sessionId;
  if (sessionId) {
    // Validate session exists
    socket.sessionId = sessionId;
  }
  next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to broadcast decisions
async function broadcastDecision(decision) {
  io.emit('decision', decision);
  
  // Also save to DB
  const newDecision = new Decision(decision);
  await newDecision.save();
}

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/');
  });
});

// API Routes
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: {
        id: req.user._id,
        displayName: req.user.displayName,
        email: req.user.email,
        photo: req.user.photo
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Decision API
app.get('/api/decisions', async (req, res) => {
  try {
    const { limit = 50, status, priority } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const decisions = await Decision.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(decisions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/decisions', async (req, res) => {
  try {
    const decision = new Decision({
      ...req.body,
      userId: req.user?._id
    });
    await decision.save();
    
    // Broadcast to all connected clients
    io.emit('decision:new', decision);
    
    res.status(201).json(decision);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/decisions/:id', async (req, res) => {
  try {
    const decision = await Decision.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (decision) {
      io.emit('decision:update', decision);
    }
    
    res.json(decision);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected routes
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

app.get('/dashboard', requireAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard - Daequan AI</title>
      <script src="/socket.io/socket.io.js"></script>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #667eea; }
        .user-info { display: flex; align-items: center; gap: 15px; margin: 20px 0; }
        .user-info img { width: 60px; height: 60px; border-radius: 50%; }
        .logout-btn { 
          background: #dc3545; color: white; padding: 12px 24px; 
          border: none; border-radius: 8px; cursor: pointer; text-decoration: none;
          display: inline-block;
        }
        .decisions { 
          background: white; padding: 20px; border-radius: 16px; margin-top: 30px;
          max-height: 500px; overflow-y: auto;
        }
        .decision { 
          padding: 15px; border-bottom: 1px solid #eee; 
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .decision-header { display: flex; justify-content: space-between; align-items: center; }
        .priority { 
          padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;
        }
        .priority.critical { background: #dc3545; color: white; }
        .priority.high { background: #fd7e14; color: white; }
        .priority.medium { background: #ffc107; color: black; }
        .priority.low { background: #6c757d; color: white; }
        .status {
          padding: 4px 12px; border-radius: 12px; font-size: 12px;
          background: #e9ecef;
        }
        .live-indicator {
          display: inline-flex; align-items: center; gap: 8px;
          color: #28a745; font-size: 14px;
        }
        .live-dot {
          width: 8px; height: 8px; background: #28a745;
          border-radius: 50%; animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome, ${req.user.displayName}</h1>
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span>Live Updates Active</span>
        </div>
        <div class="user-info">
          ${req.user.photo ? `<img src="${req.user.photo}" alt="Profile">` : ''}
          <div>
            <p><strong>Email:</strong> ${req.user.email}</p>
            <p><strong>ID:</strong> ${req.user._id}</p>
          </div>
        </div>
        <a href="/auth/logout" class="logout-btn">Logout</a>
        
        <div class="decisions" id="decisions">
          <h2>Recent Decisions</h2>
          <div id="decisionList">Loading...</div>
        </div>
      </div>
      
      <script>
        const socket = io();
        const decisionList = document.getElementById('decisionList');
        
        // Load initial decisions
        fetch('/api/decisions?limit=20')
          .then(r => r.json())
          .then(decisions => {
            decisionList.innerHTML = decisions.map(d => renderDecision(d)).join('');
          });
        
        // Listen for new decisions
        socket.on('decision:new', (decision) => {
          const div = document.createElement('div');
          div.innerHTML = renderDecision(decision);
          decisionList.insertBefore(div.firstChild, decisionList.firstChild);
        });
        
        // Listen for updates
        socket.on('decision:update', (decision) => {
          // Update existing decision in UI
          console.log('Decision updated:', decision);
        });
        
        function renderDecision(d) {
          return \`
            <div class="decision" data-id="\${d._id}">
              <div class="decision-header">
                <strong>\${d.title}</strong>
                <span class="priority \${d.priority}">\${d.priority}</span>
              </div>
              <p>\${d.description || ''}</p>
              <small>\${new Date(d.createdAt).toLocaleString()}</small>
            </div>
          \`;
        }
      </script>
    </body>
    </html>
  `);
});

// Login page
app.get('/login', (req, res) => {
  res.send(/* same as before */ `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - Daequan AI</title>
      <style>
        body { 
          font-family: -apple-system, sans-serif; 
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .login-card {
          background: white; padding: 40px; border-radius: 20px;
          text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #333; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 30px; }
        .google-btn {
          background: #4285f4; color: white;
          padding: 14px 28px; border: none; border-radius: 8px;
          font-size: 16px; cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
        }
        .google-btn:hover { background: #357ae8; }
        .back-link { color: #667eea; text-decoration: none; display: block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="login-card">
        <h1>Sign In</h1>
        <p>Access your Daequan AI dashboard</p>
        <a href="/auth/google" class="google-btn">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </a>
        <a href="/" class="back-link">← Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Daequan AI server running on port ${PORT}`);
  console.log(`📊 MongoDB: Connected to Railway`);
  console.log(`⚡ Socket.io: Real-time updates enabled`);
});

module.exports = { app, server, io, broadcastDecision, Decision };
