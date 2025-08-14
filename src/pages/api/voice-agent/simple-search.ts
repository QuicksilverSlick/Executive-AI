/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Simple web search endpoint using OpenAI Chat Completions with simulated search
 * @version: 1.0.0
 * @author: developer-agent
 */

import type { APIRoute } from 'astro';
import OpenAI from 'openai';

interface SearchRequest {
  query: string;
  conversationContext?: string;
}

interface SearchResponse {
  success: boolean;
  response?: string;
  error?: string;
}

// GET and POST handlers
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { query, conversationContext = '' } = body;
    
    console.log(`[Simple Search] Processing query: "${query}"`);
    
    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query parameter is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const searchResponse = await performSimpleSearch(query, conversationContext, apiKey);
    return new Response(
      JSON.stringify(searchResponse), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Simple Search] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'I encountered an error while searching. Please try again.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = url.searchParams.get('query');
    const conversationContext = url.searchParams.get('conversationContext') || '';
    
    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query parameter is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const searchResponse = await performSimpleSearch(query, conversationContext, apiKey);
    return new Response(
      JSON.stringify(searchResponse), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Simple Search] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'I encountered an error while searching. Please try again.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

async function performSimpleSearch(query: string, conversationContext: string, apiKey: string): Promise<SearchResponse> {
  try {
    console.log(`[Simple Search] Performing search for: "${query}"`);
    
    const openai = new OpenAI({ apiKey });
    
    // Create a system prompt that instructs GPT to provide search-like results
    const systemPrompt = `You are a web search assistant for a voice agent. When given a search query, provide current, relevant information as if you had just searched the web. 

For business/location searches: Provide business details, hours, services, and contact info if known.
For news/current events: Provide the most recent information you're aware of, noting your knowledge cutoff.
For weather: Provide typical weather patterns for the location and season, noting you cannot provide real-time data.
For products/prices: Provide general information about the topic.

Always format your response conversationally for voice output. Be concise but informative.
If you don't have current information, acknowledge this and provide the most relevant information you do have.`;

    const userPrompt = conversationContext 
      ? `Context from our conversation: ${conversationContext}\n\nSearch query: ${query}`
      : `Search query: ${query}`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const response = completion.choices[0]?.message?.content || 'I could not generate a search response.';
    
    console.log(`[Simple Search] Successfully generated response`);
    
    return {
      success: true,
      response
    };
    
  } catch (error) {
    console.error('[Simple Search] Error during search:', error);
    throw error;
  }
}