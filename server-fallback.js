// Memory-only fallback mode - works without MongoDB
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// In-memory storage (resets on restart)
const memoryDB = {
  users: new Map(),
  decisions: new Map(),
  decisionList: []
};

let mongoAvailable = false;

// Try MongoDB but don't fail if missing
let mongoose, MongoStore, Decision, User;
try {
  mongoose = require('mongoose');
  MongoStore = require('connect-mongo');
  
  const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;
  
  if (MONGO_URI) {
    mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
      .then(() => {
        console.log('✅ MongoDB connected');
        mongoAvailable = true;
      })
      .catch(err => {
        console.log('⚠️  MongoDB unavailable, using memory store');
      });
    
    // Schemas
    const DecisionSchema = new mongoose.Schema({
      type: { type: String, required: true },
      title: { type: String, required: true },
      description: String,
      priority: { type: String, default: 'medium' },
      status: { type: String, default: 'pending' },
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
      role: { type: String, default: 'user' },
      createdAt: { type: Date, default: Date.now },
      lastLogin: { type: Date, default: Date.now }
    });
    
    Decision = mongoose.model('Decision', DecisionSchema);
    User = mongoose.model('User', UserSchema);
  }
} catch (e) {
  console.log('⚠️  MongoDB module not available');
}

// Admin config
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'xfassistant@gmail.com').split(',').map(e => e.trim().toLowerCase());
const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS || 'xfassistant@gmail.com').split(',').map(e => e.trim().toLowerCase());

// Session - memory store fallback
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'daequan-ai-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
};

if (mongoAvailable && MongoStore) {
  sessionConfig.store = MongoStore.create({ mongoUrl: process.env.MONGO_URL });
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0]?.value?.toLowerCase();
  let role = 'user';
  if (SUPERADMIN_EMAILS.includes(email)) role = 'superadmin';
  else if (ADMIN_EMAILS.includes(email)) role = 'admin';
  
  const userData = {
    googleId: profile.id,
    displayName: profile.displayName,
    email: email,
    photo: profile.photos[0]?.value,
    role: role
  };
  
  if (mongoAvailable && User) {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User(userData);
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }
    done(null, user);
  } else {
    // Memory fallback
    let user = memoryDB.users.get(profile.id);
    if (!user) {
      user = { ...userData, _id: profile.id, createdAt: new Date(), lastLogin: new Date() };
      memoryDB.users.set(profile.id, user);
    } else {
      user.lastLogin = new Date();
    }
    done(null, user);
  }
}));

passport.serializeUser((user, done) => done(null, user.googleId || user._id));
passport.deserializeUser(async (id, done) => {
  if (mongoAvailable && User) {
    const user = await User.findById(id);
    done(null, user);
  } else {
    done(null, memoryDB.users.get(id));
  }
});

// Middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  res.status(403).send('Admin access required');
}

function ensureSuperAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'superadmin') {
    return next();
  }
  res.status(403).send('Superadmin access required');
}

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Daequan AI</title><style>
      body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
      .btn { display: inline-block; padding: 12px 24px; background: #4285f4; color: white; text-decoration: none; border-radius: 4px; }
      .status { padding: 10px; background: #f0f0f0; border-radius: 4px; margin: 20px 0; }
    </style></head>
    <body>
      <h1>🤖 Daequan AI</h1>
      <div class="status">
        <strong>Status:</strong> ${mongoAvailable ? '✅ MongoDB Connected' : '⚠️ Running in Memory Mode (MongoDB offline)'}
      </div>
      ${req.isAuthenticated() ? `
        <p>Welcome, ${req.user.displayName}!</p>
        <p>Role: <strong>${req.user.role.toUpperCase()}</strong></p>
        ${req.user.role === 'superadmin' ? '<p><a href="/admin">Admin Panel</a></p>' : ''}
        <p><a href="/dashboard">Dashboard</a> | <a href="/auth/logout">Logout</a></p>
      ` : `
        <p>Please sign in to access your dashboard.</p>
        <a href="/auth/google" class="btn">Sign in with Google</a>
      `}
    </body>
    </html>
  `);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => res.redirect('/dashboard'));
app.get('/auth/logout', (req, res) => { req.logout(() => res.redirect('/')); });

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Dashboard | Daequan AI</title><style>
      body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
      .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
      .superadmin { background: #d4edda; color: #155724; }
      .admin { background: #fff3cd; color: #856404; }
      .user { background: #f8d7da; color: #721c24; }
    </style></head>
    <body>
      <h1>📊 Dashboard</h1>
      <p>Welcome, ${req.user.displayName}!</p>
      <p>Role: <span class="badge ${req.user.role}">${req.user.role.toUpperCase()}</span></p>
      ${req.user.role === 'superadmin' ? '<p><a href="/admin">Admin Panel</a></p>' : ''}
      <p><a href="/">Home</a> | <a href="/auth/logout">Logout</a></p>
    </body>
    </html>
  `);
});

app.get('/admin', ensureSuperAdmin, (req, res) => {
  const users = Array.from(memoryDB.users.values()).map(u => `
    <tr>
      <td>${u.displayName}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${new Date(u.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Admin | Daequan AI</title><style>
      body { font-family: system-ui; max-width: 1000px; margin: 50px auto; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f5f5f5; }
    </style></head>
    <body>
      <h1>🔐 Admin Panel</h1>
      <p><strong>Superadmin:</strong> ${req.user.email}</p>
      <p><a href="/dashboard">Dashboard</a> | <a href="/">Home</a> | <a href="/auth/logout">Logout</a></p>
      <h2>Users (${memoryDB.users.size})</h2>
      <table>
        <tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr>
        ${users || '<tr><td colspan="4">No users yet</td></tr>'}
      </table>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  mongo: mongoAvailable,
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
}));

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(mongoAvailable ? '✅ MongoDB mode' : '⚠️  Memory mode (data will reset on restart)');
});
