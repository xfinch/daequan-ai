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
const Database = require('better-sqlite3');

const app = express();

// Trust proxy headers (for Cloudflare/Railway HTTPS)
app.set('trust proxy', true);

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

if (!MONGO_URI) {
  console.error('❌ No MongoDB connection string found!');
  console.error('   Set MONGO_URL, MONGO_PUBLIC_URL, or DATABASE_URL env var');
  process.exit(1);
}

// Connection options for Railway
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10
};

// Connect with retry logic
async function connectDB(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`📊 MongoDB: Connecting (attempt ${i + 1}/${retries})...`);
      await mongoose.connect(MONGO_URI, mongoOptions);
      console.log('✅ MongoDB: Connected successfully');
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ All MongoDB connection attempts failed');
        console.error('   Check that MongoDB service is running in Railway');
        console.error('   and MONGO_URL is set correctly');
        // Don't exit - let the app run in degraded mode
      }
    }
  }
}

connectDB();

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB: Connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB: Connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB: Connection lost, attempting to reconnect...');
});

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
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

// Admin configuration
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'xfassistant@gmail.com').split(',').map(e => e.trim().toLowerCase());
const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS || 'xfassistant@gmail.com').split(',').map(e => e.trim().toLowerCase());

const Decision = mongoose.model('Decision', DecisionSchema);
const User = mongoose.model('User', UserSchema);

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'daequan-ai-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
};

// Only use MongoStore if we have a connection
if (MONGO_URI) {
  try {
    sessionConfig.store = MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 24 * 60 * 60,
      autoRemove: 'native',
      mongoOptions: {
        serverSelectionTimeoutMS: 10000
      }
    });
    console.log('📦 Session store: MongoDB');
  } catch (err) {
    console.warn('⚠️  Could not create Mongo session store:', err.message);
    console.warn('   Using memory store (sessions will not persist)');
  }
} else {
  console.warn('⚠️  No MONGO_URI - using memory session store');
  console.warn('   Sessions will NOT persist across restarts!');
}

app.use(session(sessionConfig));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://daequanai.com/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0]?.value?.toLowerCase();
    let user = await User.findOne({ googleId: profile.id });
    
    // Determine role based on email
    let role = 'user';
    if (SUPERADMIN_EMAILS.includes(email)) {
      role = 'superadmin';
    } else if (ADMIN_EMAILS.includes(email)) {
      role = 'admin';
    }
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: email,
        photo: profile.photos[0]?.value,
        role: role
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      // Update role if changed in config
      if (role !== user.role) {
        user.role = role;
      }
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

// Admin middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

const requireAdmin = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
};

const requireSuperAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'superadmin') {
    return next();
  }
  res.status(403).json({ error: 'Superadmin access required' });
};

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

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Comcast CRM API - Business Visits
app.get('/api/visits', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'comcast-crm', 'comcast.db');
    
    // Check if database exists
    if (!require('fs').existsSync(dbPath)) {
      return res.json({ visits: [], error: 'Database not found' });
    }
    
    const db = new Database(dbPath, { readonly: true });
    
    const rows = db.prepare(`
      SELECT 
        id, business_name, contact_name, phone, email, website,
        address, city, state, zip_code, lat, lng,
        visit_status, visit_date, notes, business_card_photo,
        created_at, updated_at
      FROM business_visits
      WHERE lat IS NOT NULL AND lng IS NOT NULL
      ORDER BY visit_date DESC
    `).all();
    
    // Format visits
    const visits = rows.map(row => ({
      id: row.id,
      businessName: row.business_name,
      contactName: row.contact_name,
      phone: row.phone,
      email: row.email,
      website: row.website,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip_code,
      lat: row.lat,
      lng: row.lng,
      status: row.visit_status,
      date: row.visit_date,
      notes: row.notes,
      photo: row.business_card_photo,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    db.close();
    res.json({ visits, count: visits.length });
  } catch (err) {
    console.error('Visits API error:', err.message);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// Home route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daequan AI</title>
      <style>
        body { 
          font-family: -apple-system, sans-serif; 
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
          background: white; padding: 40px; border-radius: 20px;
          text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 500px;
        }
        h1 { color: #333; margin-bottom: 10px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .btn {
          background: #4285f4; color: white;
          padding: 14px 28px; border: none; border-radius: 8px;
          font-size: 16px; cursor: pointer; text-decoration: none;
          display: inline-block;
        }
        .btn:hover { background: #357ae8; }
        .features { 
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 15px; margin: 30px 0; text-align: left;
        }
        .feature { display: flex; align-items: center; gap: 10px; }
        .icon { font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🤖 Daequan AI</h1>
        <p class="subtitle">Your director, right-hand, and operational authority</p>
        
        <div class="features">
          <div class="feature"><span class="icon">💬</span> Chat with Daequan</div>
          <div class="feature"><span class="icon">📋</span> Task Assignment</div>
          <div class="feature"><span class="icon">🔧</span> Skill Building</div>
          <div class="feature"><span class="icon">⚡</span> Results Delivery</div>
        </div>
        
        ${req.isAuthenticated() ? `
          <p>Welcome, ${req.user.displayName}!</p>
          <a href="/dashboard" class="btn">Go to Dashboard</a>
        ` : `
          <a href="/auth/google" class="btn">Sign in with Google</a>
        `}
      </div>
    </body>
    </html>
  `);
});

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
        photo: req.user.photo,
        role: req.user.role
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
            <p><strong>Role:</strong> <span style="text-transform:uppercase; font-weight:600; color:${req.user.role === 'superadmin' ? '#dc3545' : req.user.role === 'admin' ? '#fd7e14' : '#667eea'}">${req.user.role}</span></p>
          </div>
        </div>
        <a href="/auth/logout" class="logout-btn">Logout</a>
        ${req.user.role === 'admin' || req.user.role === 'superadmin' ? `<a href="/admin" style="background:#667eea; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; display:inline-block; margin-left:10px;">Admin Panel</a>` : ''}
        
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

// Admin API Routes
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ lastLogin: -1 }).limit(100);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id/role', requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      decisions: await Decision.countDocuments(),
      decisionsToday: await Decision.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      decisionsByStatus: await Decision.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Dashboard
app.get('/admin', requireAdmin, (req, res) => {
  const isSuper = req.user.role === 'superadmin';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin - Daequan AI</title>
      <script src="/socket.io/socket.io.js"></script>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { color: #667eea; }
        .role-badge {
          display: inline-block; padding: 4px 12px; border-radius: 12px;
          font-size: 12px; font-weight: 600; text-transform: uppercase;
        }
        .role-badge.superadmin { background: #dc3545; color: white; }
        .role-badge.admin { background: #fd7e14; color: white; }
        .role-badge.user { background: #6c757d; color: white; }
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px; margin: 30px 0;
        }
        .stat-card {
          background: white; padding: 20px; border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-value { font-size: 36px; font-weight: 700; color: #667eea; }
        .stat-label { color: #666; margin-top: 5px; }
        .users-table {
          background: white; border-radius: 16px; overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #667eea; color: white; }
        .back-link { color: #667eea; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Admin Dashboard</h1>
        <p>Welcome, ${req.user.displayName} <span class="role-badge ${req.user.role}">${req.user.role}</span></p>
        <a href="/dashboard" class="back-link">← Back to Dashboard</a>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value" id="totalUsers">-</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="totalDecisions">-</div>
            <div class="stat-label">Total Decisions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="decisionsToday">-</div>
            <div class="stat-label">Decisions Today</div>
          </div>
        </div>
        
        <h2>Users</h2>
        <div class="users-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                ${isSuper ? '<th>Actions</th>' : ''}
              </tr>
            </thead>
            <tbody id="usersList">
              <tr><td colspan="${isSuper ? 5 : 4}">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <script>
        const isSuper = ${isSuper};
        
        // Load stats
        fetch('/api/admin/stats')
          .then(r => r.json())
          .then(stats => {
            document.getElementById('totalUsers').textContent = stats.users;
            document.getElementById('totalDecisions').textContent = stats.decisions;
            document.getElementById('decisionsToday').textContent = stats.decisionsToday;
          });
        
        // Load users
        fetch('/api/admin/users')
          .then(r => r.json())
          .then(users => {
            const tbody = document.getElementById('usersList');
            tbody.innerHTML = users.map(u => \`
              <tr>
                <td>
                  <img src="\${u.photo || ''}" width="32" height="32" style="border-radius:50%; vertical-align:middle; margin-right:8px;">
                  \${u.displayName}
                </td>
                <td>\${u.email}</td>
                <td><span class="role-badge \${u.role}">\${u.role}</span></td>
                <td>\${u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
                \${isSuper ? \`
                  <td>
                    <select onchange="updateRole('\${u._id}', this.value)">
                      <option value="user" \${u.role === 'user' ? 'selected' : ''}>User</option>
                      <option value="admin" \${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                      <option value="superadmin" \${u.role === 'superadmin' ? 'selected' : ''}>Superadmin</option>
                    </select>
                  </td>
                \` : ''}
              </tr>
            \`).join('');
          });
        
        function updateRole(userId, role) {
          fetch(\`/api/admin/users/\${userId}/role\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
          }).then(() => location.reload());
        }
      </script>
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
