# Troubleshooting Vercel Deployment Error

## Error You're Seeing

```
Application error: a server-side exception has occurred while loading icms-time-tool.vercel.app
Digest: 3744108241
```

## Common Causes & Solutions

### 1. Missing Environment Variables ⚠️

**Most Likely Cause**: The environment variables are not set in Vercel.

**Solution**:
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these 3 required variables:

| Variable Name | Value |
|--------------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_URL` | `https://icms-time-tool.vercel.app` |
| `NEXTAUTH_SECRET` | `aW1HvXNvR6VnXdzgzTS8PtXOSyJFOb2pa/jt7aIK5yk=` |

4. **Important**: Select all environments (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application

---

### 2. Database Not Set Up

**Cause**: `DATABASE_URL` is missing or the database doesn't exist.

**Solution A - Use Vercel Postgres (Easiest)**:
1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → Select **Postgres**
3. Name it (e.g., `icms-time-db`)
4. Click **Create**
5. Click **Connect to Project** → Select your project
6. Vercel will automatically add `DATABASE_URL`
7. Go to **Deployments** and click **Redeploy**

**Solution B - Use External PostgreSQL**:
1. Create a PostgreSQL database (Supabase, Railway, Neon, etc.)
2. Get the connection string
3. Add it as `DATABASE_URL` in environment variables
4. Make sure it includes `?sslmode=require` at the end
5. Redeploy

---

### 3. Database Schema Not Initialized

**Cause**: Database exists but tables haven't been created.

**Solution**:
After setting up the database, you need to run migrations:

**Option A - Using Vercel CLI**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

**Option B - Using Database Provider's Console**:
1. Connect to your PostgreSQL database
2. Run the Prisma migration SQL manually
3. Or use a database GUI tool like pgAdmin or TablePlus

---

### 4. Check Vercel Logs

To see the exact error:

1. Go to your Vercel project dashboard
2. Click **Deployments**
3. Click on the latest deployment
4. Click **View Function Logs** or **Runtime Logs**
5. Look for error messages that will tell you exactly what's wrong

Common errors you might see:
- `DATABASE_URL is not defined` → Add environment variable
- `Can't reach database server` → Check database connection string
- `Table does not exist` → Run migrations
- `Invalid connection string` → Check DATABASE_URL format

---

## Quick Fix Checklist

- [ ] **Step 1**: Set up Vercel Postgres database (Storage → Create Database → Postgres)
- [ ] **Step 2**: Connect database to your project
- [ ] **Step 3**: Add `NEXTAUTH_URL` = `https://icms-time-tool.vercel.app`
- [ ] **Step 4**: Add `NEXTAUTH_SECRET` = `aW1HvXNvR6VnXdzgzTS8PtXOSyJFOb2pa/jt7aIK5yk=`
- [ ] **Step 5**: Redeploy from Deployments tab
- [ ] **Step 6**: Check logs if error persists

---

## Expected DATABASE_URL Format

If using external PostgreSQL, your `DATABASE_URL` should look like:

```
postgresql://username:password@host:port/database?sslmode=require
```

Example:
```
postgresql://myuser:mypass123@db.example.com:5432/icms_db?sslmode=require
```

---

## After Fixing

Once you've added the environment variables and set up the database:

1. Go to **Deployments** tab in Vercel
2. Find the latest deployment
3. Click the **⋯** menu
4. Click **Redeploy**
5. Wait for deployment to complete
6. Your app should now work!

---

## Still Having Issues?

If the error persists after following these steps:

1. Check the **Runtime Logs** in Vercel for specific error messages
2. Verify all 3 environment variables are set correctly
3. Ensure the database is accessible from Vercel's servers
4. Try running `npx prisma migrate deploy` using Vercel CLI

Share the error from the logs if you need more help!
