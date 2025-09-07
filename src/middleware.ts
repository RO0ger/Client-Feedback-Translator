import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporarily disable auth middleware for tRPC testing
export default function middleware(req: NextRequest & { nextauth?: any }) {
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/verify',
    '/auth/error',
    '/api/auth/callback',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/session',
    '/api/auth/csrf',
  ]

  // API routes that require authentication (except auth routes)
  const protectedApiRoutes = [
    '/api/trpc',
    '/api/translate',
    '/api/translations',
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Check if route is a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  // Temporarily allow all requests for tRPC testing
  // if (!req.nextauth?.token && !isPublicRoute) {
  //   const signInUrl = new URL('/auth/signin', req.url)
  //   signInUrl.searchParams.set('callbackUrl', req.url)
  //   return NextResponse.redirect(signInUrl)
  // }

  // if (!req.nextauth?.token && isProtectedApiRoute) {
  //   return NextResponse.json(
  //     { error: 'Authentication required' },
  //     { status: 401 }
  //   )
  // }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
  // Force Node.js runtime to support NextAuth database adapter
  runtime: 'nodejs',
}

// Export the auth configuration for NextAuth v4
export { authOptions as auth } from '@/server/auth'
