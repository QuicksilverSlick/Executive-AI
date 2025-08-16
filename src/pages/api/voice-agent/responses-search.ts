/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Web search endpoint using OpenAI Responses API with built-in web search tool
 * @version: 11.0.0 (Fixed tool configuration and response processing)
 * @author: engineer-agent
 * @reasoning:
 * - **Objective:** Fix Responses API to return actual web search results with citations
 * - **Strategy:** Correct tool type from 'web_search_preview' to 'web_search' and fix response parsing
 * - **Outcome:** Properly configured Responses API that extracts search results from citations
 */

import type { APIRoute } from 'astro';
import OpenAI from 'openai';

// --- Interfaces for type safety ---
interface ResponsesSearchRequest {
  query: string;
  conversationContext?: string;
}

interface ResponsesSearchResponse {
  success: boolean;
  response?: string;
  error?: string;
  searchResults?: SearchResult[];
  citations?: CitationAnnotation[];
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface ResponsesAPIResponse {
  id: string;
  object: 'response';
  created_at: number;
  model: string;
  output: ResponseOutputItem[];
  output_text: string;
}

interface ResponseOutputItem {
  id: string;
  type: 'web_search_call' | 'message';
  status?: string;
  query?: string;
  role?: 'assistant';
  content?: Array<{
    type: 'output_text' | 'text';
    text: string;
    annotations?: CitationAnnotation[];
  }>;
}

interface CitationAnnotation {
  type: 'url_citation';
  start_index: number;
  end_index: number;
  url: string;
  title: string;
}

// --- Main API Endpoints ---
export const POST: APIRoute = async ({ request }) => {
  console.log('\n===== SEARCH ENDPOINT [POST] REQUEST =====');
  try {
    const body = await request.json();
    const { query, conversationContext = '' } = body;

    console.log(`[Search API] Processing query: "${query}"`);

    if (!query) {
      return new Response(JSON.stringify({ success: false, error: 'Query parameter is required' }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Search API] ❌ OpenAI API key not configured.');
      return new Response(JSON.stringify({ success: false, error: 'API key not configured' }), { status: 500 });
    }

    const searchResponse = await performWebSearchWithResponsesAPI(query, conversationContext, apiKey);
    return new Response(JSON.stringify(searchResponse), { status: 200 });

  } catch (error) {
    console.error('[Search API] ❌ Error in POST handler:', error);
    return new Response(
      JSON.stringify({
        success: false,
        response: "I encountered a server error while processing the search request.",
        error: error instanceof Error ? error.message : 'An unknown server error occurred'
      }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  console.log('\n===== SEARCH ENDPOINT [GET] REQUEST =====');
  try {
    const query = url.searchParams.get('query');
    const conversationContext = url.searchParams.get('conversationContext') || '';

    console.log(`[Search API] Successfully parsed query from URL: "${query}"`);

    if (!query) {
      return new Response(JSON.stringify({ success: false, error: 'Query parameter is required' }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Search API] ❌ OpenAI API key not configured.');
      return new Response(JSON.stringify({ success: false, error: 'API key not configured' }), { status: 500 });
    }

    const searchResponse = await performWebSearchWithResponsesAPI(query, conversationContext, apiKey);
    return new Response(JSON.stringify(searchResponse), { status: 200 });

  } catch (error) {
    console.error('[Search API] ❌ Error in GET handler:', error);
    return new Response(
      JSON.stringify({
        success: false,
        response: "I encountered a server error while processing the search request.",
        error: error instanceof Error ? error.message : 'An unknown server error occurred'
      }),
      { status: 500 }
    );
  }
};

// --- Web Search Function ---
async function performWebSearchWithResponsesAPI(query: string, conversationContext: string = '', apiKey: string): Promise<ResponsesSearchResponse> {
  try {
    console.log(`[Search API] 🚀 Performing web search for query: "${query}"`);
    
    // Build the search context including conversation history if available
    const searchContext = conversationContext 
      ? `Context: ${conversationContext}\n\nSearch for: ${query}`
      : query;
    
    const inputMessages = [{ 
      role: 'user', 
      content: [{ 
        type: 'input_text', 
        text: searchContext
      }] 
    }];
    
    const requestBody = {
      model: 'gpt-4o',
      input: inputMessages,
      tools: [{ type: 'web_search' }],
      tool_choice: 'auto'
    };

    console.log('[Search API] 📤 Sending request to OpenAI Responses API...');
    console.log('[Search API] Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`[Search API] 📥 OpenAI response status: ${response.status}`);
    const responseText = await response.text();
    console.log('[Search API] Raw response:', responseText);

    if (!response.ok) {
      console.error('[Search API] ❌ OpenAI API returned an error:', responseText);
      return { 
        success: false, 
        error: `API failed with status ${response.status}.`, 
        response: `I'm sorry, the search service returned an error. Please try again.` 
      };
    }
    
    const responseData: ResponsesAPIResponse = JSON.parse(responseText);
    console.log('[Search API] Parsed response data:', JSON.stringify(responseData, null, 2));
    
    // Extract search results and citations from the response
    const searchResults: SearchResult[] = [];
    const citations: CitationAnnotation[] = [];
    
    // Process output items to extract search results
    if (responseData.output && Array.isArray(responseData.output)) {
      for (const outputItem of responseData.output) {
        console.log('[Search API] Processing output item:', outputItem.type);
        
        // Check for web search results in the output
        if (outputItem.type === 'web_search_call') {
          console.log('[Search API] Found web search call:', outputItem.status);
          // Web search call doesn't contain results directly, results are in message content
        }
        
        // Extract citations and content from assistant message
        if (outputItem.type === 'message' && outputItem.role === 'assistant' && outputItem.content) {
          for (const contentItem of outputItem.content) {
            console.log('[Search API] Processing content item:', contentItem.type);
            
            // Process annotations/citations
            if (contentItem.annotations && Array.isArray(contentItem.annotations)) {
              console.log('[Search API] Found', contentItem.annotations.length, 'annotations');
              citations.push(...contentItem.annotations);
              
              // Create search results from citations
              for (const annotation of contentItem.annotations) {
                if (annotation.type === 'url_citation') {
                  try {
                    const hostname = new URL(annotation.url).hostname;
                    searchResults.push({
                      title: annotation.title || 'Untitled',
                      url: annotation.url,
                      snippet: contentItem.text.substring(
                        Math.max(0, annotation.start_index - 50),
                        Math.min(contentItem.text.length, annotation.end_index + 50)
                      ).trim(),
                      source: hostname
                    });
                  } catch (urlError) {
                    console.warn('[Search API] Invalid URL in citation:', annotation.url);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    const finalResponseText = responseData.output_text || 'The search was successful, but I could not generate a summary.';
    
    console.log(`[Search API] ✅ Search completed with ${searchResults.length} results and ${citations.length} citations`);
    
    return { 
      success: true, 
      response: finalResponseText, 
      searchResults, 
      citations 
    };

  } catch (error) {
    console.error('[Search API] ❌ Error during web search execution:', error);
    return await fallbackToKnowledgeResponse(query, apiKey);
  }
}

// --- Fallback Function (No changes needed here, included for completeness) ---
async function fallbackToKnowledgeResponse(query: string, apiKey: string): Promise<ResponsesSearchResponse> {
  console.log(`[Search API] ⚠️ Falling back to knowledge-based response for: "${query}"`);
  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: `Web search failed. Based on your existing knowledge, what can you tell me about "${query}"?` }
      ],
    });
    const message = completion.choices[0]?.message?.content;
    return { success: true, response: message || `I couldn't perform the search for that topic.` };
  } catch (fallbackError) {
    console.error('[Search API] ❌ Fallback response also failed:', fallbackError);
    return { success: false, error: 'Fallback failed', response: `I am having trouble accessing all my information sources at the moment. Please try again shortly.` };
  }
}