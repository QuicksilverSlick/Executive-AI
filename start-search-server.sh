#!/bin/bash

echo "🚀 Starting Standalone Search Server..."
echo "=================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env"
else
    echo "⚠️  No .env file found"
fi

# Check if API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ ERROR: OPENAI_API_KEY is not set!"
    echo "Please ensure your .env file contains: OPENAI_API_KEY=your-key-here"
    exit 1
fi

echo "✅ OpenAI API key found (length: ${#OPENAI_API_KEY})"
echo ""
echo "Starting server on port 3001..."
echo "=================================="
echo ""

# Start the search server
node search-server.js