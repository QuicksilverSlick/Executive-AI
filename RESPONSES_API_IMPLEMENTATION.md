<!--
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Complete implementation guide for OpenAI Responses API web search functionality
 * @version: 1.0.0
 * @init-author: doc-agent
 * @init-cc-sessionId: cc-doc-20250805-001
 * @init-timestamp: 2025-08-05T22:30:00Z
 * @reasoning:
 * - **Objective:** Document the OpenAI Responses API implementation for web search
 * - **Strategy:** Comprehensive guide covering API differences, implementation details, and troubleshooting
 * - **Outcome:** Clear documentation for developers implementing real web search functionality
 -->

# OpenAI Responses API Implementation Guide

## Overview

This guide documents the implementation of real web search functionality using OpenAI's Responses API. This implementation provides actual web search capabilities through OpenAI's `web_search_preview` tool, replacing mock search implementations with live web results.

## What is the OpenAI Responses API?

The OpenAI Responses API (`/v1/responses`) is a specialized endpoint that provides enhanced capabilities beyond the standard Chat Completions API, including:

- **Built-in web search**: Direct access to current web information through the `web_search_preview` tool
- **Structured responses**: Responses include distinct items for different types of content (search calls, messages)
- **Voice-optimized models**: Access to models like `gpt-4.1-mini` optimized for lower latency
- **Citation handling**: Automatic inclusion of source URLs and content snippets

## Key Differences from Chat Completions API

### Request Format
**Chat Completions API:**
```typescript
{
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'Search for...' }
  ],
  tools: [{ type: 'function', function: { ... } }]
}
```

**Responses API:**
```typescript
{
  model: 'gpt-4.1-mini',
  input: 'Search for information about...',  // String, not array
  tools: [{ type: 'web_search_preview' }],   // Built-in tool
  instructions: 'System instructions...'
}
```

### Response Structure
**Chat Completions API:**
```typescript
{
  choices: [
    { message: { role: 'assistant', content: '...' } }
  ]
}
```

**Responses API:**
```typescript
{
  id: 'resp_...',
  items: [
    {
      type: 'web_search_call',
      web_search_call: {
        query: 'search query',
        results: [{ url: '...', title: '...', content: '...' }]
      }
    },
    {
      type: 'message',
      message: { role: 'assistant', content: 'final response' }
    }
  ]
}
```

## Implementation Details

### Core Implementation
The main search functionality is implemented in `/src/pages/api/voice-agent/responses-search.ts`:

```typescript
async function performWebSearchWithResponsesAPI(
  query: string, 
  conversationContext: string = '', 
  apiKey: string
): Promise<ResponsesSearchResponse> {
  // Use OpenAI Responses API with web_search_preview tool
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini', // Voice-optimized model
      input: input, // String input, not messages array
      tools: [{
        type: 'web_search_preview'
      }],
      instructions: `You are a helpful AI assistant for Executive AI Training...`,
      temperature: 0.7,
      max_tokens: 800
    })
  });

  const responseData: ResponsesAPIResponse = await response.json();

  // Process the response items
  const searchResults: SearchResult[] = [];
  let finalResponse = '';

  for (const item of responseData.items) {
    if (item.type === 'web_search_call' && item.web_search_call) {
      // Extract search results
      for (const result of item.web_search_call.results) {
        searchResults.push({
          title: result.title,
          url: result.url,
          snippet: result.content.substring(0, 200) + '...',
          source: new URL(result.url).hostname
        });
      }
    } else if (item.type === 'message' && item.message) {
      finalResponse += item.message.content;
    }
  }

  return {
    success: true,
    response: finalResponse,
    searchResults: searchResults
  };
}
```

### TypeScript Interfaces

```typescript
interface ResponsesAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  items: ResponseItem[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ResponseItem {
  type: 'web_search_call' | 'message';
  web_search_call?: {
    query: string;
    results: WebSearchResult[];
  };
  message?: {
    role: 'assistant';
    content: string;
  };
}

interface WebSearchResult {
  url: string;
  title: string;
  content: string;
}
```

