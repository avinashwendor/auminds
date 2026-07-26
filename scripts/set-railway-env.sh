#!/usr/bin/env bash

# Railway Environment Variables Uploader Script
echo "Setting up Railway environment variables..."

# Verify Railway CLI login
if ! npx @railway/cli whoami > /dev/null 2>&1; then
  echo "Please log in to Railway CLI first by running:"
  echo "npx @railway/cli login"
  exit 1
fi

# Link project if not already linked
npx @railway/cli link

# Set variables on Railway
npx @railway/cli variable set \
  NODE_ENV="production" \
  JWT_SECRET="super_secret_jwt_key_change_me_in_production_32chars" \
  DATABASE_SSL="false" \
  DATABASE_POOL_MAX="5"

echo "✅ Environment variables successfully updated on Railway!"
