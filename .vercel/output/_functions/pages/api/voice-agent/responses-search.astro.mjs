import OpenAI from 'openai';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  console.log("\n===== SEARCH ENDPOINT [POST] REQUEST =====");
  try {
    const body = await request.json();
    const { query, conversationContext = "" } = body;
    console.log(`[Search API] Processing query: "${query}"`);
    if (!query) {
      return new Response(JSON.stringify({ success: false, error: "Query parameter is required" }), { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Search API] ❌ OpenAI API key not configured.");
      return new Response(JSON.stringify({ success: false, error: "API key not configured" }), { status: 500 });
    }
    const searchResponse = await performWebSearchWithResponsesAPI(query, conversationContext, apiKey);
    return new Response(JSON.stringify(searchResponse), { status: 200 });
  } catch (error) {
    console.error("[Search API] ❌ Error in POST handler:", error);
    return new Response(
      JSON.stringify({
        success: false,
        response: "I encountered a server error while processing the search request.",
        error: error instanceof Error ? error.message : "An unknown server error occurred"
      }),
      { status: 500 }
    );
  }
};
const GET = async ({ url }) => {
  console.log("\n===== SEARCH ENDPOINT [GET] REQUEST =====");
  try {
    const query = url.searchParams.get("query");
    const conversationContext = url.searchParams.get("conversationContext") || "";
    console.log(`[Search API] Successfully parsed query from URL: "${query}"`);
    if (!query) {
      return new Response(JSON.stringify({ success: false, error: "Query parameter is required" }), { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Search API] ❌ OpenAI API key not configured.");
      return new Response(JSON.stringify({ success: false, error: "API key not configured" }), { status: 500 });
    }
    const searchResponse = await performWebSearchWithResponsesAPI(query, conversationContext, apiKey);
    return new Response(JSON.stringify(searchResponse), { status: 200 });
  } catch (error) {
    console.error("[Search API] ❌ Error in GET handler:", error);
    return new Response(
      JSON.stringify({
        success: false,
        response: "I encountered a server error while processing the search request.",
        error: error instanceof Error ? error.message : "An unknown server error occurred"
      }),
      { status: 500 }
    );
  }
};
async function performWebSearchWithResponsesAPI(query, conversationContext = "", apiKey) {
  try {
    console.log(`[Search API] 🚀 Performing web search for query: "${query}"`);
    const searchContext = conversationContext ? `Context: ${conversationContext}

Search for: ${query}` : query;
    const inputMessages = [{
      role: "user",
      content: [{
        type: "input_text",
        text: searchContext
      }]
    }];
    const requestBody = {
      model: "gpt-4o",
      input: inputMessages,
      tools: [{ type: "web_search" }],
      tool_choice: "auto"
    };
    console.log("[Search API] 📤 Sending request to OpenAI Responses API...");
    console.log("[Search API] Request body:", JSON.stringify(requestBody, null, 2));
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    console.log(`[Search API] 📥 OpenAI response status: ${response.status}`);
    const responseText = await response.text();
    console.log("[Search API] Raw response:", responseText);
    if (!response.ok) {
      console.error("[Search API] ❌ OpenAI API returned an error:", responseText);
      return {
        success: false,
        error: `API failed with status ${response.status}.`,
        response: `I'm sorry, the search service returned an error. Please try again.`
      };
    }
    const responseData = JSON.parse(responseText);
    console.log("[Search API] Parsed response data:", JSON.stringify(responseData, null, 2));
    const searchResults = [];
    const citations = [];
    if (responseData.output && Array.isArray(responseData.output)) {
      for (const outputItem of responseData.output) {
        console.log("[Search API] Processing output item:", outputItem.type);
        if (outputItem.type === "web_search_call") {
          console.log("[Search API] Found web search call:", outputItem.status);
        }
        if (outputItem.type === "message" && outputItem.role === "assistant" && outputItem.content) {
          for (const contentItem of outputItem.content) {
            console.log("[Search API] Processing content item:", contentItem.type);
            if (contentItem.annotations && Array.isArray(contentItem.annotations)) {
              console.log("[Search API] Found", contentItem.annotations.length, "annotations");
              citations.push(...contentItem.annotations);
              for (const annotation of contentItem.annotations) {
                if (annotation.type === "url_citation") {
                  try {
                    const hostname = new URL(annotation.url).hostname;
                    searchResults.push({
                      title: annotation.title || "Untitled",
                      url: annotation.url,
                      snippet: contentItem.text.substring(
                        Math.max(0, annotation.start_index - 50),
                        Math.min(contentItem.text.length, annotation.end_index + 50)
                      ).trim(),
                      source: hostname
                    });
                  } catch (urlError) {
                    console.warn("[Search API] Invalid URL in citation:", annotation.url);
                  }
                }
              }
            }
          }
        }
      }
    }
    const finalResponseText = responseData.output_text || "The search was successful, but I could not generate a summary.";
    console.log(`[Search API] ✅ Search completed with ${searchResults.length} results and ${citations.length} citations`);
    return {
      success: true,
      response: finalResponseText,
      searchResults,
      citations
    };
  } catch (error) {
    console.error("[Search API] ❌ Error during web search execution:", error);
    return await fallbackToKnowledgeResponse(query, apiKey);
  }
}
async function fallbackToKnowledgeResponse(query, apiKey) {
  console.log(`[Search API] ⚠️ Falling back to knowledge-based response for: "${query}"`);
  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: `Web search failed. Based on your existing knowledge, what can you tell me about "${query}"?` }
      ]
    });
    const message = completion.choices[0]?.message?.content;
    return { success: true, response: message || `I couldn't perform the search for that topic.` };
  } catch (fallbackError) {
    console.error("[Search API] ❌ Fallback response also failed:", fallbackError);
    return { success: false, error: "Fallback failed", response: `I am having trouble accessing all my information sources at the moment. Please try again shortly.` };
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
