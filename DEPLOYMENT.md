# Deployment Guide for Vercel

This guide will help you deploy your Weekly Task App to Vercel with proper database configuration.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Basic understanding of environment variables

## Step 1: Set Up Vercel Postgres

### Option A: Using Vercel Postgres (Recommended)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name for your database (e.g., `weekly-task-db`)
6. Select a region close to your users
7. Click **Create**

### Option B: Using External PostgreSQL Provider

If you prefer to use another PostgreSQL provider (e.g., Supabase, Railway, Neon), you'll need to:

1. Create a PostgreSQL database with your chosen provider
2. Get the connection string (it should look like: `postgresql://user:password@host:5432/database?sslmode=require`)
3. You'll add this as an environment variable in the next step

## Step 2: Import Your Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your Git repository
4. Vercel will automatically detect it's a Next.js project

## Step 3: Configure Environment Variables

Before deploying, you need to set up environment variables:

1. In the project configuration screen, scroll to **Environment Variables**
2. Add the following variables:

### Required Environment Variables

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DATABASE_URL` | *See below* | Your PostgreSQL connection string |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `NEXTAUTH_SECRET` | *Generate a secret* | Random secret for session encryption |

#### DATABASE_URL

- **If using Vercel Postgres**: This will be automatically set when you connect your database to the project (see Step 4)
- **If using external provider**: Paste your PostgreSQL connection string here

#### NEXTAUTH_SECRET

Generate a secure random secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as the value for `NEXTAUTH_SECRET`.

## Step 4: Connect Vercel Postgres to Your Project (If Using Vercel Postgres)

1. In your project settings, go to the **Storage** tab
2. Click **Connect Store**
3. Select your Postgres database
4. Click **Connect**
5. Vercel will automatically add the `DATABASE_URL` environment variable

## Step 5: Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Once deployed, Vercel will provide you with a URL

## Step 6: Run Database Migrations

After your first deployment, you need to initialize the database schema:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Functions**
3. Or use Vercel CLI to run migrations:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

Alternatively, you can create a one-time deployment script:

```bash
# In your project root
npx prisma migrate deploy
```

## Step 7: Update NEXTAUTH_URL

After deployment, update the `NEXTAUTH_URL` environment variable:

1. Go to **Settings** → **Environment Variables**
2. Edit `NEXTAUTH_URL`
3. Set it to your actual Vercel URL (e.g., `https://your-app.vercel.app`)
4. Redeploy the project for changes to take effect

## Migrating Data from SQLite to PostgreSQL

If you have existing data in your local SQLite database that you want to migrate:

### Option 1: Manual Export/Import (Small Datasets)

1. Export data from SQLite:
```bash
# Install sqlite3 if needed
npm install -g sqlite3

# Export to CSV or JSON
sqlite3 dev.db ".mode csv" ".output users.csv" "SELECT * FROM User;"
```

2. Import to PostgreSQL using a script or database client

### Option 2: Using Prisma (Recommended)

1. Create a migration script:

```javascript
// scripts/migrate-data.js
const { PrismaClient: PrismaClientSQLite } = require('@prisma/client');
const { PrismaClient: PrismaClientPostgres } = require('@prisma/client');

const sqlite = new PrismaClientSQLite({
  datasources: { db: { url: 'file:./dev.db' } }
});

const postgres = new PrismaClientPostgres({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function migrate() {
  // Migrate users
  const users = await sqlite.user.findMany();
  await postgres.user.createMany({ data: users, skipDuplicates: true });
  
  // Migrate other tables...
  // Add similar code for other models
  
  console.log('Migration complete!');
}

migrate()
  .catch(console.error)
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });
```

2. Run the migration:
```bash
DATABASE_URL="your-postgres-url" node scripts/migrate-data.js
```

## Troubleshooting

### Build Fails with "Prisma Client Not Generated"

**Solution**: The `postinstall` script in `package.json` should handle this, but if it fails:

1. Check that `package.json` has:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

2. Ensure `vercel.json` has the correct build command

### Database Connection Errors

**Solution**: 

1. Verify `DATABASE_URL` is correctly set in environment variables
2. Ensure the connection string includes `?sslmode=require` for PostgreSQL
3. Check that your database is accessible from Vercel's servers

### "NEXTAUTH_URL" or "NEXTAUTH_SECRET" Missing

**Solution**: Make sure you've added these environment variables in Vercel dashboard and redeployed

### Migration Errors

**Solution**:

1. Ensure you're using PostgreSQL-compatible migrations
2. Run `npx prisma migrate reset` locally with PostgreSQL to test
3. Check Prisma schema is compatible with PostgreSQL

## Local Development After Changes

To continue local development with SQLite:

1. Create a `.env` file in your project root (this is gitignored)
2. Add:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

4. Start development server:
```bash
npm run dev
```

## Continuous Deployment

Once set up, Vercel will automatically deploy:

- **Production**: Every push to your main/master branch
- **Preview**: Every push to other branches or pull requests

## Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Support

If you encounter issues:

1. Check Vercel deployment logs in the dashboard
2. Review Prisma documentation for PostgreSQL-specific issues
3. Ensure all environment variables are correctly set