### Error Handling and Fallbacks

The implementation includes robust error handling:

1. **API Key Validation**: Checks for `OPENAI_API_KEY` environment variable
2. **Response Validation**: Validates API responses and handles HTTP errors
3. **Graceful Fallback**: Falls back to knowledge-based responses when search fails
4. **User-Friendly Errors**: Returns helpful error messages instead of technical failures

```typescript
// Fallback to knowledge-based response when search fails
async function fallbackToKnowledgeResponse(query: string, apiKey: string): Promise<ResponsesSearchResponse> {
  const openai = new OpenAI({ apiKey });
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AI assistant for Executive AI Training...'
      },
      {
        role: 'user',
        content: `I was trying to search for information about "${query}". While real-time search isn't available right now, can you provide relevant information...`
      }
    ],
    temperature: 0.7,
    max_tokens: 600
  });

  return {
    success: true,
    response: completion.choices[0]?.message?.content || fallbackMessage,
    searchResults: []
  };
}
```

## Response Structure and Citation Handling

The Responses API returns structured data that includes:

### Web Search Calls
```typescript
{
  type: 'web_search_call',
  web_search_call: {
    query: 'Drip City Coffee Oakland',
    results: [
      {
        url: 'https://dripcitycoffee.com',
        title: 'Drip City Coffee - Oakland Location',
        content: 'Full content from the web page...'
      }
    ]
  }
}
```

### Assistant Messages
```typescript
{
  type: 'message',
  message: {
    role: 'assistant',
    content: 'Based on my search, Drip City Coffee in Oakland is located at...'
  }
}
```

The implementation processes these items to extract:
- **Search Results**: Formatted with title, URL, snippet, and source domain
- **Final Response**: Natural language summary incorporating search findings
- **Citations**: Automatic inclusion of source URLs and references

## Testing Instructions

### Local Testing Endpoint
Access the test interface at: `http://localhost:4321/api/test-search`

Features:
- Interactive web interface for testing queries
- Real-time results display
- Raw JSON response inspection
- Pre-built test queries

### Test Queries
Try these example searches:
- `Drip City Coffee Oakland` - Local business search
- `Home Depot Tulsa Oklahoma` - Chain store location
- `SRI Energy company` - Company information
- `AI training best practices 2025` - Current information search

### API Testing
Direct API calls:
```bash
curl -X POST http://localhost:4321/api/voice-agent/responses-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Drip City Coffee Oakland"}'
```

Expected response format:
```json
{
  "success": true,
  "response": "Based on my search, Drip City Coffee in Oakland...",
  "searchResults": [
    {
      "title": "Drip City Coffee - Oakland Location",
      "url": "https://dripcitycoffee.com",
      "snippet": "Drip City Coffee serves premium coffee...",
      "source": "dripcitycoffee.com"
    }
  ]
}
```

## Integration with Voice Agent

The search endpoint integrates with the voice agent system:

1. **Voice Input**: User speaks a search query
2. **WebRTC Processing**: Voice is converted to text
3. **Search Trigger**: Voice agent detects search intent and calls the API
4. **Web Search**: Responses API performs real web search
5. **Response Generation**: AI incorporates search results into natural response
6. **Voice Output**: Response is converted to speech and played to user

### Voice Agent Integration Code
```typescript
// In voice agent handler
if (userIntent === 'search') {
  const searchResponse = await fetch('/api/voice-agent/responses-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query: userQuery,
      conversationContext: previousMessages 
    })
  });
  
  const { response } = await searchResponse.json();
  speakResponse(response);
}
```

## Environment Configuration

Required environment variables:
```bash
OPENAI_API_KEY=sk-...  # Your OpenAI API key with Responses API access
```

**Note**: The Responses API requires special access. Contact OpenAI if you don't have access to this endpoint.

## Performance Considerations

### Model Selection
- **gpt-4.1-mini**: Voice-optimized for lower latency
- **gpt-4o**: Higher quality but slower responses
- **Temperature**: 0.7 for balanced creativity and accuracy
- **Max Tokens**: 800 to ensure comprehensive responses

