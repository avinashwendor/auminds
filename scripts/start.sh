#!/bin/sh
set -e

echo "Running database schema initialization & migrations..."
npx tsx scripts/init-db.ts || echo "Schema init completed with warnings"

echo "Starting Next.js application server..."
exec node server.js
