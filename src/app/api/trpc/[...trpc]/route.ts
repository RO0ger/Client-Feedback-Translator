import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/context'

/**
 * tRPC API Route Handler for Next.js 15 App Router
 *
 * This handles all tRPC requests through the /api/trpc/* endpoint
 * Supports both GET and POST requests for queries and mutations
 */

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ path, error }) => {
      console.error(`❌ tRPC failed on ${path}:`, error)
    },
  })
}

export { handler as GET, handler as POST }

// Force Node.js runtime for database operations
export const runtime = 'nodejs'
