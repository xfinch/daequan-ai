import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URL environment variable');
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

async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
    };

    cached!.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
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

// Skill Usage Schema
const SkillUsageSchema = new mongoose.Schema({
  skillId: { type: String, required: true, index: true },
  skillName: { type: String, required: true },
  action: { type: String, required: true },
  detail: String,
  status: { type: String, enum: ['success', 'warning', 'error'], default: 'success' },
  metadata: mongoose.Schema.Types.Mixed,
  userId: String,
  createdAt: { type: Date, default: Date.now, index: true }
});

// Create indexes for efficient queries
SkillUsageSchema.index({ skillId: 1, createdAt: -1 });
SkillUsageSchema.index({ createdAt: -1 });

export const SkillUsage = mongoose.models.SkillUsage || mongoose.model('SkillUsage', SkillUsageSchema);

// Change Stream Setup
let changeStream: ReturnType<typeof SkillUsage.watch> | null = null;
const listeners = new Set<(change: any) => void>();

export function watchSkillUsage(callback: (change: any) => void) {
  listeners.add(callback);
  
  if (!changeStream) {
    connectDB().then(() => {
      changeStream = SkillUsage.watch([], { fullDocument: 'updateLookup' });
      changeStream!.on('change', (change) => {
        listeners.forEach(listener => listener(change));
      });
    });
  }
  
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && changeStream) {
      changeStream.close();
      changeStream = null;
    }
  };
}

export default connectDB;
