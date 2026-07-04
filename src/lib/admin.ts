import { prisma } from './prisma';

/**
 * Centralized admin authorization check
 * Uses email-based whitelist (no DB migration required)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, handle: true }
    });

    if (!user) return false;

    // Admin whitelist - centralized in one place
    const ADMIN_EMAILS = [
      'admin@qlink.com',
      'support@qlink.com',
      'rohiterrors@gmail.com'
    ];

    const ADMIN_HANDLES = [
      'Rohit_7779'
    ];

    return ADMIN_EMAILS.includes(user.email || '') || 
           ADMIN_HANDLES.includes(user.handle || '');
  } catch (error) {
    console.error('[Admin check error]', error);
    return false;
  }
}

/**
 * Middleware-style admin check for API routes
 * Returns error response if not admin, null if authorized
 */
export async function requireAdmin(userId: string): Promise<{ error: string } | null> {
  const authorized = await isAdmin(userId);
  
  if (!authorized) {
    return { error: 'Insufficient permissions' };
  }
  
  return null;
}
