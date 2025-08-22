#!/bin/bash

# Comprehensive script to fix ALL Worker import paths
# This fixes the deployment issue where Worker files can't resolve _astro dependencies

echo "🔧 Fixing Worker import paths..."

# Get the worker directory
WORKER_DIR="/home/dreamforge/ai_masterclass/executive-ai-training/dist/_worker.js"

if [ ! -d "$WORKER_DIR" ]; then
    echo "❌ Worker directory not found: $WORKER_DIR"
    exit 1
fi

echo "📁 Working in: $WORKER_DIR"

# Function to fix imports in a file
fix_imports() {
    local file="$1"
    local search_pattern="$2"
    local replacement="$3"
    local description="$4"
    
    if [ -f "$file" ]; then
        echo "  🔄 Fixing $description in: $(basename "$file")"
        
        # Use sed to replace the import patterns
        # Note: Using | as delimiter to avoid issues with / in paths
        sed -i "s|$search_pattern|$replacement|g" "$file"
        
        # Verify the change was made
        if grep -q "$replacement" "$file"; then
            echo "    ✅ Successfully updated imports in $(basename "$file")"
        else
            echo "    ⚠️  No matches found or already correct in $(basename "$file")"
        fi
    else
        echo "    ❌ File not found: $file"
    fi
}

echo ""
echo "🎯 Fixing core Worker files..."

# Fix manifest_YRcNJz0a.mjs: "./_astro/" -> "../_astro/"
fix_imports \
    "$WORKER_DIR/manifest_YRcNJz0a.mjs" \
    '"\./\_astro/' \
    '"../\_astro/' \
    "manifest imports"

# Fix renderers.mjs: "./_astro/" -> "../_astro/"
fix_imports \
    "$WORKER_DIR/renderers.mjs" \
    '"\./\_astro/' \
    '"../\_astro/' \
    "renderer imports"

# Fix _astro-internal_middleware.mjs: "./_astro/" -> "../_astro/"
fix_imports \
    "$WORKER_DIR/_astro-internal_middleware.mjs" \
    '"\./\_astro/' \
    '"../\_astro/' \
    "middleware imports"

# Fix _@astrojs-ssr-adapter.mjs: "./_astro/" -> "../_astro/"
fix_imports \
    "$WORKER_DIR/_@astrojs-ssr-adapter.mjs" \
    '"\./\_astro/' \
    '"../\_astro/' \
    "SSR adapter imports"

echo ""
echo "📄 Checking page files (should already be correct)..."

# Check if any page files have incorrect imports (they should be correct but let's verify)
PAGE_FILES_WITH_WRONG_IMPORTS=$(find "$WORKER_DIR/pages" -name "*.mjs" -exec grep -l '"\./\_astro/' {} \; 2>/dev/null || true)

if [ -n "$PAGE_FILES_WITH_WRONG_IMPORTS" ]; then
    echo "  🔄 Found page files with incorrect imports, fixing..."
    while IFS= read -r file; do
        fix_imports \
            "$file" \
            '"\./\_astro/' \
            '"../\_astro/' \
            "page imports"
    done <<< "$PAGE_FILES_WITH_WRONG_IMPORTS"
else
    echo "  ✅ All page files have correct imports (../_astro/)"
fi

echo ""
echo "🔍 Verification of fixes..."

# Verify the fixes
echo "📊 Import pattern summary:"

# Count files with correct patterns
CORRECT_MAIN_FILES=$(find "$WORKER_DIR" -maxdepth 1 -name "*.mjs" -exec grep -l '"../\_astro/' {} \; 2>/dev/null | wc -l)
CORRECT_PAGE_FILES=$(find "$WORKER_DIR/pages" -name "*.mjs" -exec grep -l '"../\_astro/' {} \; 2>/dev/null | wc -l)

# Count files with incorrect patterns (should be 0 after fix)
INCORRECT_MAIN_FILES=$(find "$WORKER_DIR" -maxdepth 1 -name "*.mjs" -exec grep -l '"\./\_astro/' {} \; 2>/dev/null | wc -l)
INCORRECT_PAGE_FILES=$(find "$WORKER_DIR/pages" -name "*.mjs" -exec grep -l '"\./\_astro/' {} \; 2>/dev/null | wc -l)

echo "  ✅ Main files with correct '../_astro/' imports: $CORRECT_MAIN_FILES"
echo "  ✅ Page files with correct '../_astro/' imports: $CORRECT_PAGE_FILES"
echo "  ❌ Main files with incorrect './_astro/' imports: $INCORRECT_MAIN_FILES"
echo "  ❌ Page files with incorrect './_astro/' imports: $INCORRECT_PAGE_FILES"

echo ""
if [ "$INCORRECT_MAIN_FILES" -eq 0 ] && [ "$INCORRECT_PAGE_FILES" -eq 0 ]; then
    echo "🎉 SUCCESS! All Worker import paths have been fixed!"
    echo ""
    echo "📂 File structure understanding:"
    echo "   • Worker files are in: dist/_worker.js/"
    echo "   • Static assets are in: dist/_astro/"
    echo "   • All imports now correctly use '../_astro/' from Worker directory"
    echo ""
    echo "🚀 The Worker should now be able to resolve all dependencies correctly."
else
    echo "⚠️  WARNING: Some files still have incorrect import patterns!"
    echo "   Please check the files manually."
    
    if [ "$INCORRECT_MAIN_FILES" -gt 0 ]; then
        echo ""
        echo "Main files with incorrect imports:"
        find "$WORKER_DIR" -maxdepth 1 -name "*.mjs" -exec grep -l '"\./\_astro/' {} \; 2>/dev/null
    fi
    
    if [ "$INCORRECT_PAGE_FILES" -gt 0 ]; then
        echo ""
        echo "Page files with incorrect imports:"
        find "$WORKER_DIR/pages" -name "*.mjs" -exec grep -l '"\./\_astro/' {} \; 2>/dev/null
    fi
fi

echo ""
echo "🏁 Import path fix script completed!"