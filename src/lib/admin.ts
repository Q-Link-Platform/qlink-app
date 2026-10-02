import { prisma } from './prisma';

export const ADMIN_EMAILS = [
  'admin@qlink.com',
  'support@qlink.com',
  'rohiterrors@gmail.com'
].map(e => e.toLowerCase());

export const RESERVED_SYSTEM_HANDLES = [
  'rohit_7779',
  'admin',
  'administrator',
  'system',
  'support',
  'qlink',
  'security',
  'root',
  'moderator',
  'official'
].map(h => h.toLowerCase());

/**
 * Centralized, hardened admin authorization check.
 * Identifies users by User ID or Email.
 * Requires verified administrator email to prevent handle-spoofing elevation.
 */
export async function isAdmin(identifier: string): Promise<boolean> {
  if (!identifier) return false;

  try {
    const isEmail = identifier.includes('@');
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: { equals: identifier, mode: 'insensitive' } } : { id: identifier },
      select: { email: true, handle: true }
    });

    if (!user || !user.email) return false;

    const userEmail = user.email.toLowerCase();
    return ADMIN_EMAILS.includes(userEmail);
  } catch (error) {
    console.error('[Admin check error]', error);
    return false;
  }
}

/**
 * Middleware-style admin check for API routes
 * Returns error response if not admin, null if authorized
 */
export async function requireAdmin(identifier: string): Promise<{ error: string } | null> {
  const authorized = await isAdmin(identifier);
  
  if (!authorized) {
    return { error: 'Insufficient permissions' };
  }
  
  return null;
}

