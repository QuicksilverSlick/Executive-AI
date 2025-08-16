/* empty css                                 */
import { e as createComponent, ak as renderHead, l as renderScript, r as renderTemplate } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                             */
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$TestVoiceSearch = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en" data-astro-cid-2dhbosqn> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Voice Agent Search Test</title>${renderHead()}</head> <body data-astro-cid-2dhbosqn> <div class="header" data-astro-cid-2dhbosqn> <h1 data-astro-cid-2dhbosqn>🔍 Voice Agent Web Search Test</h1> <p data-astro-cid-2dhbosqn>Test the complete voice search functionality with the OpenAI Responses API</p> </div> <div class="test-section" data-astro-cid-2dhbosqn> <h2 data-astro-cid-2dhbosqn>Quick Test Queries</h2> <p data-astro-cid-2dhbosqn>Click any query below to test it with the voice agent:</p> <div class="test-queries" data-astro-cid-2dhbosqn> <div class="query-card" data-query="Search for Drip City Coffee in Oakland" data-astro-cid-2dhbosqn> <h3 data-astro-cid-2dhbosqn>☕ Coffee Shop Search</h3> <p data-astro-cid-2dhbosqn>"Search for Drip City Coffee in Oakland"</p> </div> <div class="query-card" data-query="Look up Home Depot in Tulsa Oklahoma" data-astro-cid-2dhbosqn> <h3 data-astro-cid-2dhbosqn>🏪 Store Locator</h3> <p data-astro-cid-2dhbosqn>"Look up Home Depot in Tulsa Oklahoma"</p> </div> <div class="query-card" data-query="Find information about SRI Energy company" data-astro-cid-2dhbosqn> <h3 data-astro-cid-2dhbosqn>🏢 Company Info</h3> <p data-astro-cid-2dhbosqn>"Find information about SRI Energy company"</p> </div> <div class="query-card" data-query="What's the latest news about AI training in 2025" data-astro-cid-2dhbosqn> <h3 data-astro-cid-2dhbosqn>📰 Current News</h3> <p data-astro-cid-2dhbosqn>"What's the latest news about AI training in 2025"</p> </div> <div class="query-card" data-query="Search for executive AI transformation strategies" data-astro-cid-2dhbosqn> <h3 data-astro-cid-2dhbosqn>💼 Business Search</h3> <p data-astro-cid-2dhbosqn>"Search for executive AI transformation strategies"</p> </div> <div class="query-card" data-query="Find restaurants near Times Square New York" data-astro-cid-2dhbosqn> <h3 data-astro-cid-2dhbosqn>🍕 Restaurant Search</h3> <p data-astro-cid-2dhbosqn>"Find restaurants near Times Square New York"</p> </div> </div> </div> <div class="test-section" data-astro-cid-2dhbosqn> <h2 data-astro-cid-2dhbosqn>Manual Test</h2> <div class="controls" data-astro-cid-2dhbosqn> <input type="text" id="manual-query" placeholder="Enter your search query..." style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px;" data-astro-cid-2dhbosqn> <button class="btn-primary" onclick="testSearch()" data-astro-cid-2dhbosqn>Test Search</button> <button class="btn-secondary" onclick="clearConsole()" data-astro-cid-2dhbosqn>Clear Console</button> </div> <div id="status" class="status disconnected" data-astro-cid-2dhbosqn>
Voice Agent: Not Connected
</div> </div> <div class="test-section" data-astro-cid-2dhbosqn> <h2 data-astro-cid-2dhbosqn>Test Results</h2> <div id="results" class="results" data-astro-cid-2dhbosqn> <p style="color: #666;" data-astro-cid-2dhbosqn>No search results yet. Click a query card or enter your own query to test.</p> </div> </div> <div class="test-section" data-astro-cid-2dhbosqn> <h2 data-astro-cid-2dhbosqn>Debug Console</h2> <div id="console" class="console" data-astro-cid-2dhbosqn> <div class="log-entry info" data-astro-cid-2dhbosqn>🚀 Voice Search Test Page Initialized</div> <div class="log-entry info" data-astro-cid-2dhbosqn>📋 Ready to test search queries</div> </div> </div> ${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-voice-search.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-voice-search.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-voice-search.astro";
const $$url = "/test-voice-search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestVoiceSearch,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
