# Environment Variables for Vercel Deployment

Based on your screenshot, here are the **3 environment variables** you need to add in Vercel:

---

## 1. DATABASE_URL

**Key:** `DATABASE_URL`

**Value:** You have two options:

### Option A: Vercel Postgres (Recommended)
1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → Select **Postgres**
3. After creating, click **Connect to Project**
4. Vercel will automatically add the `DATABASE_URL` variable
5. **You don't need to add this manually if using Vercel Postgres**

### Option B: External PostgreSQL Provider
If you're using Supabase, Railway, Neon, or another provider:

**Value format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

**Example:**
```
postgresql://myuser:mypassword@db.example.com:5432/mydb?sslmode=require
```

---

## 2. NEXTAUTH_URL

**Key:** `NEXTAUTH_URL`

**Value:** Your Vercel deployment URL

**Important:** 
- For first deployment, use a placeholder: `https://your-app.vercel.app`
- After deployment, Vercel will give you the actual URL (e.g., `https://weekly-task-app-abc123.vercel.app`)
- Update this variable with your actual URL and redeploy

**Example:**
```
https://weekly-task-app.vercel.app
```

---

## 3. NEXTAUTH_SECRET

**Key:** `NEXTAUTH_SECRET`

**Value:** A randomly generated secret (see below)

**Generate the secret:**
Run this command in your terminal:
```bash
openssl rand -base64 32
```

**Example output (use your own generated value):**
```
Kx7vN2mP9qR4sT6uV8wX0yZ1aB3cD5eF7gH9iJ0kL2mN4oP6qR8sT0uV2wX4yZ6
```

**Copy the output and paste it as the value for `NEXTAUTH_SECRET`**

---

## Quick Setup Checklist

In your Vercel Dashboard → Project Settings → Environment Variables:

- [ ] **DATABASE_URL** - Either auto-added by Vercel Postgres OR your PostgreSQL connection string
- [ ] **NEXTAUTH_URL** - Your Vercel app URL (update after first deployment)
- [ ] **NEXTAUTH_SECRET** - Generated secret from `openssl rand -base64 32`

For all three variables, select:
- ✅ Production
- ✅ Preview  
- ✅ Development

Then click **Save** and **Redeploy** your project.

---

## After Setting Variables

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

Your app should now deploy successfully! 🚀
