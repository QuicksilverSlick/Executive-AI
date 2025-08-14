#!/bin/bash

echo "🔄 Restarting Development Environment"
echo "====================================="

# Kill existing servers
echo "Stopping existing servers..."
pkill -f "astro dev" 2>/dev/null
pkill -f "search-server" 2>/dev/null
sleep 2

# Start search server
echo "Starting search server on port 3001..."
node search-server.js > search-server.log 2>&1 &
SEARCH_PID=$!
echo "Search server PID: $SEARCH_PID"
sleep 2

# Check search server
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Search server running"
else
    echo "❌ Search server failed to start"
    exit 1
fi

# Start dev server
echo "Starting Astro dev server on port 4321..."
npm run dev &
DEV_PID=$!
echo "Dev server PID: $DEV_PID"
sleep 5

echo ""
echo "====================================="
echo "✅ Development environment ready!"
echo ""
echo "🌐 Main app: http://localhost:4321"
echo "🔍 Voice Agent: http://localhost:4321/voice-agent"
echo "📡 Search API: http://localhost:3001"
echo ""
echo "⚠️  IMPORTANT: Use port 4321, not 4322!"
echo ""
echo "To stop: pkill -f 'astro dev'; pkill -f 'search-server'"
echo ""
echo "Tailing logs (Ctrl+C to exit)..."
tail -f search-server.log