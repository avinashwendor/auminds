#!/bin/sh
set -e

DB_URL="${DATABASE_URL:-${POSTGRES_URL:-${DATABASE_PRIVATE_URL:-$DATABASE_PUBLIC_URL}}}"

if [ -n "$DB_URL" ]; then
  echo "🚀 Running database schema push with drizzle-kit..."
  npx drizzle-kit push || echo "⚠️ drizzle-kit push encountered an issue, continuing application startup..."
else
  echo "⚠️ DATABASE_URL is not configured in environment variables. Skipping drizzle-kit push."
  echo "👉 To connect PostgreSQL on Railway, set the DATABASE_URL environment variable to \${{Postgres.DATABASE_URL}} or \${{Postgres.DATABASE_PRIVATE_URL}}."
fi

echo "🚀 Starting Next.js application server..."
exec node server.js
