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
  DATABASE_POOL_MAX="5" \
  S3_ENDPOINT="https://t3.storageapi.dev" \
  S3_REGION="auto" \
  S3_BUCKET="storage-lglhr2bjxd1yzsbg8" \
  S3_ACCESS_KEY_ID="tid_wUXcfOSC_QVAyuZFpCYWynymZtgodrwDcnvuipKjoHaYqcPeoo" \
  S3_SECRET_ACCESS_KEY="tsec_TrFazLMnTAlbVZud2qTYC2tK7U4ebjp4VkcV1Y+ty7wwS0lRkXcrBu9XRmTBqzzO9MzZWi" \
  S3_PUBLIC_URL="https://t3.storageapi.dev/storage-lglhr2bjxd1yzsbg8"

echo "✅ Environment variables successfully updated on Railway!"
