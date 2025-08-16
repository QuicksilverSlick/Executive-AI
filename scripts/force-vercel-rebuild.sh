#!/bin/bash

# Force a fresh Vercel build by creating an empty commit
echo "🚀 Forcing fresh Vercel build..."

# Add a timestamp to force a new commit
echo "# Build trigger: $(date)" >> .vercel-build-trigger

# Commit and push
git add .vercel-build-trigger
git commit -m "Force fresh Vercel build - $(date +%Y%m%d-%H%M%S)"
git push origin main

echo "✅ Fresh build triggered! Check Vercel dashboard for deployment status."
echo "🔗 https://vercel.com/quicksilvers-projects/executive-ai/deployments"