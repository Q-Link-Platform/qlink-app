# GitHub Integration - Quantum Link

## Overview
GitHub OAuth integration allows users to connect their GitHub accounts and access profile data, repositories, and commit history.

## Setup

### 1. Environment Variables
Add to `.env.local`:
```bash
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### 2. GitHub OAuth App Configuration
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Quantum Link
   - **Homepage URL**: Your app URL (e.g., https://your-ngrok-url.ngrok-free.app)
   - **Authorization callback URL**: `https://your-ngrok-url.ngrok-free.app/api/auth/callback/github`

### 3. Scopes Requested
- `read:user` - Read user profile data
- `user:email` - Access user email addresses
- `repo` - Access repositories (public and private)

## API Endpoints

### 1. Check GitHub Connection Status
```http
GET /api/github/status
```
**Response:**
```json
{
  "connected": true,
  "username": "github_username",
  "tokenValid": true,
  "rateLimit": {
    "limit": "5000",
    "remaining": "4999",
    "reset": "1234567890"
  },
  "scopes": "read:user user:email repo"
}
```

### 2. Get GitHub Profile
```http
GET /api/github/profile
```
**Response:**
```json
{
  "success": true,
  "profile": {
    "login": "username",
    "avatar_url": "https://avatars...",
    "html_url": "https://github.com/username",
    "name": "Full Name",
    "bio": "User bio",
    "public_repos": 42,
    "followers": 100,
    "following": 50
  }
}
```

### 3. List Repositories
```http
GET /api/github/repos?type=owner&sort=updated&per_page=30&page=1
```
**Query Parameters:**
- `type`: `owner` (default), `member`, `all`
- `sort`: `updated` (default), `created`, `pushed`, `full_name`
- `per_page`: Number of results (default: 30, max: 100)
- `page`: Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "repos": [
    {
      "id": 123,
      "name": "repo-name",
      "full_name": "username/repo-name",
      "private": false,
      "html_url": "https://github.com/username/repo-name",
      "description": "Repo description",
      "stargazers_count": 50,
      "language": "TypeScript",
      "forks_count": 10,
      "open_issues_count": 5
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 30,
    "total_count": 1
  }
}
```

### 4. Get Repository Commits
```http
GET /api/github/commits?owner=username&repo=repo-name&sha=main&per_page=30&page=1
```
**Query Parameters:**
- `owner` (required): Repository owner username
- `repo` (required): Repository name
- `sha`: Branch name or commit SHA (default: `main`)
- `per_page`: Number of results (default: 30)
- `page`: Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "commits": [
    {
      "sha": "abc123...",
      "commit": {
        "author": {
          "name": "Author Name",
          "email": "author@example.com",
          "date": "2024-01-15T10:30:00Z"
        },
        "message": "Commit message"
      },
      "html_url": "https://github.com/username/repo/commit/abc123...",
      "author": {
        "login": "username",
        "avatar_url": "https://avatars..."
      }
    }
  ],
  "repository": "username/repo-name",
  "branch": "main"
}
```

## Rate Limits

| Authentication | Limit |
|---------------|-------|
| Unauthenticated | 60 requests/hour |
| OAuth (Authenticated) | 5,000 requests/hour |

All API responses include rate limit headers.

## Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error description",
  "details": {} // Additional error details (optional)
}
```

Common HTTP status codes:
- `401 Unauthorized` - User not logged in
- `400 Bad Request` - GitHub not connected or missing parameters
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

## Security

- Access tokens are stored encrypted in the database
- Tokens are refreshed automatically when expired
- All API calls use secure HTTPS
- Rate limiting is enforced by GitHub API