### Caching Strategy
Consider implementing caching for frequently searched queries:
```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const searchCache = new Map();

if (searchCache.has(query)) {
  const cached = searchCache.get(query);
  if (Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
}
```

## Troubleshooting Guide

### Common Issues

#### 1. "OpenAI API key not configured"
**Cause**: Missing or invalid `OPENAI_API_KEY` environment variable
**Solution**: Set the environment variable with a valid OpenAI API key

#### 2. "Unexpected end of JSON input"
**Cause**: API endpoint returning non-JSON response (usually HTML error page)
**Solution**: Check API key validity and endpoint availability

#### 3. "Access denied to Responses API"
**Cause**: API key doesn't have access to the Responses API
**Solution**: Contact OpenAI support to request Responses API access

#### 4. Empty search results
**Cause**: Search query too vague or no relevant results found
**Solution**: Try more specific queries or check the fallback response

#### 5. Rate limiting errors
**Cause**: Too many API requests in short time period
**Solution**: Implement request throttling and retry logic

### Debug Steps

1. **Check API Key**: Verify `OPENAI_API_KEY` is set and valid
2. **Test Endpoint**: Use the `/api/test-search` endpoint to verify functionality
3. **Inspect Responses**: Check browser network tab for actual API responses
4. **Review Logs**: Check console output for detailed error messages
5. **Verify Access**: Ensure your OpenAI account has Responses API access

### Error Response Formats

**API Error:**
```json
{
  "success": false,
  "error": "OpenAI API key not configured"
}
```

**Graceful Fallback:**
```json
{
  "success": true,
  "response": "I understand you're looking for information about...",
  "error": "Search temporarily unavailable",
  "searchResults": []
}
```

## Migration from Mock Implementation

If migrating from a mock implementation:

1. **Update Endpoint**: Change from `/v1/chat/completions` to `/v1/responses`
2. **Update Request Format**: Use `input` string instead of `messages` array
3. **Update Tools**: Use `web_search_preview` instead of custom function
4. **Update Response Processing**: Handle `items` array with different types
5. **Update TypeScript Interfaces**: Match new response structure

## Security Considerations

1. **API Key Protection**: Store API key securely in environment variables
2. **Input Validation**: Validate and sanitize user queries
3. **Rate Limiting**: Implement request throttling to prevent abuse
4. **Error Handling**: Don't expose internal error details to users
5. **CORS**: Configure appropriate CORS headers for API endpoints

## Next Steps

### Enhancements
1. **Real-time Streaming**: Implement streaming responses for faster user experience
2. **Result Filtering**: Add content filtering for inappropriate results
3. **Search Personalization**: Customize search based on user preferences
4. **Analytics**: Track search patterns and success rates
5. **Multi-language Support**: Support searches in different languages

### Production Deployment
1. **Monitoring**: Set up API monitoring and alerting
2. **Logging**: Implement structured logging for troubleshooting
3. **Scaling**: Consider load balancing for high traffic
4. **Backup**: Implement fallback search providers
5. **Testing**: Set up automated integration tests

## Conclusion

The OpenAI Responses API provides a powerful solution for implementing real web search functionality in AI applications. This implementation offers:

- **Real web search** through OpenAI's built-in capabilities
- **Structured responses** with proper citation handling
- **Voice-optimized performance** with appropriate model selection
- **Robust error handling** with graceful fallbacks
- **Easy testing and debugging** through dedicated endpoints

The implementation successfully replaces mock search functionality with live web results, enabling the voice agent to provide current, accurate information to users while maintaining a natural conversational experience.

<!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: doc-agent
 * @cc-sessionId: cc-doc-20250805-001
 * @timestamp: 2025-08-05T22:30:00Z
 * @reasoning:
 * - **Objective:** Create comprehensive documentation for OpenAI Responses API implementation
 * - **Strategy:** Cover all aspects from API differences to troubleshooting
 * - **Outcome:** Complete implementation guide for developers
 -->