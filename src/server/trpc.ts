import { initTRPC, TRPCError } from '@trpc/server'
import { type Context } from './context'
import superjson from 'superjson'
import { ZodError } from 'zod'

// Initialize tRPC with context type
const t = initTRPC.context<Context>().create({
  // Use superjson for efficient serialization
  transformer: superjson,

  // Enhanced error formatting with Zod validation errors
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// Export reusable router and procedure helpers
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Check if user is authenticated
  if (!ctx.session?.user?.email) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    })
  }

  // Check if user exists in database
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found in database'
    })
  }

  return next({
    ctx: {
      ...ctx,
      // Ensure session and user are available in protected procedures
      session: ctx.session,
      user: ctx.user,
      userId: ctx.user.id,
    },
  })
})

// Admin procedure (if needed in the future)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // For now, all authenticated users have access
  // This can be extended to check for admin roles
  return next({
    ctx: {
      ...ctx,
      // Admin-specific context can be added here
    },
  })
})

// Export tRPC instance for client setup
export { t }
