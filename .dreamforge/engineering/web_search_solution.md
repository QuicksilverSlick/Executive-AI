# Web Search Solution for Voice Agent
## Engineering Design Document

<!--
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Complete engineering solution for web search integration with OpenAI Realtime API voice agent
 * @version: 1.0.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250805-web-search
 * @init-timestamp: 2025-08-05T23:00:00Z
 * @reasoning:
 * - **Objective:** Design complete web search solution using Responses API with Realtime API voice agent
 * - **Strategy:** Fix existing implementation, add function definition, design event flow
 * - **Outcome:** Working web search for voice conversations with proper citation delivery
 -->

## Executive Summary

This document provides a complete engineering solution for integrating web search capabilities into the voice agent using OpenAI's Responses API. The solution addresses three key components:

1. **Fixed Responses API Implementation** - Correcting the existing endpoint with proper output array handling
2. **Realtime API Function Definition** - Adding web_search function for voice model calls
3. **Event Flow Integration** - Handling function calls and delivering results back to conversation

## Problem Analysis

### Current Issues
- The existing `/api/voice-agent/responses-search.ts` has incorrect response structure handling
- Missing function call event handling in the WebRTC implementation
- No mechanism to deliver search results back to the voice conversation
- Incorrect API structure assumptions (uses `items` instead of `output`)

### Requirements
- Real web search using OpenAI Responses API with `web_search` tool
- Function definition for voice agent to call web search
- Event handling for `response.function_call_arguments.*` events
- Delivery mechanism to add search results back to conversation

## Solution Architecture

### Component Overview
```
Voice Agent (Realtime API) 
    ↓ function call
Web Search Function (Function Definition)
    ↓ HTTP request  
Responses API Endpoint (Fixed Implementation)
    ↓ response with results
Function Call Handler (Event Processing)
    ↓ formatted results
Voice Conversation (Result Delivery)
```

## 1. Fixed Responses API Implementation

### Current Issues Fixed
The existing implementation has several critical errors:

