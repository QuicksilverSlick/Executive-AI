<!--
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive documentation for voice agent web search implementation
 * @version: 1.0.0
 * @init-author: doc-agent
 * @init-cc-sessionId: cc-doc-20250811-001
 * @init-timestamp: 2025-08-11T10:30:00Z
 * @reasoning:
 * - **Objective:** Document voice search integration architecture and implementation
 * - **Strategy:** Provide clear explanations of data flow, configuration, and troubleshooting
 * - **Outcome:** Complete developer reference for voice search implementation
 -->

# Voice Agent Web Search Implementation

This document provides comprehensive documentation for the web search implementation in the Realtime API voice agent, covering architecture, configuration, data flow, and troubleshooting.

## Architecture Overview

The voice agent web search implementation integrates three key OpenAI APIs to provide a seamless voice-to-search-to-voice experience:

### 1. OpenAI Realtime API
- **Purpose**: Handles real-time voice communication
- **Role**: Manages audio input/output, function calling, and conversation state
- **Connection**: WebRTC for low-latency voice streaming

### 2. OpenAI Function Calling
- **Purpose**: Enables the AI to invoke web search capabilities
- **Role**: Recognizes search intent and triggers search functions
- **Integration**: Native function calling within conversation context

### 3. OpenAI Responses API
- **Purpose**: Executes web searches with current information
- **Role**: Performs actual web searches and returns results
- **Implementation**: Standalone search server endpoint

## System Components

### Core Components Diagram
```
[User Voice] → [Realtime API] → [Function Calling] → [Responses API] → [Search Results] → [Voice Response]
     ↑                                                                                            ↓
     └────────────────── [Audio Response Generation] ←──────── [Result Processing] ←─────────────┘
```

### Component Details

#### 1. Voice Agent Core (`voice-assistant-core.js`)
- **Location**: `src/components/voice-agent/voice-assistant-core.js`
- **Role**: UI orchestration and user interaction management
- **Key Features**:
  - FAB (Floating Action Button) interface
  - Transcript display
  - Audio visualization
  - Error handling and user feedback

#### 2. WebRTC Voice Agent (`main.ts`)
- **Location**: `src/lib/voice-agent/webrtc/main.ts`
- **Role**: Core Realtime API integration
- **Key Features**:
  - WebRTC connection management
  - Function call handling
  - Search result processing
  - Conversation state management

#### 3. Search Server (`search-server.js`)
- **Location**: `search-server.js`
- **Role**: Standalone search API using OpenAI Responses API
- **Key Features**:
  - OpenAI Responses API integration
  - Multiple endpoint support (GET/POST)
  - Error handling and fallback responses

#### 4. Type Definitions (`types/index.ts`)
- **Location**: `src/features/voice-agent/types/index.ts`
- **Role**: TypeScript definitions for all components
- **Coverage**: Complete type safety for entire system

## Web Search Configuration

### 1. Realtime API Session Configuration

The web search capability is configured in the session config within the types file:

```typescript
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  // ... other config
  tools: [
    {
      type: 'function',
      name: 'web_search',
      description: `Search the web for current information about businesses, locations, news, AI tools, industry trends, competitor AI usage, or educational resources.

IMPORTANT: Always acknowledge the search request naturally before calling this function. Use conversation context to understand what they're asking about.

Use this when users:
- Ask about what AI tools are available for their industry
- Want to know what competitors are doing with AI
- Need information about specific AI solutions they've heard about
- Request examples of AI success stories in their field
- Want current information about AI training resources or costs`,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'the search query to execute. Include context from current or previous conversation when relevant (e.g., business name + what user is asking about).'
          }
        },
        required: ['query']
      }
    }
  ],
  tool_choice: 'auto',
  // ... rest of config
};
```

### 2. Function Call Handler Configuration

In the WebRTC Voice Agent (`main.ts`), the function calling is handled in the `handleFunctionCallDone` method:

```typescript
private handleFunctionCallDone(event: any): void {
  // Extract function name and arguments
  if (functionName === 'web_search') {
    this.executeWebSearch(event.call_id, parsedArgs);
  }
}
```

### 3. Search Endpoint Configuration

The search endpoint URL is determined by the `getSearchEndpoint()` method:

```typescript
private getSearchEndpoint(): string {
  // Points to the Responses API endpoint
  return '/api/voice-agent/responses-search';
}
```

## Data Flow

### Complete Voice Search Flow

1. **User Voice Input**
   ```
   User: "What AI tools are available for restaurants?"
   ```

