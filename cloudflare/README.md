# SchoolOS Cloudflare Backend

This folder contains the Cloudflare Worker API and D1 database schema for SchoolOS.

## Setup

### 1. Install Dependencies

```bash
cd cloudflare
npm install
```

### 2. Create D1 Database

```bash
npm run db:create
```

This will output a `database_id`. Update `wrangler.toml` with this ID.

### 3. Run Migrations

For local development:
```bash
npm run db:migrate:local
```

For production:
```bash
npm run db:migrate:remote
```

### 4. Configure Secrets

Set these secrets via Wrangler CLI or Cloudflare Dashboard:

```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put JWT_SECRET
```

Also set environment variables in `wrangler.toml`:
- `GOOGLE_REDIRECT_URI`: Your Worker URL + `/auth/google/callback`
- `FRONTEND_URL`: Your React app URL (e.g., `https://your-app.lovable.app`)

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-worker.workers.dev/auth/google/callback`
6. Copy Client ID and Client Secret

### 6. Development

```bash
npm run dev
```

### 7. Deploy

```bash
npm run deploy
```

## API Endpoints

### Auth
- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - OAuth callback (internal)
- `GET /api/auth/me` - Get current user and children
- `POST /api/auth/logout` - Logout

### Students (Children)
- `GET /api/students` - List all children
- `POST /api/students` - Add a child (max 5)
- `PUT /api/students/:id` - Update a child

### Activities
- `GET /api/activities` - List activities (supports `?domain=` and `?ageMonths=`)
- `GET /api/activities/:id` - Get single activity
- `GET /api/students/:studentId/today` - Get today's recommendations

### Observations
- `POST /api/observations` - Record an observation
- `GET /api/students/:studentId/observations` - Get student's observations
- `GET /api/students/:studentId/progress` - Get progress summary

## Frontend Integration

Update your React app's API client to point to your Worker URL:

```typescript
const API_URL = 'https://your-worker.workers.dev';
```

The frontend should:
1. Redirect to `/auth/google` for login
2. Handle callback at `/auth/callback?token=xxx`
3. Store JWT in localStorage
4. Include `Authorization: Bearer <token>` header in API requests
