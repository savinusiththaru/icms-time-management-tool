# Weekly Task Manager

This is a [Next.js](https://nextjs.org) project with [Prisma](https://www.prisma.io/) ORM for task management.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite or PostgreSQL database

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and set DATABASE_URL if needed (defaults to SQLite: file:./dev.db)
```

3. **Run database migrations:**
```bash
npx prisma migrate dev
```

4. **Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

### Step 1: Push to GitHub
Ensure your code is pushed to GitHub at https://github.com/savinusiththaru/icms-time-management-tool

### Step 2: Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project" and import your GitHub repository
3. Select the project and click "Deploy"

### Step 3: Configure Database
**Option A: Use Vercel Postgres (Recommended)**
1. In Vercel dashboard, go to Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` connection string
3. Add it to your project's environment variables:
   - Settings → Environment Variables
   - Name: `DATABASE_URL`
   - Value: `[Your PostgreSQL connection string]`

**Option B: Use External PostgreSQL**
1. Get your PostgreSQL connection string (e.g., from Railway, Supabase, etc.)
2. Add it to Vercel environment variables as `DATABASE_URL`

**Option C: Use SQLite (Development Only)**
- SQLite files won't persist on Vercel (serverless environment)
- Switch to PostgreSQL for production

### Step 4: Run Migrations on Vercel
After setting `DATABASE_URL`, the build will automatically run `prisma generate`. To apply migrations:

1. Run locally first:
```bash
npx prisma migrate deploy
```

2. Or manually trigger migration in Vercel by redeploying

### Troubleshooting

**Error: "Prisma has detected that this project was built on Vercel..."**
- Solution: Already fixed in this project (build script includes `prisma generate`)

**Error: "Application error" on Vercel deployment**
- Check: Is `DATABASE_URL` set in Vercel environment variables?
- Check: Has database been created and migrations applied?

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Additional**: next-auth, react-hook-form, date-fns, react-pdf

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Vercel Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)
