import { NextAuthOptions } from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import EmailProvider from 'next-auth/providers/email'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  callbacks: {
    session: async ({ session, user }) => {
      // Add user id to session
      if (session.user && user) {
        session.user.id = user.id
      }

      // Get additional user data from database
      if (session.user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1)

        if (dbUser[0]) {
          session.user.name = dbUser[0].name
        }
      }

      return session
    },
    jwt: async ({ token, user }) => {
      // Add user id to JWT
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  events: {
    createUser: async ({ user }) => {
      console.log('User created:', user.email)
    },
    signIn: async ({ user }) => {
      console.log('User signed in:', user.email)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
