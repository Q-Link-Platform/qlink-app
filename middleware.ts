import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// JWT Secret from environment
const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

// Protected routes that require authentication (Millionaire Level Security)
const PROTECTED_ROUTES = [
  // Frontend pages
  '/dashboard',
  '/chat',
  
  // User data & profile
  '/api/user',
  '/api/profile-photo',
  '/api/upload/verification-document',
  
  // Chat & messaging
  '/api/chat',
  '/api/presence',
  
  // Social features
  '/api/friends',
  '/api/follow',
  '/api/followers',
  
  // Posts & content
  '/api/posts',
  '/api/posts/upload',
  '/api/posts/comments',
  '/api/posts/reactions',
  '/api/posts/views',
  '/api/posts/cleanup',
  
  // Attachments & files
  '/api/attachments',
  
  // Referral & points
  '/api/referral',
  '/api/points',
  
  // Blue tick & admin
  '/api/blue-tick',
  '/api/admin',
  
  // Analytics (user tracking)
  '/api/analytics',
];

// Check if pathname matches protected routes
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // 🙏 Divine Protection Activation - Signature Feature
    console.log('🙏 Divine Protection Active for:', pathname);
    console.log('🕉️ Ganesh Mantra: ॐ गं गणपतये नमः');
    console.log('💪 Hanuman Mantra: ॐ हनुमते नमः');
    console.log('🏹 Ram Mantra: ॐ श्री रामचंद्राय नमः');

    // Check if this is a protected route
    if (isProtectedRoute(pathname)) {
      // Validate JWT token from session cookie
      const token = await getToken({
        req: request,
        secret: JWT_SECRET,
        cookieName: '__Secure-next-auth.session-token',
      });

      // No token = unauthorized
      if (!token) {
        console.log('🛡️ Divine Protection: Unauthorized access blocked for', pathname);

        // API routes return 401 JSON
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized - Divine Protection Active' },
            { status: 401 }
          );
        }

        // Page routes redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log('✅ Divine Protection: User authenticated via JWT');
    }

    // Add divine protection headers
    const response = NextResponse.next();
    response.headers.set('X-Divine-Protection', 'active');
    response.headers.set('X-Divine-Mantra', 'ॐ गं गणपतये नमः');
    response.headers.set('X-Auth-Protected', isProtectedRoute(pathname) ? 'true' : 'false');

    return response;

  } catch (error) {
    console.error('🙏 Divine Error Protection:', error);
    console.log('🕉️ Ganesh removes obstacles from this error');

    // On error, allow request through (fail open for stability)
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Frontend pages
    '/dashboard/:path*',
    '/chat/:path*',
    
    // User & profile APIs
    '/api/user/:path*',
    '/api/profile-photo',
    '/api/upload/:path*',
    
    // Chat & presence APIs
    '/api/chat/:path*',
    '/api/presence/:path*',
    
    // Social APIs
    '/api/friends/:path*',
    '/api/follow',
    '/api/followers',
    
    // Posts APIs
    '/api/posts/:path*',
    
    // File APIs
    '/api/attachments/:path*',
    
    // System APIs
    '/api/referral/:path*',
    '/api/points/:path*',
    '/api/blue-tick/:path*',
    '/api/admin/:path*',
    '/api/analytics/:path*',
    
    // Run on all other routes for divine protection headers
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
