export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  const query = url.searchParams.get("q") || "Drip City Coffee Oakland";
  try {
    const response = await fetch(`${url.origin}/api/voice-agent/responses-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Search Test: ${query}</title>
  <style>
    body { 
      font-family: system-ui; 
      max-width: 800px; 
      margin: 40px auto; 
      padding: 20px;
      background: #f5f5f5;
    }
    .result { 
      background: white; 
      padding: 20px; 
      margin: 20px 0; 
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .success { border-left: 4px solid #10b981; }
    .error { border-left: 4px solid #ef4444; }
    .search-results {
      margin-top: 20px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 4px;
    }
    .search-result {
      margin: 10px 0;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    pre { 
      background: #1e293b; 
      color: #e2e8f0; 
      padding: 15px; 
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>Search Test Results</h1>
  <div class="result ${data.success ? "success" : "error"}">
    <h2>Query: "${query}"</h2>
    <p><strong>Status:</strong> ${data.success ? "✅ Success" : "❌ Failed"}</p>
    ${data.error ? `<p><strong>Error:</strong> ${data.error}</p>` : ""}
    
    <h3>Response:</h3>
    <p>${data.response || "No response"}</p>
    
    ${data.searchResults && data.searchResults.length > 0 ? `
      <div class="search-results">
        <h3>Search Results (${data.searchResults.length}):</h3>
        ${data.searchResults.map((r) => `
          <div class="search-result">
            <strong>${r.title}</strong><br>
            <a href="${r.url}" target="_blank">${r.url}</a><br>
            <em>${r.snippet}</em>
          </div>
        `).join("")}
      </div>
    ` : "<p><em>No search results returned</em></p>"}
    
    <h3>Raw Response:</h3>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  </div>
  
  <div style="margin-top: 40px;">
    <h3>Test Other Queries:</h3>
    <form method="GET">
      <input type="text" name="q" placeholder="Enter search query" 
             style="padding: 8px; width: 300px; margin-right: 10px;">
      <button type="submit" style="padding: 8px 16px;">Search</button>
    </form>
    
    <p style="margin-top: 20px;">Example queries:</p>
    <ul>
      <li><a href="?q=Drip City Coffee Oakland">Drip City Coffee Oakland</a></li>
      <li><a href="?q=Home Depot Tulsa Oklahoma">Home Depot Tulsa Oklahoma</a></li>
      <li><a href="?q=SRI Energy company">SRI Energy company</a></li>
      <li><a href="?q=AI training best practices 2025">AI training best practices 2025</a></li>
    </ul>
  </div>
</body>
</html>
    `;
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    return new Response(
      `<h1>Error</h1><pre>${error}</pre>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
