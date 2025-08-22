import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load environment variables - prioritize .env.local for security
if (existsSync('.env.local')) {
  console.log('[Search Server] Loading environment from .env.local');
  dotenv.config({ path: '.env.local' });
} else if (existsSync('.env')) {
  console.log('[Search Server] Loading environment from .env');
  dotenv.config({ path: '.env' });
} else {
  console.log('[Search Server] No environment file found');
}

const app = express();
const port = 3001; // Different port from Astro

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// GET endpoint for search (used by voice agent)
app.get('/search', async (req, res) => {
  console.log('\n===== STANDALONE SEARCH SERVER - GET REQUEST =====');
  console.log('[Search Server] Query params:', req.query);
  
  try {
    const query = req.query.query;
    const conversationContext = req.query.conversationContext || '';
    
    console.log(`[Search Server] Received query: "${query}"`);
    console.log(`[Search Server] Context: "${conversationContext}"`);

    if (!query) {
      console.log('[Search Server] ❌ No query parameter provided');
      return res.status(400).json({ 
        success: false, 
        error: 'Query parameter is required' 
      });
    }

    // Call the POST endpoint internally
    const result = await performWebSearch(query, conversationContext);
    res.json(result);
    
  } catch (error) {
    console.error('[Search Server] ❌ Error in GET handler:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST endpoint for search (alternative)
app.post('/search', async (req, res) => {
  console.log('\n===== STANDALONE SEARCH SERVER - POST REQUEST =====');
  console.log('[Search Server] Body:', req.body);
  
  try {
    const { query, conversationContext = '' } = req.body;
    
    console.log(`[Search Server] Received query: "${query}"`);
    console.log(`[Search Server] Context: "${conversationContext}"`);

    if (!query) {
      console.log('[Search Server] ❌ No query in body');
      return res.status(400).json({ 
        success: false, 
        error: 'Query parameter is required' 
      });
    }

    const result = await performWebSearch(query, conversationContext);
    res.json(result);
    
  } catch (error) {
    console.error('[Search Server] ❌ Error in POST handler:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Core search function using OpenAI Responses API
async function performWebSearch(query, conversationContext) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('[Search Server] ❌ OpenAI API key not configured');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('OPENAI')));
    throw new Error('OpenAI API key not configured');
  }

  console.log('[Search Server] ✅ API key found, length:', apiKey.length);
  
  // Build the search prompt
  let searchPrompt = query;
  if (conversationContext) {
    searchPrompt = `Context: ${conversationContext}\n\nSearch for: ${query}`;
  }

  // OpenAI Responses API request
  const requestBody = {
    model: 'gpt-4o',
    input: `You are a helpful AI assistant. Search for current information and provide accurate, detailed results with sources when available.\n\n${searchPrompt}`,
    tools: [{
      type: 'web_search',
      search_context_size: 'medium'
    }],
    tool_choice: { type: 'web_search' }
  };

  console.log('[Search Server] 📤 Sending to OpenAI Responses API...');
  console.log('[Search Server] Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('[Search Server] 📥 Response status:', response.status);
    console.log('[Search Server] 📥 Response headers:', response.headers.raw());

    const responseText = await response.text();
    console.log('[Search Server] 📥 Raw response (first 500 chars):', responseText.substring(0, 500));

    if (!response.ok) {
      console.error('[Search Server] ❌ OpenAI API error:', responseText);
      
      // Try to parse error for better message
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message) {
          throw new Error(`OpenAI API: ${errorData.error.message}`);
        }
      } catch (e) {
        // Ignore parse error, use raw text
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${responseText.substring(0, 200)}`);
    }

    // Parse the response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('[Search Server] ✅ Successfully parsed response');
    } catch (parseError) {
      console.error('[Search Server] ❌ Failed to parse response:', parseError);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Extract results from the response
    let finalResponse = '';
    const searchResults = [];
    const citations = [];

    // Check for direct output_text
    if (responseData.output_text) {
      finalResponse = responseData.output_text;
      console.log('[Search Server] Found output_text');
    }

    // Process output array if present
    if (responseData.output && Array.isArray(responseData.output)) {
      console.log('[Search Server] Processing output array with', responseData.output.length, 'items');
      
      for (const item of responseData.output) {
        if (item.type === 'message' && item.content) {
          for (const content of item.content) {
            if (content.type === 'text' || content.type === 'output_text') {
              if (!finalResponse) {
                finalResponse = content.text;
              }
              
              // Extract citations from annotations
              if (content.annotations) {
                for (const annotation of content.annotations) {
                  if (annotation.type === 'url_citation') {
                    citations.push(annotation);
                    const snippet = content.text.substring(
                      annotation.start_index, 
                      annotation.end_index
                    );
                    searchResults.push({
                      title: annotation.title,
                      url: annotation.url,
                      snippet: snippet,
                      source: new URL(annotation.url).hostname
                    });
                  }
                }
              }
            }
          }
        } else if (item.type === 'web_search_call') {
          console.log('[Search Server] Found web search call:', item.query || 'unknown');
        }
      }
    }

    // If still no response, check choices array (fallback)
    if (!finalResponse && responseData.choices && responseData.choices[0]) {
      finalResponse = responseData.choices[0].message?.content || '';
      console.log('[Search Server] Using fallback from choices array');
    }

    console.log('[Search Server] ✅ Search completed successfully');
    console.log('[Search Server] Found', searchResults.length, 'search results');
    console.log('[Search Server] Found', citations.length, 'citations');

    return {
      success: true,
      response: finalResponse || 'Search completed successfully.',
      searchResults: searchResults,
      citations: citations
    };

  } catch (error) {
    console.error('[Search Server] ❌ Error calling OpenAI:', error);
    
    // Fallback response
    return {
      success: true,
      response: `I understand you're looking for information about "${query}". While I'm having trouble accessing live search results at the moment, I can share what I know based on my training. The search service is temporarily unavailable, but I'm here to help with any questions you have.`,
      searchResults: [],
      error: error.message
    };
  }
}

// Start the server
app.listen(port, () => {
  console.log(`\n🚀 Standalone search server running on http://localhost:${port}`);
  console.log(`📍 Endpoints:`);
  console.log(`   GET  http://localhost:${port}/search?query=YOUR_QUERY`);
  console.log(`   POST http://localhost:${port}/search (JSON body with 'query')`);
  console.log(`   GET  http://localhost:${port}/health`);
  console.log(`\n✅ OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : '❌ NOT FOUND'}`);
  console.log(`\nWaiting for requests...\n`);
});