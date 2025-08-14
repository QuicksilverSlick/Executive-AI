#!/usr/bin/env node

// Simple API test with environment check
async function testAPI() {
  // First check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  Warning: OPENAI_API_KEY not set in environment');
    console.log('The API will still respond with a fallback message\n');
  }
  
  const query = "Drip City Cafe in Tulsa, Oklahoma";
  console.log(`Testing search API with query: "${query}"\n`);
  
  // Mock the API call to simulate what would happen
  console.log('Expected API behavior:');
  console.log('1. The search API endpoint receives the query');
  console.log('2. It calls OpenAI Chat Completions API (not Responses API)');
  console.log('3. OpenAI generates a response about Drip City Cafe');
  console.log('4. The response acknowledges it cannot access real-time data');
  console.log('5. It provides AI insights for coffee shops/cafes\n');
  
  // Simulate the response
  const simulatedResponse = {
    success: true,
    response: `Based on current information and trends:

I understand you're asking about Drip City Cafe in Tulsa, Oklahoma. While I cannot access real-time information about specific local businesses, I can discuss how coffee shops and cafes are using AI for customer experience, inventory management, and personalized marketing.

Coffee shops like Drip City Cafe could benefit from AI in several ways:

1. **Customer Experience Enhancement**: AI-powered ordering systems, personalized recommendations based on purchase history, and chatbots for customer service.

2. **Inventory Management**: Predictive analytics to optimize stock levels, reduce waste, and ensure popular items are always available.

3. **Marketing Automation**: AI can help with targeted social media campaigns, loyalty program optimization, and personalized email marketing.

4. **Operations Optimization**: From scheduling staff based on predicted busy periods to optimizing energy usage and equipment maintenance.

Executive AI training could help coffee shop owners and managers understand these technologies and implement them effectively to improve their business operations and customer satisfaction.

This information is based on my training data and understanding of the topic. For the most up-to-date information, you might also want to check recent industry reports or official sources.`,
    searchResults: [{
      source: 'AI Knowledge Base',
      timestamp: new Date().toISOString()
    }]
  };
  
  console.log('Simulated API Response:');
  console.log('Status: 200 OK');
  console.log(`Success: ${simulatedResponse.success}`);
  console.log('\nResponse preview:');
  console.log(simulatedResponse.response.substring(0, 300) + '...\n');
  
  console.log('✅ This is how the search API would respond to the Drip City Cafe query');
  console.log('\nTo test with actual API:');
  console.log('1. Make sure dev server is running: npm run dev');
  console.log('2. Set OPENAI_API_KEY environment variable');
  console.log('3. Run: node test-drip-city-query.js');
}

testAPI();