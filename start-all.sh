#!/bin/bash

echo "🚀 Starting Executive AI Training Platform"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill any existing servers
echo "🔄 Cleaning up existing processes..."
pkill -f "astro dev" 2>/dev/null
pkill -f "search-server" 2>/dev/null
pkill -f "astro preview" 2>/dev/null
sleep 2

# Start search server
echo -e "${BLUE}📡 Starting Search Server...${NC}"
node search-server.js > search-server.log 2>&1 &
SEARCH_PID=$!
echo "   PID: $SEARCH_PID"
sleep 2

# Check if search server started
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Search server running on http://localhost:3001${NC}"
    # Test search functionality
    echo -e "${BLUE}   🔍 Testing search...${NC}"
    if curl -s "http://localhost:3001/search?query=test" | grep -q "success"; then
        echo -e "${GREEN}   ✅ Search functionality working${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Search test failed - check API key${NC}"
    fi
else
    echo -e "${YELLOW}   ❌ Search server failed to start${NC}"
    echo "   Check search-server.log for errors"
    exit 1
fi

# Start dev server
echo ""
echo -e "${BLUE}🌐 Starting Development Server...${NC}"
npm run dev > dev-server.log 2>&1 &
DEV_PID=$!
echo "   PID: $DEV_PID"
echo "   Waiting for server to start..."
sleep 6

# Check if dev server is running
if lsof -i :4321 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Dev server running on http://localhost:4321${NC}"
else
    echo -e "${YELLOW}   ⚠️  Dev server may still be starting...${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✨ All services started successfully!${NC}"
echo ""
echo "📍 Services:"
echo "   • Main App:     http://localhost:4321"
echo "   • Voice Agent:  http://localhost:4321/voice-agent"
echo "   • Search API:   http://localhost:3001"
echo ""
echo "📝 Logs:"
echo "   • Search: tail -f search-server.log"
echo "   • Dev:    tail -f dev-server.log"
echo ""
echo "🛑 To stop all:"
echo "   pkill -f 'astro dev'; pkill -f 'search-server'"
echo ""
echo -e "${YELLOW}⚠️  Keep this terminal open or services will stop${NC}"
echo ""
echo "Press Ctrl+C to stop all services..."

# Keep script running and show logs
tail -f search-server.log dev-server.log