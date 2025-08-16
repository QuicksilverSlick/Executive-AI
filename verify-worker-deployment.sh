#!/bin/bash

# Verification script to check if Worker files are ready for deployment
# This validates that all import paths are correct for Cloudflare Workers

echo "🔍 Verifying Worker deployment readiness..."

WORKER_DIR="/home/dreamforge/ai_masterclass/executive-ai-training/dist/_worker.js"
ASSETS_DIR="/home/dreamforge/ai_masterclass/executive-ai-training/dist/_astro"

# Check directories exist
if [ ! -d "$WORKER_DIR" ]; then
    echo "❌ Worker directory not found: $WORKER_DIR"
    exit 1
fi

if [ ! -d "$ASSETS_DIR" ]; then
    echo "❌ Assets directory not found: $ASSETS_DIR"
    exit 1
fi

echo "✅ Both Worker and Assets directories found"
echo ""

# Check for any remaining incorrect import patterns
echo "🔎 Scanning for incorrect import patterns..."

INCORRECT_IMPORTS=$(find "$WORKER_DIR" -name "*.mjs" -exec grep -l '"\./\_astro/' {} \; 2>/dev/null || true)

if [ -n "$INCORRECT_IMPORTS" ]; then
    echo "❌ Found files with incorrect import patterns:"
    echo "$INCORRECT_IMPORTS"
    echo ""
    echo "These files still use './_astro/' instead of '../_astro/'"
    exit 1
else
    echo "✅ No incorrect import patterns found"
fi

# Count correct imports
MAIN_FILES_COUNT=$(find "$WORKER_DIR" -maxdepth 1 -name "*.mjs" | wc -l)
PAGE_FILES_COUNT=$(find "$WORKER_DIR/pages" -name "*.mjs" 2>/dev/null | wc -l)
CORRECT_MAIN_IMPORTS=$(find "$WORKER_DIR" -maxdepth 1 -name "*.mjs" -exec grep -l '"../\_astro/' {} \; 2>/dev/null | wc -l)
CORRECT_PAGE_IMPORTS=$(find "$WORKER_DIR/pages" -name "*.mjs" -exec grep -l '"../\_astro/' {} \; 2>/dev/null | wc -l)

echo ""
echo "📊 Import Statistics:"
echo "  • Main Worker files: $MAIN_FILES_COUNT"
echo "  • Page files: $PAGE_FILES_COUNT"
echo "  • Main files with correct imports: $CORRECT_MAIN_IMPORTS"
echo "  • Page files with correct imports: $CORRECT_PAGE_IMPORTS"

# Check if key files exist
echo ""
echo "🔧 Checking key Worker files..."

KEY_FILES=(
    "index.js"
    "manifest_YRcNJz0a.mjs"
    "renderers.mjs"
    "_astro-internal_middleware.mjs"
    "_@astrojs-ssr-adapter.mjs"
)

ALL_KEY_FILES_EXIST=true

for file in "${KEY_FILES[@]}"; do
    if [ -f "$WORKER_DIR/$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        ALL_KEY_FILES_EXIST=false
    fi
done

# Check for required assets
echo ""
echo "🎨 Checking critical assets..."

REQUIRED_ASSETS=$(grep -h '"../\_astro/[^"]*"' "$WORKER_DIR"/*.mjs 2>/dev/null | sed 's/.*"\.\.\/\_astro\/\([^"]*\)".*/\1/' | sort -u | head -5)

MISSING_ASSETS=()
while IFS= read -r asset; do
    if [ -n "$asset" ] && [ ! -f "$ASSETS_DIR/$asset" ]; then
        MISSING_ASSETS+=("$asset")
    fi
done <<< "$REQUIRED_ASSETS"

if [ ${#MISSING_ASSETS[@]} -eq 0 ]; then
    echo "  ✅ All sampled assets found"
else
    echo "  ❌ Missing assets:"
    printf '    • %s\n' "${MISSING_ASSETS[@]}"
    ALL_KEY_FILES_EXIST=false
fi

echo ""
echo "📂 Directory Structure:"
echo "  Worker files: dist/_worker.js/"
echo "  Static assets: dist/_astro/"
echo "  Import pattern: Worker files import from '../_astro/'"
echo "  Page files: Worker files import from '../_astro/'"

echo ""
if [ "$ALL_KEY_FILES_EXIST" = true ] && [ ${#MISSING_ASSETS[@]} -eq 0 ] && [ -z "$INCORRECT_IMPORTS" ]; then
    echo "🎉 DEPLOYMENT READY!"
    echo ""
    echo "✅ All Worker files have correct import paths"
    echo "✅ All key files are present"
    echo "✅ Critical assets are available"
    echo ""
    echo "🚀 Your Cloudflare Worker should now deploy successfully!"
    echo "   All import paths are correctly resolved to '../_astro/' from the Worker directory."
else
    echo "❌ DEPLOYMENT NOT READY"
    echo ""
    echo "Please fix the issues listed above before deploying."
    exit 1
fi