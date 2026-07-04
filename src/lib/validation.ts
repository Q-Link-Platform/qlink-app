import { z } from 'zod';

// ==========================================
// CHAT VALIDATION SCHEMAS
// ==========================================

export const sendMessageSchema = z.object({
  toHandle: z.string()
    .min(1, 'Recipient handle is required')
    .max(50, 'Handle too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  content: z.string()
    .min(1, 'Message content is required')
    .max(10000, 'Message too long (max 10,000 characters)'),
  encrypted: z.boolean().optional(),
  iv: z.string().optional(),
});

export const deleteMessageSchema = z.object({
  messageId: z.string()
    .min(1, 'Message ID is required')
    .uuid('Invalid message ID format'),
});

// ==========================================
// POSTS VALIDATION SCHEMAS
// ==========================================

export const createPostSchema = z.object({
  text: z.string()
    .max(5000, 'Post text too long (max 5,000 characters)')
    .optional(),
  audience: z.enum(['GLOBAL', 'FOLLOWERS', 'FRIENDS', 'ALL'], {
    message: 'Invalid audience type'
  }).optional(),
  attachmentId: z.string().uuid('Invalid attachment ID format').optional(),
  attachmentKind: z.enum(['image', 'video'], {
    message: 'Invalid attachment kind'
  }).optional(),
}).refine(data => data.text || data.attachmentId, {
  message: 'Post must include text or media attachment'
});

export const reactionSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
  emoji: z.string()
    .min(1, 'Emoji is required')
    .max(10, 'Emoji too long'),
});

export const commentSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
  content: z.string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment too long (max 1,000 characters)'),
});

// ==========================================
// FRIEND REQUEST VALIDATION SCHEMAS
// ==========================================

export const friendRequestSchema = z.object({
  toHandle: z.string()
    .min(1, 'Recipient handle is required')
    .max(50, 'Handle too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
});

export const decideFriendRequestSchema = z.object({
  requestId: z.string()
    .min(1, 'Request ID is required')
    .uuid('Invalid request ID format'),
  action: z.enum(['ACCEPT', 'REJECT'], {
    message: 'Action must be ACCEPT or REJECT'
  }),
});

// ==========================================
// USER PROFILE VALIDATION SCHEMAS
// ==========================================

export const updateProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long (max 100 characters)')
    .optional(),
  bio: z.string()
    .max(500, 'Bio too long (max 500 characters)')
    .optional(),
  handle: z.string()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, 'Handle too long (max 30 characters)')
    .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores')
    .optional(),
});

// ==========================================
// BLUE TICK VALIDATION SCHEMAS
// ==========================================

export const verifyBlueTickSchema = z.object({
  targetUserId: z.string()
    .min(1, 'Target user ID is required')
    .uuid('Invalid user ID format'),
  action: z.enum(['approve', 'reject'], {
    message: 'Action must be approve or reject'
  }),
  reason: z.string()
    .max(500, 'Reason too long (max 500 characters)')
    .optional(),
});

// ==========================================
// HELPER FUNCTION
// ==========================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    throw new Error(JSON.stringify({
      error: 'Validation failed',
      details: errors
    }));
  }
  
  return result.data;
}
