# OpenAI Realtime API Native Function Calling Implementation

## Overview
This implementation replaces the previous manual search detection system with OpenAI's native function calling mechanism for web search functionality in the voice agent.

## Changes Made

### 1. Updated Session Configuration (`src/features/voice-agent/types/index.ts`)

**Before:**
```typescript
tools: [],
tool_choice: 'none',
instructions: '...Always respond naturally to what the user says.'
```

**After:**
```typescript
tools: [
  {
    type: 'function',
    name: 'web_search',
    description: 'Search the web for current information about businesses, locations, news, or any topic. Use this when the user asks you to search for something or needs current information.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to look up'
        }
      },
      required: ['query']
    }
  }
],
tool_choice: 'auto',
instructions: '...When the user asks you to search for something or needs current information about businesses, locations, news, or any topic, use the web_search function to provide accurate, up-to-date information.'
```

### 2. Added Function Call Event Handlers (`src/lib/voice-agent/webrtc/main.ts`)

**New Methods Added:**
- `handleFunctionCallDelta()` - Processes streaming function call arguments
- `handleFunctionCallDone()` - Executes completed function calls
- `executeWebSearch()` - Handles web_search function execution
- `sendFunctionCallResult()` - Sends results back to OpenAI
- `sendFunctionCallError()` - Sends error responses

**Event Handler Updates:**
```typescript
case 'response.function_call_arguments.delta':
  this.handleFunctionCallDelta(event);
  break;
  
case 'response.function_call_arguments.done':
  this.handleFunctionCallDone(event);
  break;
```

### 3. Removed Manual Search Detection

**Removed Methods:**
- `isSearchRequest()` - Manual pattern matching
- `handleSearchRequest()` - Manual search handling  
- `extractSearchQuery()` - Query extraction logic

**Cleaned Up:**
- Removed manual search detection from `sendMessage()`
- Removed manual search detection from `handleUserTranscriptCompleted()`

### 4. Updated Connection Configuration (`src/lib/voice-agent/webrtc/connection.ts`)

Updated the fallback session configuration to include the web_search tool definition, ensuring consistency across all initialization paths.

## Function Call Flow

1. **User Input:** "Search for Drip City Coffee in Oakland"
2. **OpenAI Analysis:** Recognizes this as a search request
3. **Function Call Triggered:** OpenAI sends `response.function_call_arguments.done` event:
   ```json
   {
     "type": "response.function_call_arguments.done",
     "call_id": "call_abc123",
     "name": "web_search",
     "arguments": "{\"query\": \"Drip City Coffee in Oakland\"}"
   }
   ```
4. **Voice Agent Processing:** `handleFunctionCallDone()` executes `executeWebSearch()`
5. **API Call:** Voice agent calls existing `/api/voice-agent/responses-search` endpoint
6. **Result Returned:** Voice agent sends function result back to OpenAI:
   ```json
   {
     "type": "conversation.item.create",
     "item": {
       "type": "function_call_output",
       "call_id": "call_abc123",
       "output": "{\"success\": true, \"result\": \"Based on current information...\"}"
     }
   }
   ```
7. **Natural Response:** OpenAI incorporates the search results into a natural conversational response

## Testing

### Test Queries
- "Search for Drip City Coffee in Oakland"
- "Look up information about Home Depot in Tulsa"
- "Find SRI Energy company details"
- "What is the latest news about AI training?"

### Expected Behavior
- Voice agent should no longer say "I can't perform live searches"
- Function calls should be processed automatically by OpenAI
- Search results should be naturally integrated into responses
- No manual pattern matching or conflicts

## Error Handling

The implementation includes robust error handling:
- **API Failures:** Graceful fallback messages
- **Parsing Errors:** Invalid function arguments handling
- **Network Issues:** Timeout and retry logic
- **Unknown Functions:** Error response for unsupported function names

## Backward Compatibility

- Existing search API endpoint (`/api/voice-agent/responses-search`) is preserved
- All non-search functionality remains unchanged
- Session persistence and other features are unaffected

## Key Benefits

1. **Native Integration:** Uses OpenAI's intended function calling mechanism
2. **Cleaner Code:** Eliminates manual pattern matching and detection logic
3. **Better Reliability:** Reduces conflicts and timing issues
4. **Natural Flow:** OpenAI handles when and how to call functions
5. **Scalability:** Easy to add more functions in the future

## Files Modified

- `src/features/voice-agent/types/index.ts` - Updated session configuration
- `src/lib/voice-agent/webrtc/main.ts` - Added function call handlers, removed manual detection
- `src/lib/voice-agent/webrtc/connection.ts` - Updated fallback configuration

## Testing Script

Run `node test-function-calling.js` to validate the implementation structure.

---

**Implementation Status:** ✅ Complete and ready for testing
**Next Steps:** Test with live voice interactions using search queries