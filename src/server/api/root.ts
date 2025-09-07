import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { analysisRouter } from './routers/analysis';

// Import individual routers (will be created later)
// import { feedbackRouter } from './routers/feedback'
// import { translationRouter } from './routers/translation'
// import { userRouter } from './routers/user'

/**
 * Main application router
 *
 * This is the root router that combines all feature-specific routers.
 * Each router is organized by domain (feedback, translation, user, etc.)
 *
 * All routers added here will be automatically available on the client
 * through the AppRouter type and tRPC client.
 */
export const appRouter = createTRPCRouter({
  // Placeholder for feedback router - will be implemented later
  // feedback: feedbackRouter,
  analysis: analysisRouter,

  // Placeholder for translation router - will be implemented later
  // translation: translationRouter,

  // Placeholder for user router - will be implemented later
  // user: userRouter,

  // Health check endpoint for monitoring
  health: createTRPCRouter({
    check: publicProcedure.query(() => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'tRPC server is running'
    }))
  }),
})

// Export type definition of API for client-side usage
export type AppRouter = typeof appRouter
