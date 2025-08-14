# Standalone Search Server Setup

## Why This Solution?

After extensive debugging, we identified that the Astro development server has an issue with query parameter handling in API routes. To bypass this completely, we've created a standalone Express server that handles all search requests reliably.

## Architecture

```
Voice Agent (WebRTC) 
    ↓
Port 3001 (Standalone Search Server)
    ↓
OpenAI Responses API
    ↓
Search Results back to Voice Agent
```

## Setup Instructions

### 1. Start the Search Server (Terminal 1)

```bash
# In your project directory
./start-search-server.sh

# Or manually:
node search-server.js
```

You should see:
```
🚀 Standalone search server running on http://localhost:3001
✅ OpenAI API Key: Configured
```

### 2. Start the Astro Dev Server (Terminal 2)

```bash
npm run dev
```

The Astro server will run on port 4323 (or whatever port is available).

### 3. Access the Application

Open your browser to: http://localhost:4323

## How It Works

1. **Voice Input**: User speaks a search request
2. **Function Call**: OpenAI Realtime API recognizes search intent and calls `web_search` function
3. **Search Execution**: Voice agent calls `http://localhost:3001/search` with the query
4. **API Call**: Search server calls OpenAI Responses API with web_search tool
5. **Results**: Search results are returned to the voice agent
6. **Voice Output**: Results are spoken back to the user

## Testing the Search Server

### Test Health Check
```bash
curl http://localhost:3001/health
```

### Test Search (GET)
```bash
curl "http://localhost:3001/search?query=OpenAI%20GPT-5"
```

### Test Search (POST)
```bash
curl -X POST http://localhost:3001/search \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI news 2025"}'
```

## Troubleshooting

### Search Server Won't Start
- Check if port 3001 is already in use: `lsof -i :3001`
- Verify .env file exists with OPENAI_API_KEY
- Check Node.js is installed: `node --version`

### No Search Results
- Check the search server console for error messages
- Verify OpenAI API key is valid
- Check if Responses API is available on your OpenAI tier

### Voice Agent Can't Connect
- Ensure search server is running on port 3001
- Check browser console for CORS errors
- Verify both servers are running

## Files Involved

- `search-server.js` - Standalone Express server for search
- `src/lib/voice-agent/webrtc/main.ts` - Updated to call port 3001
- `.env` - Contains OPENAI_API_KEY
- `start-search-server.sh` - Startup script for search server

## Benefits of This Approach

1. **Reliability**: Bypasses Astro's query parameter issues completely
2. **Debugging**: Clear, isolated logs for search requests
3. **Flexibility**: Can easily add more search features
4. **Performance**: Direct Express server is faster than Astro API routes
5. **Portability**: Search server can be deployed separately if needed

## Next Steps

Once both servers are running:
1. Click the microphone icon in the voice agent
2. Say: "Search for [your query]"
3. The agent will perform the search and speak the results

The search functionality is now completely isolated from Astro's environment issues and should work reliably.