#!/bin/bash

# Force Cloudflare Pages to rebuild with latest commit
# This script creates a trivial change to trigger a fresh build

echo "=== Forcing Cloudflare Pages Redeploy ==="
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Create a timestamp file to force a change
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "Deployment triggered at: $TIMESTAMP" > .cloudflare-deploy-trigger

# Commit the change
git add .cloudflare-deploy-trigger
git commit -m "Force redeploy: Clear build cache at $TIMESTAMP"

# Push to trigger deployment
echo ""
echo "Pushing to trigger fresh deployment..."
git push origin $CURRENT_BRANCH

echo ""
echo "✅ Push complete! This should trigger a fresh build in Cloudflare Pages."
echo ""
echo "Next steps:"
echo "1. Check Cloudflare Pages dashboard for new build"
echo "2. Verify it's using the latest commit"
echo "3. The build should now include the React SSR fixes"