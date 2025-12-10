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

> **📖 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**
> 
> **⚡ Quick setup guide: [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)**

### Quick Overview

1. **Set up a PostgreSQL database** (Vercel Postgres recommended)
2. **Configure environment variables** in Vercel Dashboard:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_URL` - Your Vercel deployment URL
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
3. **Deploy** your project to Vercel
4. **Run migrations** using Vercel CLI or your database provider

For complete step-by-step instructions, troubleshooting, and data migration guides, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Prisma ORM (SQLite for local dev, PostgreSQL for production)
- **Additional**: next-auth, react-hook-form, date-fns, react-pdf

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Vercel Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)
