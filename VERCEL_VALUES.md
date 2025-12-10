# Complete Environment Variables Setup for Vercel

## Required Environment Variables

Your application needs **exactly 3 environment variables** to work on Vercel:

---

### 1. DATABASE_URL

**What it does:** Connects your app to the PostgreSQL database

**How to get it:**

#### Option A: Vercel Postgres (Recommended - Automatic)
1. In Vercel Dashboard → **Storage** tab
2. Click **Create Database** → Select **Postgres**
3. Name it: `icms-time-db` (or any name you prefer)
4. Click **Create**
5. Click **Connect to Project** → Select your project
6. ✅ **Vercel automatically adds this variable - you don't need to add it manually!**

#### Option B: External PostgreSQL Provider
If using Supabase, Railway, Neon, or another provider:

**Key:** `DATABASE_URL`

**Value Format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

**Example:**
```
postgresql://myuser:mypass@db.example.com:5432/icms_db?sslmode=require
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 2. NEXTAUTH_URL

**What it does:** Tells NextAuth where your app is deployed

**Key:** `NEXTAUTH_URL`

**Value:** Your Vercel deployment URL

**For first deployment (placeholder):**
```
https://your-app.vercel.app
```

**After deployment (update with actual URL):**
```
https://icms-time-tool.vercel.app
```
*(Replace with your actual Vercel URL)*

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Important:** After your first deployment, you'll get the actual URL. Update this variable and redeploy.

---

### 3. NEXTAUTH_SECRET

**What it does:** Encrypts session tokens for security

**Key:** `NEXTAUTH_SECRET`

**Value:** A randomly generated secret string

**Your generated secret (ready to use):**
```
aW1HvXNvR6VnXdzgzTS8PtXOSyJFOb2pa/jt7aIK5yk=
```

**Or generate a new one:**
```bash
openssl rand -base64 32
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## Step-by-Step Setup in Vercel

### Step 1: Set Up Database (Choose One)

**Option A: Vercel Postgres (Easiest)**
1. Go to your Vercel project
2. Click **Storage** tab
3. Click **Create Database** → **Postgres**
4. Click **Connect to Project**
5. Done! `DATABASE_URL` is automatically added ✅

**Option B: External Database**
1. Create PostgreSQL database with your provider
2. Copy the connection string
3. Continue to Step 2

### Step 2: Add Environment Variables

1. In Vercel Dashboard, go to **Settings** → **Environment Variables**
2. Add each variable:

#### If using Vercel Postgres:
Only add these 2 (DATABASE_URL is already added):

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `aW1HvXNvR6VnXdzgzTS8PtXOSyJFOb2pa/jt7aIK5yk=` | Production, Preview, Development |

#### If using External PostgreSQL:
Add all 3:

| Key | Value | Environments |
|-----|-------|--------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `aW1HvXNvR6VnXdzgzTS8PtXOSyJFOb2pa/jt7aIK5yk=` | Production, Preview, Development |

3. For each variable:
   - Enter the **Key** (exact name)
   - Enter the **Value**
   - Select **All Environments** (Production, Preview, Development)
   - Click **Save**

### Step 3: Deploy

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

### Step 4: Update NEXTAUTH_URL (After First Deployment)

1. After deployment completes, copy your actual Vercel URL
2. Go to **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` and click **Edit**
4. Update the value to your actual URL (e.g., `https://icms-time-tool.vercel.app`)
5. Click **Save**
6. **Redeploy** again

---

## Visual Guide

Based on your screenshot, here's how to fill in the form:

```
┌─────────────────────────────────────────────────────────┐
│ Key                                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ NEXTAUTH_URL                                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Value                                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ https://icms-time-tool.vercel.app                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Note (Optional)                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ NextAuth URL for authentication                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ☑ Production  ☑ Preview  ☑ Development                 │
└─────────────────────────────────────────────────────────┘
```

Repeat for `NEXTAUTH_SECRET` and `DATABASE_URL` (if not using Vercel Postgres).

---

## Important Notes

### ⚠️ Do NOT Add These Variables:
- ❌ `CLIENT_KEY` - Not needed for this app
- ❌ `API_KEY` - Not needed for this app
- ❌ `NEXT_PUBLIC_*` - Not needed for this app

**Only add the 3 variables listed above!**

### ✅ Checklist Before Deploying

- [ ] Database is set up (Vercel Postgres or external)
- [ ] `DATABASE_URL` is set (automatically if using Vercel Postgres)
- [ ] `NEXTAUTH_URL` is set (use placeholder first, update after deployment)
- [ ] `NEXTAUTH_SECRET` is set
- [ ] All variables are set for **Production, Preview, and Development**
- [ ] Ready to deploy!

---

## Troubleshooting

**Error: "DATABASE_URL is not defined"**
- Solution: Make sure you've connected Vercel Postgres or added the DATABASE_URL manually

**Error: "NEXTAUTH_URL is not defined"**
- Solution: Add NEXTAUTH_URL environment variable

**Error: "Can't connect to database"**
- Solution: Check your DATABASE_URL format includes `?sslmode=require`

**App still showing error after adding variables**
- Solution: Redeploy from the Deployments tab

---

## Quick Copy-Paste Values

For easy copying:

**NEXTAUTH_SECRET:**
```
aW1HvXNvR6VnXdzgzTS8PtXOSyJFOb2pa/jt7aIK5yk=
```

**NEXTAUTH_URL (update after deployment):**
```
https://icms-time-tool.vercel.app
```

---

## After Setup

Once all variables are added:
1. Click **Save** on each variable
2. Go to **Deployments** tab
3. Click **Redeploy**
4. Your app should work! 🚀

If you still see errors, check the **Runtime Logs** in your deployment for specific error messages.
