import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Explicitly protect routes that require auth.
// Everything else (landing, discover, specialist profiles at /:slug) is public
// so that unauthenticated visitors can browse and convert.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/feed',
  '/messages(.*)',
  '/api/chat(.*)',
  '/api/posts(.*)',
  '/api/specialists(.*)',
  '/api/subscribe(.*)',
  '/api/upload(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
