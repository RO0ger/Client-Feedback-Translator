import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'

import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/context'

/**
 * tRPC API Route Handler for Next.js 15 App Router
 *
 * This handles all tRPC requests through the /api/trpc/* endpoint
 * Supports both GET and POST requests for queries and mutations
 */

const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            )
          }
        : undefined,
  })
}

export { handler as GET, handler as POST }

// Force Node.js runtime for database operations
export const runtime = 'nodejs'
