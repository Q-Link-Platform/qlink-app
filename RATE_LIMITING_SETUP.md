# Rate Limiting Setup Guide

## Overview
Q-Link now includes production-grade rate limiting to prevent DDoS attacks and API abuse. The system automatically falls back to in-memory rate limiting if Upstash Redis is unavailable.

## Rate Limiting Configuration

- **Limit**: 10 requests per 10 seconds per IP address
- **Algorithm**: Sliding window (prevents burst attacks)
- **Scope**: All `/api/*` routes
- **Fallback**: Automatic in-memory rate limiting if Upstash fails

## How Rate Limiting Works

### Primary: Upstash Redis (Production)
When Upstash credentials are configured, the system uses distributed Redis-based rate limiting for production environments.

### Fallback: In-Memory Rate Limiting (Development/Backup)
If Upstash credentials are missing or the connection fails, the system automatically switches to in-memory rate limiting:
- Uses a simple Map-based counter
- 10 requests per 10 seconds per IP
- Automatic cleanup of old entries
- Same 429 response behavior

## Environment Variables (Optional)

If you want to use Upstash Redis for production:

```bash
# Upstash Redis Configuration (Optional - fallback available)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

**Note**: These are optional. The system will work without them using in-memory rate limiting.

## Testing Rate Limiting

You can test the rate limiting by making rapid requests to any API endpoint:

```bash
# This should work
curl http://localhost:3002/api/posts

# Rapid requests will trigger 429 Too Many Requests
for i in {1..15}; do curl http://localhost:3002/api/posts; done
```

## Response Headers

Rate-limited responses include these headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when window resets
- `Retry-After`: Seconds until retry is allowed

## Security Benefits

- **DDoS Protection**: Prevents automated bot attacks
- **Cost Protection**: Prevents serverless function quota exhaustion
- **Database Protection**: Prevents connection pool exhaustion
- **Fair Usage**: Ensures equitable resource distribution
- **Zero Configuration**: Works immediately without setup
