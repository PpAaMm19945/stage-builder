# SchoolOS Cloudflare Backend - Zero-CLI Setup Guide

## Overview
This guide shows you how to deploy the SchoolOS backend using only web dashboards - no command line needed!

---

## Step 1: Connect Lovable to GitHub

1. In Lovable editor, click **GitHub** → **Connect to GitHub**
2. Authorize the Lovable GitHub App
3. Click **Create Repository** to push your code to GitHub

---

## Step 2: Create D1 Database in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **D1** in the left sidebar (under Workers & Pages)
3. Click **Create database**
4. Name it: `schoolos-db`
5. Click **Create**
6. **Copy the Database ID** (you'll need this!)

---

## Step 3: Update wrangler.toml with Database ID

1. In your GitHub repo (or Lovable), open `cloudflare/wrangler.toml`
2. Replace `PASTE_YOUR_DATABASE_ID_HERE` with your actual Database ID
3. Commit and push

---

## Step 4: Run Database Migrations

1. In Cloudflare Dashboard → **D1** → click on `schoolos-db`
2. Go to the **Console** tab
3. Copy the contents of `cloudflare/migrations/0001_initial_schema.sql`
4. Paste into the console and click **Execute**
5. Repeat for `cloudflare/migrations/0002_seed_activities.sql`

---

## Step 5: Deploy Worker from GitHub

1. In Cloudflare Dashboard → **Workers & Pages**
2. Click **Create** → **Worker** → **Create via Git**
3. Connect your GitHub account if not already
4. Select your repository
5. Configure build settings:
   - **Root directory**: `cloudflare`
   - **Build command**: `npm install && npm run build` (or leave empty)
   - **Deploy**: Click deploy

---

## Step 6: Set Up Google OAuth

### In Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **OAuth consent screen**
4. Configure consent screen (External, add your email as test user)
5. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Add Authorized JavaScript origins:
   - `https://your-worker.workers.dev`
   - `https://your-app.lovable.app`
8. Add Authorized redirect URIs:
   - `https://your-worker.workers.dev/auth/google/callback`
9. Copy **Client ID** and **Client Secret**

### In Cloudflare Dashboard:

1. Go to **Workers & Pages** → click your worker
2. Go to **Settings** → **Variables**
3. Under **Secrets**, click **Add** for each:

| Secret Name | Value |
|-------------|-------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `JWT_SECRET` | Generate a random string (32+ characters) |

4. Under **Variables**, add:

| Variable Name | Value |
|---------------|-------|
| `GOOGLE_REDIRECT_URI` | `https://your-worker.workers.dev/auth/google/callback` |
| `FRONTEND_URL` | `https://your-app.lovable.app` |

---

## Step 7: Update Frontend API URL

1. In Lovable, you'll need to set the API URL to point to your worker
2. Create a `.env` file or set in Lovable project settings:
   ```
   VITE_API_URL=https://your-worker.workers.dev
   ```

---

## Step 8: Test the Setup

1. Visit `https://your-worker.workers.dev/health` - should return `{"status":"ok"}`
2. Visit `https://your-worker.workers.dev/api/activities` - should return activity list
3. Test login by visiting `https://your-worker.workers.dev/auth/google`

---

## Automatic Deployments

After initial setup, GitHub Actions will automatically:
- Run D1 migrations when you push changes to `cloudflare/migrations/`
- Deploy the worker when you push changes to `cloudflare/`

### Required GitHub Secret:
1. In Cloudflare Dashboard → **My Profile** → **API Tokens**
2. Create token with **Edit Cloudflare Workers** permission
3. In GitHub repo → **Settings** → **Secrets** → **Actions**
4. Add secret: `CLOUDFLARE_API_TOKEN` with your token

---

## Troubleshooting

### "CORS error" in browser
- Check that `FRONTEND_URL` variable is set correctly in Cloudflare

### "OAuth redirect mismatch"
- Ensure `GOOGLE_REDIRECT_URI` exactly matches what's in Google Cloud Console

### "Database not found"
- Verify the `database_id` in `wrangler.toml` matches your D1 database

### Login doesn't work
- Make sure you've added yourself as a test user in Google OAuth consent screen
- Check that all 3 secrets are set in Cloudflare

---

## Architecture

```
┌─────────────────┐         ┌─────────────────────────────┐
│   Lovable App   │────────▶│   Cloudflare Worker (API)   │
│   (Frontend)    │◀────────│   schoolos-api              │
└─────────────────┘         └──────────────┬──────────────┘
                                           │
                                           ▼
                            ┌─────────────────────────────┐
                            │      Cloudflare D1          │
                            │    (SQLite Database)        │
                            └─────────────────────────────┘
```
