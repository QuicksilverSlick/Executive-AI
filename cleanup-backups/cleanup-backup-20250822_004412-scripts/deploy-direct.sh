#!/bin/bash

# Direct deployment to Cloudflare Pages bypassing GitHub integration
# This ensures we use the exact local code with all fixes

echo "=== Direct Cloudflare Pages Deployment ==="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing wrangler CLI..."
    npm install -g wrangler
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist
rm -rf .astro

# Build with latest code
echo "Building application with latest fixes..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "Build successful! Now deploying to Cloudflare Pages..."
echo ""

# Deploy directly to Cloudflare Pages
wrangler pages deploy dist \
  --project-name=executive-ai \
  --branch=main \
  --commit-hash=$(git rev-parse HEAD) \
  --commit-message="Direct deployment with React SSR fixes"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Check your Cloudflare Pages dashboard for the new deployment"
echo "2. It should show the latest commit hash: $(git rev-parse HEAD)"
echo "3. The MessageChannel error should be resolved"