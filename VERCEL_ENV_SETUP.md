# Quick Start: Vercel Environment Variables

When deploying to Vercel, you need to set these environment variables in your Vercel Dashboard:

## Required Environment Variables

### 1. DATABASE_URL
**What it is**: PostgreSQL database connection string

**How to get it**:
- **Option A (Recommended)**: Use Vercel Postgres
  1. Go to Vercel Dashboard → Storage → Create Database → Postgres
  2. Connect it to your project
  3. Vercel automatically sets this variable
  
- **Option B**: Use external PostgreSQL (Supabase, Railway, Neon, etc.)
  1. Create a PostgreSQL database with your provider
  2. Copy the connection string
  3. Add it manually in Vercel Dashboard → Settings → Environment Variables

**Example value**:
```
postgresql://user:password@host:5432/database?sslmode=require
```

### 2. NEXTAUTH_URL
**What it is**: The URL of your deployed application

**Value**: Your Vercel deployment URL

**Example**:
```
https://your-app.vercel.app
```

**Note**: After first deployment, update this with your actual Vercel URL

### 3. NEXTAUTH_SECRET
**What it is**: Secret key for encrypting session tokens

**How to generate**:
```bash
openssl rand -base64 32
```

**Example value**:
```
your-generated-secret-here-keep-it-secure
```

## How to Add Environment Variables in Vercel

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - Enter the **Name** (e.g., `NEXTAUTH_SECRET`)
   - Enter the **Value**
   - Select which environments to apply to (Production, Preview, Development)
   - Click **Save**
4. Redeploy your project for changes to take effect

## After Setting Variables

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## For Local Development

Create a `.env` file in your project root (already gitignored):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-can-be-anything"
```

This allows you to continue using SQLite locally while using PostgreSQL in production.
