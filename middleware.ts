import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)', '/create-project(.*)', '/my-projects(.*)', '/my-account(.*)']);

export default clerkMiddleware((auth, req) => {
    if (!isPublicRoute(req)) {
        const { userId } = auth();
        if (!userId && isDashboardRoute(req)) {
            // Redirect to sign-in if trying to access dashboard routes while not authenticated
            return new Response(null, {
                status: 302,
                headers: { Location: '/sign-in' },
            });
        }
        auth().protect();
    }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};