import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;
  
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = ['/', '/login', '/comcast'].some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith('/comcast/')
  );
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  
  // Always allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated and trying to access protected route
  if (!isLoggedIn && isAdminRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  
  // Check admin permissions
  if (isAdminRoute && !['admin', 'superadmin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }
  
  // Redirect logged-in users away from login page
  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin/skills', nextUrl));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
