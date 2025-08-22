#!/bin/bash

echo "🚀 Starting All Servers for Production Testing"
echo "=============================================="

# Kill any existing servers
echo "🔄 Cleaning up any existing processes..."
pkill -f "astro preview" 2>/dev/null
pkill -f "search-server" 2>/dev/null
sleep 2

# Start search server
echo ""
echo "📡 Starting Search Server on port 3001..."
node search-server.js > search-server.log 2>&1 &
SEARCH_PID=$!
sleep 2

# Check if search server started
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Search server running on http://localhost:3001"
else
    echo "❌ Failed to start search server"
    exit 1
fi

# Start production preview
echo ""
echo "🌐 Starting Production Preview on port 4321..."
npm run preview > preview.log 2>&1 &
PREVIEW_PID=$!
sleep 3

echo ""
echo "=============================================="
echo "✅ All servers started successfully!"
echo ""
echo "📋 Server Status:"
echo "  • Search Server: http://localhost:3001 (PID: $SEARCH_PID)"
echo "  • Production App: http://localhost:4321 (PID: $PREVIEW_PID)"
echo ""
echo "🧪 Test Pages:"
echo "  • Test Dashboard: http://localhost:4321/test-production"
echo "  • Voice Agent: http://localhost:4321/voice-agent"
echo "  • Voice Test: http://localhost:4321/voice-agent-test"
echo ""
echo "📝 Logs:"
echo "  • Search: tail -f search-server.log"
echo "  • Preview: tail -f preview.log"
echo ""
echo "🛑 To stop all servers: pkill -f 'astro preview'; pkill -f 'search-server'"
echo ""
echo "Press Ctrl+C to stop monitoring (servers will continue running)"

# Keep script running to show logs
tail -f search-server.log preview.log