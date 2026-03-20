import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import mongoose from 'mongoose';

// Validate env vars at startup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('Missing required auth environment variables');
}

// Create MongoDB client promise for adapter
let mongoClientPromise: Promise<any>;

function getMongoClient() {
  if (!mongoClientPromise) {
    mongoClientPromise = (async () => {
      const uri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;
      if (!uri) {
        throw new Error('No MongoDB URI configured');
      }
      
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
      }
      return mongoose.connection.getClient();
    })();
  }
  return mongoClientPromise;
}

// Admin emails
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: MongoDBAdapter(getMongoClient()),
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID || '',
      clientSecret: GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role || 'user';
      }
      return session;
    },
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      
      // Assign role based on email
      let role = 'user';
      if (SUPERADMIN_EMAILS.includes(email)) {
        role = 'superadmin';
      } else if (ADMIN_EMAILS.includes(email)) {
        role = 'admin';
      }
      
      (user as any).role = role;
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects always go to valid pages
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  trustHost: true,
});

export const { GET, POST } = handlers;
