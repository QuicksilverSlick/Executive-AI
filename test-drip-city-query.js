#!/usr/bin/env node

/**
 * Test query extraction and search API with Drip City Cafe examples
 */

// Test query extraction logic
function extractSearchQuery(text) {
  const lowerText = text.toLowerCase();
  
  // First, handle complex sentences with multiple instructions
  // Remove phrases that are instructions about searching, not the search query itself
  let cleanedText = text
    .replace(/\b(run your search function|so use that tool or function to|please use the|can you|could you|would you|will you)\b/gi, '')
    .replace(/\b(search function|search tool|function to|tool to)\b/gi, '')
    .replace(/\bsearch for\b/gi, 'search')
    .replace(/\blook up\b/gi, 'lookup')
    .replace(/\bfind information about\b/gi, 'find')
    .replace(/\btell me about\b/gi, 'about')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract the actual search target using patterns
  const patterns = [
    // Pattern: "search/lookup/find [target] in [location]" - capture both parts
    /\b(?:search|lookup|find|research|google|bing)\s+(?:for\s+)?(.+?)\s+(?:in|at|near|around)\s+(.+)$/i,
    // Pattern: "search/lookup/find [target]" - no location
    /\b(?:search|lookup|find|research|google|bing)\s+(?:for\s+)?(.+)$/i,
    // Pattern: "what is/are [target] in [location]"
    /\bwhat\s+(?:is|are)\s+(.+?)\s+(?:in|at|near|around)\s+(.+)$/i,
    // Pattern: "what is/are [target]"
    /\bwhat\s+(?:is|are)\s+(.+)$/i,
    // Pattern: "information about [target] in [location]"
    /\b(?:information|info)\s+(?:about|on)\s+(.+?)\s+(?:in|at|near|around)\s+(.+)$/i,
    // Pattern: "information about [target]"
    /\b(?:information|info)\s+(?:about|on)\s+(.+)$/i,
    // Pattern: "about [target] in [location]"
    /\babout\s+(.+?)\s+(?:in|at|near|around)\s+(.+)$/i,
    // Pattern: "about [target]"
    /\babout\s+(.+)$/i,
    // Pattern: "[business name] in [location]" - standalone
    /^(.+?)\s+in\s+(.+)$/i
  ];
  
  for (const pattern of patterns) {
    const match = cleanedText.match(pattern);
    if (match && match[1]) {
      let query = match[1].trim();
      
      // If we also captured a location (from the business pattern), append it
      if (match[2]) {
        query += ' in ' + match[2].trim();
      }
      
      // Clean up the extracted query
      query = query
        .replace(/[.,!?;]+$/, '') // Remove trailing punctuation
        .replace(/^(the|a|an)\s+/i, '') // Remove leading articles
        .trim();
      
      // Special handling for "my business" - look for the business name in the context
      if (query.includes('my business')) {
        const businessMatch = text.match(/(?:called|named|it's)\s+(.+?)(?:\.|,|$)/i);
        if (businessMatch && businessMatch[1]) {
          query = query.replace('my business', businessMatch[1].trim());
        }
      }
      
      if (query) {
        console.log('[Extracted clean query]:', query, 'from:', text);
        return query;
      }
    }
  }
  
  // If no pattern matched, try to extract key phrases
  // Remove common filler words and instructions
  const fillerWords = [
    'please', 'can', 'could', 'would', 'will', 'you', 'run', 'use', 
    'that', 'the', 'function', 'tool', 'search', 'for', 'to', 'so',
    'your', 'or', 'and', 'but', 'with', 'using', 'via'
  ];
  
  const words = cleanedText.split(/\s+/);
  const meaningfulWords = words.filter(word => {
    const lowerWord = word.toLowerCase();
    return !fillerWords.includes(lowerWord) && lowerWord.length > 2;
  });
  
  // If we have meaningful words left, use them
  if (meaningfulWords.length > 0) {
    const query = meaningfulWords.join(' ');
    console.log('[Extracted from keywords]:', query, 'from:', text);
    return query;
  }
  
  // Last resort: return the original text minus obvious prefixes
  const simplePrefixes = [
    'search for ', 'look up ', 'find ', 'research ', 'google ', 'bing ',
    'what is ', 'what are ', 'tell me about ', 'information about ',
    'can you search for ', 'can you look up ', 'can you find '
  ];
  
  let finalQuery = text;
  for (const prefix of simplePrefixes) {
    if (lowerText.startsWith(prefix)) {
      finalQuery = text.substring(prefix.length);
      break;
    }
  }
  
  console.log('[Using simple prefix removal]:', finalQuery.trim(), 'from:', text);
  return finalQuery.trim();
}

// Test cases based on user's actual queries
const testQueries = [
  "Run your search function, so use that tool or function to search for Drip City Coffee in Tulsa, Oklahoma.",
  "search for my business here in Tulsa, OK, and tell me a little bit about it. It's called Drip City Cafe.",
  "Search for Drip City Cafe in Tulsa",
  "What is Drip City Coffee?",
  "Tell me about Drip City Cafe in Tulsa, Oklahoma",
  "Can you find information about Drip City Coffee in Tulsa?",
  "Drip City Cafe Tulsa Oklahoma"
];

console.log('=== Testing Query Extraction ===\n');

testQueries.forEach((query, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`Input: "${query}"`);
  const extracted = extractSearchQuery(query);
  console.log(`Output: "${extracted}"`);
  console.log('---\n');
});

// Test the API if running locally
async function testSearchAPI() {
  console.log('\n=== Testing Search API ===\n');
  
  const baseUrl = process.env.API_URL || 'http://localhost:4323';
  const endpoint = '/api/voice-agent/responses-search';
  
  // Test with the extracted query
  const testQuery = "Drip City Coffee in Tulsa, Oklahoma";
  
  console.log(`Testing API with query: "${testQuery}"`);
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: testQuery,
        conversationContext: 'User asked about their business in Tulsa'
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✓ Success!');
      console.log('\nFull response:');
      console.log(data.response);
    } else {
      console.log('\n✗ Failed:', data.error);
    }
    
  } catch (error) {
    console.log('\n✗ Error:', error.message);
    console.log('\nMake sure the dev server is running: npm run dev');
  }
}

// Run the API test if not in test mode
if (process.argv[2] !== '--extract-only') {
  testSearchAPI().catch(console.error);
}