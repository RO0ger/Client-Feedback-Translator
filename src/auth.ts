import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db, users, accounts, sessions, verificationTokens } from '@/lib/db';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';

let handlers: any, auth: any, signIn: any, signOut: any;

if (process.env.NODE_ENV === 'test') {
  const { mockAuth, mockSignIn, mockSignOut, mockHandlers } = await import('./test/mocks/auth');
  handlers = mockHandlers;
  auth = mockAuth;
  signIn = mockSignIn;
  signOut = mockSignOut;
} else {
  const nextAuth = NextAuth({
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    session: { strategy: 'jwt' },
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      Github({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }),
    ],
    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
        if (isOnDashboard) {
          if (isLoggedIn) return true;
          return false; // Redirect unauthenticated users to login page
        }
        return true; // Allow all other routes
      },
      jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      session({ session, token }) {
        if (session.user && token.id) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  });

  handlers = nextAuth.handlers;
  auth = nextAuth.auth;
  signIn = nextAuth.signIn;
  signOut = nextAuth.signOut;
}

export { handlers, auth, signIn, signOut };