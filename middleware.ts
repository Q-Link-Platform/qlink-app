import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// JWT Secret from environment
const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

// Rate limiting configuration (Upstash Redis)
let ratelimit: Ratelimit | null = null;

// Fallback in-memory rate limiting (simple map-based)
const memoryRateLimit = new Map<string, { count: number; resetTime: number }>();

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(100, '10 s'),
      analytics: true,
    });
  } catch (error) {
    console.warn('⚠️ Upstash Redis connection failed, falling back to memory rate limiting:', error);
  }
} else {
  console.warn('⚠️ Using in-memory rate limiting (Upstash credentials not set)');
}

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

    // Rate limiting for API routes (DDoS Protection)
    if (pathname.startsWith('/api/')) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 
                 request.headers.get('x-real-ip') ?? 
                 '127.0.0.1';
      
      let success = true;
      let limit = 100;
      let remaining = 100;
      let reset = Date.now() + 10000;

      if (ratelimit) {
        // Use Upstash Redis rate limiting
        const result = await ratelimit.limit(ip);
        success = result.success;
        limit = result.limit;
        remaining = result.remaining;
        reset = result.reset;
      } else {
        // Fallback to in-memory rate limiting
        const now = Date.now();
        const window = 10000; // 10 seconds
        const record = memoryRateLimit.get(ip);

        if (record && now < record.resetTime) {
          record.count++;
          remaining = Math.max(0, limit - record.count);
          if (record.count > limit) {
            success = false;
            reset = record.resetTime;
          }
        } else {
          memoryRateLimit.set(ip, { count: 1, resetTime: now + window });
          remaining = limit - 1;
        }

        // Cleanup old entries periodically
        if (Math.random() < 0.01) {
          for (const [key, value] of memoryRateLimit.entries()) {
            if (now >= value.resetTime) {
              memoryRateLimit.delete(key);
            }
          }
        }
      }

      if (!success) {
        console.log('🚫 Rate limit exceeded for IP:', ip);
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
    }

    // 🙏 Divine Protection Activation - Signature Feature
    console.log('🙏 Divine Protection Active for:', pathname);
    console.log('🕉️ Ganesh Mantra: ॐ गं गणपतये नमः');
    console.log('💪 Hanuman Mantra: ॐ हनुमते नमः');
    console.log('🏹 Ram Mantra: ॐ श्री रामचंद्राय नमः');

    // Check if this is a protected route
    if (isProtectedRoute(pathname)) {
      // Validate JWT token from session cookie (dynamically handles secure and non-secure cookies)
      const token = await getToken({
        req: request,
        secret: JWT_SECRET,
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

    // ==========================================
    // SECURITY HEADERS (XSS & Attack Protection)
    // ==========================================
    
    // Content Security Policy - Prevents XSS attacks
    // Allows necessary resources while blocking malicious scripts
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.upstash.io",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', cspDirectives);
    
    // Prevent clickjacking attacks
    response.headers.set('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection (modern browsers have this built-in, but for older browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy - Control what information is sent in Referer header
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy - Control which browser features can be used
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

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
