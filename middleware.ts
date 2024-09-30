import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)', '/create-project(.*)', '/my-projects(.*)', '/my-account(.*)']);

export default clerkMiddleware((auth, req) => {
    if (!isPublicRoute(req) && isDashboardRoute(req)) {
        auth().protect();
    }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};