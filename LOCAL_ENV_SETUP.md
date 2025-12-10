# Important Note About Local .env File

The `.env` file is gitignored for security reasons (it contains sensitive credentials).

## For Local Development

Create a `.env` file in the project root with the following content:

```env
# Local Development Environment Variables
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-change-in-production"
```

This allows you to:
- Continue using SQLite for local development
- Test authentication features locally
- Keep your local environment isolated from production

## Schema Validation Note

The Prisma schema is now configured for PostgreSQL (for Vercel compatibility), but you can still use SQLite locally by setting `DATABASE_URL="file:./dev.db"` in your `.env` file.

When you run `npx prisma validate` with a SQLite URL, it will show a warning because the schema specifies PostgreSQL. This is expected and won't affect local development - Prisma will still work correctly with SQLite.

For production on Vercel, you'll use a PostgreSQL database URL, which will match the schema configuration.
