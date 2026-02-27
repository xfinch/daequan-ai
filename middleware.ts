import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware without NextAuth to avoid Edge Runtime issues
// Auth checks are done at the page level instead
export default function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = ['/', '/login', '/comcast'].some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith('/comcast/')
  );
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  
  // Always allow API auth routes and public routes
  if (isApiAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }
  
  // For admin routes, let the page handle auth (middleware can't access MongoDB session)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)'],
};
