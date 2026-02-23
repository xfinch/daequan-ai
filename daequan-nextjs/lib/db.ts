import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  image: String,
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Decision Schema
const DecisionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  metadata: mongoose.Schema.Types.Mixed,
  userId: String,
}, { timestamps: true });

export const Decision = mongoose.models.Decision || mongoose.model('Decision', DecisionSchema);

// Visit Schema (Comcast CRM)
const VisitSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  contactName: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  lat: Number,
  lng: Number,
  status: { type: String, default: 'interested' },
  notes: String,
  ghlContactId: String,
  missingFields: [String],
  needsUpdate: { type: Boolean, default: false },
}, { timestamps: true });

export const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

// Skill Usage Schema
const SkillUsageSchema = new mongoose.Schema({
  skillId: { type: String, required: true },
  skillName: { type: String, required: true },
  action: { type: String, required: true },
  detail: String,
  status: { type: String, enum: ['success', 'warning', 'error'], default: 'success' },
  metadata: mongoose.Schema.Types.Mixed,
  userId: String,
}, { timestamps: true });

export const SkillUsage = mongoose.models.SkillUsage || mongoose.model('SkillUsage', SkillUsageSchema);

// Account Schema (for NextAuth)
const AccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  provider: String,
  providerAccountId: String,
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
});

export const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);

// Session Schema (for NextAuth)
const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionToken: { type: String, unique: true },
  expires: Date,
});

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
