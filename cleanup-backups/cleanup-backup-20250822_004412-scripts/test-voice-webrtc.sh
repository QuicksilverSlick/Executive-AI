#!/bin/bash

echo "Testing WebRTC Voice Agent..."
echo "=========================="

# Test health endpoint
echo -e "\n1. Testing health endpoint:"
curl -s http://localhost:4321/api/voice-agent/health | grep -o '"status":"[^"]*"' || echo "Health check failed"

# Test token endpoint
echo -e "\n2. Testing token endpoint:"
curl -s -X POST http://localhost:4321/api/voice-agent/token \
  -H "Content-Type: application/json" \
  -d '{"test": true}' | grep -o '"token":"[^"]*"' | head -c 50 || echo "Token endpoint failed"

echo -e "\n\n3. Voice test page URL: http://localhost:4321/voice-test-webrtc"
echo "   Open this URL in your browser to test the voice agent"

echo -e "\n4. Main features to test:"
echo "   - Continuous conversation mode (no push-to-talk)"
echo "   - Real-time audio streaming"
echo "   - Automatic speech detection"
echo "   - Natural conversation flow"