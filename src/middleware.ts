import { auth } from '@/auth';

export default auth;

export const config = {
  // The matcher is not strictly necessary with the `authorized` callback,
  // but it can optimize performance by preventing the middleware from running on static assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