1. **Wrong response structure**: Uses `items` instead of `output` array
2. **Incorrect model**: Uses `gpt-4.1-mini` (doesn't exist) instead of `gpt-4o`
3. **Wrong input format**: Should use array format, not string
4. **Improper tool specification**: Should use `web_search` not `web_search_preview`

### Corrected Implementation

```typescript
/**
 * Fixed OpenAI Responses API implementation
 */
async function performWebSearchWithResponsesAPI(
  query: string, 
  conversationContext: string = '', 
  apiKey: string
): Promise<ResponsesSearchResponse> {
  try {
    console.log('[Search API] Using OpenAI Responses API for query:', query);

    // Construct input with conversation context
    let searchPrompt = `Search for current information: ${query}`;
    if (conversationContext) {
      searchPrompt = `Context: ${conversationContext}\n\nSearch for: ${query}`;
    }

    // FIXED: Use correct Responses API structure
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // FIXED: Use correct model
        input: [{ // FIXED: Use array format, not string
          role: 'user',
          content: [{
            type: 'input_text',
            text: searchPrompt
          }]
        }],
        tools: [{ // FIXED: Use web_search, not web_search_preview
          type: 'web_search'
        }],
        instructions: `You are a helpful AI assistant for Executive AI Training. 
        Search for current, accurate information and provide insights relevant to business leaders and AI transformation.`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Search API] Responses API error:', response.status, errorText);
      return await fallbackToKnowledgeResponse(query, apiKey);
    }

    // FIXED: Handle correct response structure
    const responseData = await response.json();
    console.log('[Search API] Responses API succeeded:', responseData.id);

    // Process the output array (not items array)
    const searchResults: SearchResult[] = [];
    let finalResponse = '';
    let citations: any[] = [];

    // FIXED: Process output array with proper structure
    for (const item of responseData.output || []) {
      if (item.type === 'web_search_call' && item.web_search) {
        console.log('[Search API] Found web search call:', item.web_search.query);
        
        // Extract search results
        for (const result of item.web_search.results || []) {
          searchResults.push({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            source: new URL(result.url).hostname
          });
        }
      } else if (item.type === 'message' && item.content) {
        // FIXED: Handle message content properly
        for (const content of item.content) {
          if (content.type === 'output_text') {
            finalResponse += content.text;
            // Extract citations from annotations
            if (content.annotations) {
              citations.push(...content.annotations);
            }
          }
        }
      }
    }

    console.log('[Search API] Found', searchResults.length, 'search results');
    console.log('[Search API] Found', citations.length, 'citations');

    return {
      success: true,
      response: finalResponse || 'Search completed with results.',
      searchResults: searchResults,
      citations: citations // Include citations for voice delivery
    };

  } catch (error) {
    console.error('[Search API] Responses API failed:', error);
    return await fallbackToKnowledgeResponse(query, apiKey);
  }
}
```

### Updated TypeScript Interfaces

```typescript
interface ResponsesSearchResponse {
  success: boolean;
  response?: string;
  error?: string;
  searchResults?: SearchResult[];
  citations?: CitationAnnotation[]; // Added citations
}

interface CitationAnnotation {
  index: number;
  type: 'url_citation';
  title: string;
  url: string;
}

// FIXED: Correct Responses API structure
interface ResponsesAPIResponse {
  id: string;
  object: string;
  created_at: number;
  model: string;
  output: ResponseOutputItem[]; // FIXED: output not items
  output_text: string;
}

interface ResponseOutputItem {
  id: string;
  type: 'web_search_call' | 'message';
  status?: string;
  web_search?: {
    query: string;
    results: WebSearchResult[];
  };
  role?: 'assistant';
  content?: Array<{
    type: 'output_text';
    text: string;
    annotations?: CitationAnnotation[];
  }>;
}
```

## 2. Realtime API Function Definition

The voice agent needs a function definition to enable web search calls. This should be added to the session configuration:

### Function Definition for Session Config

```typescript
// Add to connection.ts setupDataChannelHandlers method
const sessionUpdate = {
  type: 'session.update',
  session: {
    // ... existing config
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
              description: 'The search query - be specific and include relevant keywords'
            },
            context: {
              type: 'string',
              description: 'Additional context from the conversation to help with search relevance',
              optional: true
            }
          },
          required: ['query']
        }
      }
      // ... other existing functions
    ],
    tool_choice: 'auto'
  }
};
```

## 3. Event Flow Integration

### Function Call Event Handling

The WebRTC implementation needs to handle function call events. Currently, it has placeholders but needs implementation:

```typescript
// In main.ts handleRealtimeEvent method - ADD IMPLEMENTATION

case 'response.function_call_arguments.delta':
  this.handleFunctionCallDelta(event);
  break;
  
case 'response.function_call_arguments.done':
  this.handleFunctionCallDone(event);
  break;

// ADD: New function call events
case 'response.output_item.added':
  // Handle when a function call item is added to the conversation
  if (event.item?.type === 'function_call') {
    this.handleFunctionCallStart(event);
  }
  break;

case 'response.output_item.done':
  // Handle when a function call completes
  if (event.item?.type === 'function_call') {
    await this.executeFunctionCall(event.item);
  }
  break;
```

### Function Call Handler Implementation

```typescript
/**
 * Handle function call execution
 */
private async executeFunctionCall(functionCallItem: any): Promise<void> {
  const { name, call_id, arguments: args } = functionCallItem;
  
  if (name === 'web_search') {
    try {
      console.log('[WebRTC Voice Agent] Executing web search function call:', args);
      
      // Parse arguments
      const { query, context } = JSON.parse(args);
      
      // Call the search API
      const searchResponse = await fetch('/api/voice-agent/responses-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          conversationContext: context || this.getConversationContext() 
        })
      });
      
      const searchData = await searchResponse.json();
      
      if (searchData.success) {
        // Format results for voice delivery
        const formattedResults = this.formatSearchResultsForVoice(searchData);
        
        // Send function call result back to conversation
        const resultEvent: RealtimeEvent = {
          event_id: `func_result_${++this.messageSequence}`,
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: call_id,
            output: JSON.stringify({
              success: true,
              summary: formattedResults.summary,
              sources: formattedResults.sources,
              searchResults: searchData.searchResults
            })
          }
        };
        
        this.connection.sendEvent(resultEvent);
        
        // Emit search results to UI
        this.emit('searchResults', {
          query,
          results: searchData.searchResults,
          citations: searchData.citations,
          summary: formattedResults.summary
        });
        
      } else {
        // Handle search failure
        this.sendFunctionCallError(call_id, searchData.error || 'Search failed');
      }
      
    } catch (error) {
      console.error('[WebRTC Voice Agent] Function call execution failed:', error);
      this.sendFunctionCallError(call_id, 'Search service temporarily unavailable');
    }
  }
}

/**
 * Format search results for natural voice delivery
 */
private formatSearchResultsForVoice(searchData: any): { summary: string; sources: string[] } {
  const { response, searchResults, citations } = searchData;
  
  // Create a natural summary
  let summary = response;
  
  // Add source information for voice mention
  const sources = searchResults?.slice(0, 3).map((result: any) => 
    `${result.title} from ${result.source}`
  ) || [];
  
  if (sources.length > 0) {
    summary += ` I found this information from sources including ${sources.join(', ')}.`;
  }
  
  return { summary, sources };
}

/**
 * Send function call error result
 */
private sendFunctionCallError(callId: string, errorMessage: string): void {
  const errorEvent: RealtimeEvent = {
    event_id: `func_error_${++this.messageSequence}`,
    type: 'conversation.item.create',
    item: {
      type: 'function_call_output',
      call_id: callId,
      output: JSON.stringify({
        success: false,
        error: errorMessage,
        fallback: "I'm having trouble accessing current search results, but I can help based on my training knowledge."
      })
    }
  };
  
  this.connection.sendEvent(errorEvent);
}

/**
 * Get conversation context for search
 */
private getConversationContext(): string {
  // Extract last few messages as context
  return this.conversationContext.slice(-3).join(' ');
}
```

## 4. UI Integration

### Search Results Display

Add search results handling to the voice assistant hook:

```typescript
// In useWebRTCVoiceAssistant.ts

// Add state for search results
const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
const [isSearching, setIsSearching] = useState(false);

// Add event listener in setupEventHandlers
voiceAgent.on('searchResults', (data) => {
  setSearchResults(data.results || []);
  setIsSearching(false);
  
  // Add search results message to chat
  const searchMessage: VoiceMessage = {
    id: generateId(),
    role: 'assistant',
    content: data.summary,
    timestamp: new Date(),
    type: 'search_results',
    searchResults: data.results,
    citations: data.citations
  };
  
  setMessages(prev => [...prev, searchMessage]);
});

// Listen for function call start to show searching state
voiceAgent.on('functionCallStart', (data) => {
  if (data.functionName === 'web_search') {
    setIsSearching(true);
    setStatusText('Searching the web...');
  }
});
```

### Search Results Component

```tsx
// SearchResultsDisplay.tsx
interface SearchResultsDisplayProps {
  results: SearchResult[];
  citations?: CitationAnnotation[];
  isVisible: boolean;
}

export const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
  results,
  citations,
  isVisible
}) => {
  if (!isVisible || !results?.length) return null;

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <SearchIcon className="search-icon" />
        <span>Web Search Results</span>
      </div>
      
      <div className="search-results-list">
        {results.slice(0, 3).map((result, index) => (
          <div key={index} className="search-result-item">
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="search-result-link"
            >
              <div className="search-result-title">{result.title}</div>
              <div className="search-result-source">{result.source}</div>
              <div className="search-result-snippet">{result.snippet}</div>
            </a>
          </div>
        ))}
      </div>
      
      {citations && citations.length > 0 && (
        <div className="citations-section">
          <div className="citations-header">Sources:</div>
          {citations.map((citation, index) => (
            <a 
              key={index}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-link"
            >
              [{citation.index}] {citation.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 5. Implementation Steps

### Phase 1: Fix Responses API
1. ✅ Update `/src/pages/api/voice-agent/responses-search.ts` with corrected implementation
2. ✅ Fix TypeScript interfaces for proper output array handling
3. ✅ Test the endpoint independently to ensure it returns proper search results

### Phase 2: Add Function Definition
1. Update session configuration in `connection.ts` to include web_search function
2. Ensure function definition matches the API endpoint expectations
3. Test function call availability in voice session

### Phase 3: Implement Event Handling
1. Add function call event handlers to `main.ts`
2. Implement function execution logic with API calls
3. Add result formatting for voice delivery
4. Test end-to-end function call flow

### Phase 4: UI Integration
1. Add search results state to voice assistant hook
2. Create search results display component
3. Add searching status indicators
4. Test complete user experience

## 6. Testing Strategy

### Unit Tests
- Test Responses API endpoint with various queries
- Test function call event handling
- Test result formatting functions

### Integration Tests
- Test complete voice search flow
- Test error handling and fallbacks
- Test UI updates during search process

### User Acceptance Tests
- Test natural voice search requests
- Verify search results are delivered naturally in conversation
- Test citation and source handling

## 7. Error Handling

### Search API Failures
- Graceful fallback to knowledge-based responses
- Clear error messages for users
- Retry logic for transient failures

### Function Call Failures
- Error result delivery to conversation
- Fallback responses when search unavailable
- Logging for debugging and monitoring

### Network Issues
- Timeout handling for search requests
- Offline detection and appropriate messaging
- Quality degradation strategies

## 8. Performance Considerations

### Latency Optimization
- Parallel search execution where possible
- Result caching for repeated queries
- Aggressive timeouts to maintain conversation flow

### Rate Limiting
- Implement search request throttling
- Queue management for multiple simultaneous requests
- Backoff strategies for API limits

### Memory Management
- Limit search result storage
- Clear old search data periodically
- Efficient state updates

## 9. Security Considerations

### Input Validation
- Sanitize search queries
- Validate function call arguments
- Rate limit search requests per session

### Content Filtering
- Filter inappropriate search results
- Validate URL safety before displaying
- Content moderation for search summaries

### API Security
- Secure API key management
- Request signing and validation
- CORS and origin validation

## Conclusion

This engineering solution provides a complete implementation for web search integration with the voice agent. The key improvements include:

1. **Fixed Responses API Implementation** - Proper handling of output array and correct API usage
2. **Complete Function Integration** - Function definition, event handling, and result delivery
3. **User Experience** - Natural voice search with visual results and citations
4. **Error Handling** - Graceful fallbacks and error recovery
5. **Performance** - Optimized for low latency and good conversation flow

The solution maintains the conversational nature of the voice agent while adding powerful web search capabilities that provide current, accurate information with proper source attribution.

<!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: engineer-agent
 * @cc-sessionId: cc-eng-20250805-web-search
 * @timestamp: 2025-08-05T23:00:00Z
 * @reasoning:
 * - **Objective:** Complete engineering design for web search integration with voice agent
 * - **Strategy:** Fix existing API, add function definition, design event flow, implement UI integration
 * - **Outcome:** Production-ready solution with proper error handling and user experience
 */
-->