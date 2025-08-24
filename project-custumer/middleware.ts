import { NextRequest, NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Routes that require authentication (only profile and orders)
const protectedRoutes = [
  '/profile',
  '/orders'
];

// API routes that require authentication
const protectedApiRoutes = [
  '/api/auth/profile',
  '/api/orders'
];

const PUBLIC_POST_ROUTES = ['/api/orders'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Cho phép POST /api/orders không cần token
  if (method === 'POST' && PUBLIC_POST_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  // Handle protected routes
  if (isProtectedRoute || isProtectedApiRoute) {
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Không tìm thấy token xác thực' },
          { status: 401 }
        );
      }
      // Redirect to login for protected pages
      const loginUrl = new URL('/auth', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT token
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return NextResponse.next();
    } catch (error) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Token không hợp lệ hoặc đã hết hạn' },
          { status: 401 }
        );
      }
      // Clear invalid token and redirect to login
      const loginUrl = new URL('/auth', req.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('auth-token', '', { 
        maxAge: 0,
        path: '/'
      });
      return response;
    }
  }

  // Handle auth page redirect for authenticated users
  if (pathname === '/auth') {
    const token = req.cookies.get('auth-token')?.value;
    if (token) {
      try {
        await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        return NextResponse.redirect(new URL('/', req.url));
      } catch (error) {
        // Token is invalid, clear it and continue to auth page
        const response = NextResponse.next();
        response.cookies.set('auth-token', '', { 
          maxAge: 0,
          path: '/'
        });
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 