2. **Realtime API Processing**
   - Speech-to-text transcription
   - Intent recognition identifies search requirement
   - Function call generated:
   ```json
   {
     "name": "web_search",
     "arguments": {
       "query": "AI tools for restaurants 2025"
     }
   }
   ```

3. **Function Call Execution**
   ```typescript
   // In WebRTC Voice Agent
   private async executeWebSearch(callId: string, args: { query: string }): Promise<void> {
     const response = await fetch('/api/voice-agent/responses-search', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ query: args.query })
     });
   }
   ```

4. **Responses API Call**
   ```javascript
   // In search-server.js
   const requestBody = {
     model: 'gpt-4o',
     input: `Search for current information and provide accurate, detailed results with sources when available.\n\n${searchPrompt}`,
     tools: [{
       type: 'web_search',
       search_context_size: 'medium'
     }],
     tool_choice: { type: 'web_search' }
   };
   
   const response = await fetch('https://api.openai.com/v1/responses', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${apiKey}`,
     },
     body: JSON.stringify(requestBody)
   });
   ```

5. **Result Processing**
   ```javascript
   // Extract search results and citations
   const searchResults = [];
   const citations = [];
   
   if (responseData.output && Array.isArray(responseData.output)) {
     for (const item of responseData.output) {
       if (item.type === 'message' && item.content) {
         // Process annotations for citations
         if (content.annotations) {
           for (const annotation of content.annotations) {
             if (annotation.type === 'url_citation') {
               citations.push(annotation);
               searchResults.push({
                 title: annotation.title,
                 url: annotation.url,
                 snippet: content.text.substring(annotation.start_index, annotation.end_index),
                 source: new URL(annotation.url).hostname
               });
             }
           }
         }
       }
     }
   }
   ```

6. **Response Synthesis**
   ```typescript
   // Send results back to Realtime API
   this.sendFunctionCallResult(callId, {
     success: true,
     query: args.query,
     response: searchResult.response // Natural language summary
   });
   ```

7. **Voice Output Generation**
   - Realtime API generates speech from the search response
   - Audio streamed back through WebRTC connection
   - User hears natural voice response with search results

## API Endpoints

### 1. Search Server Endpoints

#### GET /search
```
URL: http://localhost:3001/search?query=YOUR_QUERY&conversationContext=OPTIONAL_CONTEXT
Method: GET
Purpose: Simple search with query parameters
```

#### POST /search
```json
{
  "query": "AI tools for restaurants",
  "conversationContext": "User owns a restaurant chain"
}
```

#### Health Check
```
URL: http://localhost:3001/health
Method: GET
Response: {"status": "healthy", "timestamp": "2025-08-11T10:30:00.000Z"}
```

### 2. Voice Agent API Endpoints

#### Token Generation
```
URL: /api/voice-agent/token
Method: POST
Purpose: Generate ephemeral tokens for Realtime API
```

#### Responses Search (Integrated)
```
URL: /api/voice-agent/responses-search
Method: POST
Purpose: Internal endpoint for function call execution
```

## Configuration Examples

### 1. Environment Variables

Create a `.env.local` file with the following:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Custom API endpoint
OPENAI_API_BASE=https://api.openai.com/v1

# Optional: Model configuration
OPENAI_MODEL=gpt-4o
```

### 2. Voice Agent Configuration

```typescript
const voiceConfig: VoiceAgentConfig = {
  apiVersion: '2024-10-01',
  model: 'gpt-4o-realtime-preview-2024-10-01',
  apiEndpoint: '/api/voice-agent',
  audioConstraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 24000,
      channelCount: 1
    }
  },
  maxReconnectAttempts: 3,
  reconnectDelay: 1000,
  tokenRefreshThreshold: 300000, // 5 minutes
  targetLatency: 75,
  adaptiveQuality: true,
  elementId: 'voice-assistant-widget',
  theme: 'auto',
  position: 'bottom-right',
  autoStart: false
};
```

### 3. Session Configuration Customization

```typescript
const customSessionConfig: Partial<SessionConfig> = {
  voice: 'shimmer', // Available: alloy, ash, ballad, coral, echo, sage, shimmer, verse
  temperature: 0.75,
  turn_detection: {
    type: 'server_vad',
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 700
  },
  tools: [
    {
      type: 'function',
      name: 'web_search',
      description: 'Custom search description for your use case',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'search query with business context'
          }
        },
        required: ['query']
      }
    }
  ]
};
```

## Usage Examples

### 1. Basic Voice Search Interaction

