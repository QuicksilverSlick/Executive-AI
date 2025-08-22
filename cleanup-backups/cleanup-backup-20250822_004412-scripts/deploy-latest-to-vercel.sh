#!/bin/bash

# Deploy the latest commit to Vercel
echo "🚀 Deploying latest commit to Vercel..."

# Get the latest commit hash
LATEST_COMMIT=$(git rev-parse HEAD)
LATEST_MESSAGE=$(git log -1 --pretty=%B)

echo "📍 Latest commit: $LATEST_COMMIT"
echo "📝 Message: $LATEST_MESSAGE"

# If you have Vercel CLI and are logged in, uncomment these:
# vercel --prod --force
# or
# vercel deploy --prod --no-wait

echo ""
echo "👉 To deploy this commit manually:"
echo "1. Go to: https://vercel.com/quicksilvers-projects/executive-ai"
echo "2. Click 'Create Deployment' or 'Deploy'"
echo "3. Select commit: $LATEST_COMMIT"
echo "4. Click 'Deploy'"
echo ""
echo "Current commit should show: f35df2c (not 08ab51d)"