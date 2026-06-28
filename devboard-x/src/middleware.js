import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect all routes under /dashboard, /projects, /analytics, /settings
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
  '/analytics(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