```
User: "Can you look up the latest AI trends in healthcare?"

System Response:
1. Voice recognition converts speech to text
2. AI identifies search intent
3. Function call triggered: web_search("latest AI trends healthcare 2025")
4. Responses API executes web search
5. Results processed and summarized
6. Natural voice response: "I found several interesting AI trends in healthcare for 2025..."
```

### 2. Contextual Business Search

```
User Context: Previously mentioned owning a dental practice
User: "What are my competitors doing with AI?"

System Response:
1. Search query includes context: "dental practice AI implementation competitors"
2. Results tailored to dental industry
3. Voice response: "Based on current information about dental practices, here's what competitors are implementing..."
```

### 3. Follow-up Search Interactions

```
User: "Tell me more about that patient scheduling AI you mentioned"

System Response:
1. References previous conversation context
2. Focused search: "dental patient scheduling AI software features"
3. Detailed response about specific tools and implementations
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Search Function Not Triggering

**Problem**: User requests search but no web search is performed.

**Symptoms**:
- No search acknowledgment in voice response
- Function call events not appearing in console logs

**Solutions**:
1. **Check Session Configuration**:
   ```typescript
   // Ensure tools are properly configured
   tools: [{
     type: 'function',
     name: 'web_search',
     // ... proper configuration
   }]
   ```

2. **Verify tool_choice Setting**:
   ```typescript
   tool_choice: 'auto' // Allows AI to decide when to use tools
   // OR
   tool_choice: 'required' // Forces tool usage when applicable
   ```

3. **Check Console Logs**:
   ```bash
   # Look for function call events
   [WebRTC Voice Agent] Function call done: web_search
   ```

#### 2. API Key Issues

**Problem**: Search requests failing with authentication errors.

**Symptoms**:
- `401 Unauthorized` responses
- Console errors about missing API keys

**Solutions**:
1. **Verify Environment Variables**:
   ```bash
   # Check if API key is loaded
   echo $OPENAI_API_KEY
   ```

2. **Check Server Logs**:
   ```bash
   [Search Server] ❌ OpenAI API key not configured
   ```

3. **Restart Services**:
   ```bash
   # Restart search server after env changes
   npm run search-server
   ```

#### 3. Empty Search Results

**Problem**: Search executes but returns no useful information.

**Symptoms**:
- Function call succeeds but response is generic
- No citations or specific information returned

**Solutions**:
1. **Check Search Query Quality**:
   ```typescript
   // Ensure queries are specific and contextual
   query: `${businessContext} ${userQuestion} current trends 2025`
   ```

2. **Review Response Processing**:
   ```javascript
   // Check if annotations are being processed
   if (content.annotations) {
     // Citation extraction code
   }
   ```

3. **Verify Responses API Configuration**:
   ```javascript
   const requestBody = {
     model: 'gpt-4o', // Use latest model
     tools: [{
       type: 'web_search',
       search_context_size: 'medium' // Try 'large' for more results
     }]
   };
   ```

#### 4. Connection and Audio Issues

**Problem**: Voice interaction works but search responses aren't spoken.

**Symptoms**:
- Search results appear in logs
- No audio response from assistant

**Solutions**:
1. **Check Audio Element**:
   ```javascript
   // Verify audio element exists and is playing
   const audioElement = document.getElementById('voice-agent-audio');
   console.log('Audio element:', audioElement);
   console.log('Audio playing:', !audioElement?.paused);
   ```

2. **Verify WebRTC Connection**:
   ```typescript
   // Check connection state
   if (this.connectionState !== 'connected') {
     console.error('Not connected to Realtime API');
   }
   ```

3. **Check Browser Audio Permissions**:
   ```javascript
   // Ensure audio context is resumed
   if (audioContext.state === 'suspended') {
     await audioContext.resume();
   }
   ```

#### 5. Rate Limiting and Throttling

**Problem**: Searches fail during heavy usage.

**Symptoms**:
- `429 Too Many Requests` errors
- Intermittent search failures

**Solutions**:
1. **Implement Request Queuing**:
   ```typescript
   private searchQueue: Promise<any> = Promise.resolve();
   
   private async executeWebSearch(callId: string, args: any) {
     this.searchQueue = this.searchQueue.then(() => 
       this.performSearch(callId, args)
     );
     return this.searchQueue;
   }
   ```

2. **Add Exponential Backoff**:
   ```typescript
   async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
       }
     }
   }
   ```

### Performance Optimization

#### 1. Search Query Optimization

```typescript
// Good: Specific, contextual queries
query: "restaurant AI tools point of sale inventory management 2025"

