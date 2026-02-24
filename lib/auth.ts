import 'server-only';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import mongoose from 'mongoose';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// Connect to MongoDB for adapter
async function getMongoClient() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;
  if (!uri) throw new Error('No MongoDB URI configured');
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
  return mongoose.connection.getClient();
}

// Admin emails
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: MongoDBAdapter(getMongoClient() as any),
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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
    async signIn({ user, account, profile }) {
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
  },
  pages: {
    signIn: '/login',
  },
});

export { handlers, auth, signIn, signOut };
export const { GET, POST } = handlers;
