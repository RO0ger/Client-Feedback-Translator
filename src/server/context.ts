import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Define the user type from database schema
export type User = typeof users.$inferSelect

// Context type that includes session, database, and user
export interface Context {
  session: Session | null
  user: User | null
  userId: string | null
  db: typeof db
  req: CreateNextContextOptions['req']
  res: CreateNextContextOptions['res']
}

/**
 * Creates tRPC context for each request
 * Includes authenticated session, database connection, and user data
 */
export async function createTRPCContext(opts: CreateNextContextOptions): Promise<Context> {
  const { req, res } = opts

  // Get session from NextAuth
  const session = await getServerSession(req, res, authOptions)

  let user: User | null = null
  let userId: string | null = null

  // If user is authenticated, fetch their data from database
  if (session?.user?.email) {
    try {
      const dbUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1)

      if (dbUsers[0]) {
        user = dbUsers[0]
        userId = dbUsers[0].id
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to fetch user from database:', error)
    }
  }

  return {
    session,
    user,
    userId,
    db,
    req,
    res,
  }
}