// Avoid: Vague, generic queries
query: "AI tools"
```

#### 2. Response Caching

```typescript
// Simple in-memory cache for repeated searches
private searchCache = new Map<string, any>();

private async executeWebSearch(callId: string, args: { query: string }) {
  const cacheKey = args.query.toLowerCase();
  
  if (this.searchCache.has(cacheKey)) {
    const cachedResult = this.searchCache.get(cacheKey);
    this.sendFunctionCallResult(callId, cachedResult);
    return;
  }
  
  // Perform search and cache result
  const result = await this.performSearch(args.query);
  this.searchCache.set(cacheKey, result);
  this.sendFunctionCallResult(callId, result);
}
```

#### 3. Latency Monitoring

```typescript
// Track search performance
private async executeWebSearch(callId: string, args: { query: string }) {
  const startTime = performance.now();
  
  try {
    const result = await this.performSearch(args.query);
    const duration = performance.now() - startTime;
    
    console.log(`[WebRTC Voice Agent] Search completed in ${Math.round(duration)}ms`);
    
    this.sendFunctionCallResult(callId, result);
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[WebRTC Voice Agent] Search failed after ${Math.round(duration)}ms:`, error);
  }
}
```

## Security Considerations

### 1. API Key Protection
- Store API keys in environment variables only
- Never commit API keys to version control
- Use different keys for development/production
- Rotate keys regularly

### 2. Input Validation
```typescript
private validateSearchQuery(query: string): boolean {
  if (!query || typeof query !== 'string') return false;
  if (query.length > 500) return false; // Prevent excessively long queries
  if (/[<>{}[\]\\]/.test(query)) return false; // Basic XSS prevention
  return true;
}
```

### 3. Rate Limiting
```typescript
private searchAttempts = new Map<string, number>();

private checkRateLimit(sessionId: string): boolean {
  const attempts = this.searchAttempts.get(sessionId) || 0;
  if (attempts > 10) { // 10 searches per session
    return false;
  }
  this.searchAttempts.set(sessionId, attempts + 1);
  return true;
}
```

## Development Workflow

### 1. Local Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your OpenAI API key

# Start search server
npm run search-server

# Start main application (in separate terminal)
npm run dev
```

### 2. Testing Voice Search

```bash
# Test search server directly
curl -X POST http://localhost:3001/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI tools for restaurants"}'

# Test with conversation context
curl -X GET "http://localhost:3001/search?query=competitor%20analysis&conversationContext=dental%20practice%20owner"
```

### 3. Debugging Voice Integration

```typescript
// Enable verbose logging
const voiceAgent = new WebRTCVoiceAgent({
  // ... config
  verboseLogging: true
});

// Monitor function calls
voiceAgent.on('functionCall', (call) => {
  console.log('Function called:', call);
});

// Monitor search results
voiceAgent.on('searchCompleted', (result) => {
  console.log('Search result:', result);
});
```

## Advanced Features

### 1. Conversation Context Integration

The system maintains conversation context to enhance search relevance:

```typescript
// Conversation context is automatically included
private getConversationContext(): string {
  return this.conversationContext.slice(-5).join('\n');
}

// Search query includes context
const contextualQuery = `Context: ${this.getConversationContext()}\n\nSearch for: ${query}`;
```

### 2. Multi-Modal Response Handling

Search results can include various content types:

```typescript
interface SearchResult {
  success: boolean;
  response: string; // Natural language summary
  searchResults: Array<{
    title: string;
    url: string;
    snippet: string;
    source: string;
  }>;
  citations: Array<{
    type: 'url_citation';
    start_index: number;
    end_index: number;
    title: string;
    url: string;
  }>;
}
```

### 3. Custom Search Behavior

You can customize search behavior for specific domains:

```typescript
// Industry-specific search enhancement
private enhanceQueryForIndustry(query: string, industry: string): string {
  const industryKeywords = {
    'healthcare': ['patient', 'HIPAA', 'medical', 'clinic'],
    'retail': ['customer', 'inventory', 'POS', 'e-commerce'],
    'restaurant': ['menu', 'ordering', 'kitchen', 'delivery']
  };
  
  const keywords = industryKeywords[industry] || [];
  return `${query} ${keywords.join(' ')} 2025`;
}
```

This documentation provides a complete reference for implementing, configuring, and troubleshooting the voice agent web search integration. The system leverages the power of OpenAI's latest APIs to provide a seamless voice-to-search-to-voice experience with natural conversation flow and contextual awareness.