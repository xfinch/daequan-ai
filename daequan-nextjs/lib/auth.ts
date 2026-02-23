import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { connectDB } from './db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// Admin emails
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: MongoDBAdapter(connectDB().then(() => mongoose.connection.getClient()) as any),
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

// Need to import mongoose here for the adapter
import mongoose from 'mongoose';
