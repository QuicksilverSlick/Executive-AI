import { O as OpenAI } from '../../../_astro/index.Bc7mdO2K.js';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { query, conversationContext = "" } = body;
    console.log(`[Simple Search] Processing query: "${query}"`);
    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: "Query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const apiKey = "sk-your-openai-api-key-here";
    if (!apiKey) ;
    const searchResponse = await performSimpleSearch(query, conversationContext, apiKey);
    return new Response(
      JSON.stringify(searchResponse),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Simple Search] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        response: "I encountered an error while searching. Please try again."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const GET = async ({ url }) => {
  try {
    const query = url.searchParams.get("query");
    const conversationContext = url.searchParams.get("conversationContext") || "";
    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: "Query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const apiKey = "sk-your-openai-api-key-here";
    if (!apiKey) ;
    const searchResponse = await performSimpleSearch(query, conversationContext, apiKey);
    return new Response(
      JSON.stringify(searchResponse),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Simple Search] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        response: "I encountered an error while searching. Please try again."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
async function performSimpleSearch(query, conversationContext, apiKey) {
  try {
    console.log(`[Simple Search] Performing search for: "${query}"`);
    const openai = new OpenAI({ apiKey });
    const systemPrompt = `You are a web search assistant for a voice agent. When given a search query, provide current, relevant information as if you had just searched the web. 

For business/location searches: Provide business details, hours, services, and contact info if known.
For news/current events: Provide the most recent information you're aware of, noting your knowledge cutoff.
For weather: Provide typical weather patterns for the location and season, noting you cannot provide real-time data.
For products/prices: Provide general information about the topic.

Always format your response conversationally for voice output. Be concise but informative.
If you don't have current information, acknowledge this and provide the most relevant information you do have.`;
    const userPrompt = conversationContext ? `Context from our conversation: ${conversationContext}

Search query: ${query}` : `Search query: ${query}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    const response = completion.choices[0]?.message?.content || "I could not generate a search response.";
    console.log(`[Simple Search] Successfully generated response`);
    return {
      success: true,
      response
    };
  } catch (error) {
    console.error("[Simple Search] Error during search:", error);
    throw error;
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
