/* empty css                                 */
import { e as createComponent, l as renderScript, ak as renderHead, r as renderTemplate } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$VoiceAgentCompatibilityTest = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-agent-compatibility-test.astro?astro&type=script&index=0&lang.ts")}${renderHead()}</head> <body class="bg-gray-50 min-h-screen"> <div class="container mx-auto p-8"> <div class="max-w-4xl mx-auto"> <h1 class="text-3xl font-bold text-gray-900 mb-8">Voice Agent Compatibility Test</h1> <!-- Status Panel --> <div class="bg-white rounded-lg shadow-md p-6 mb-8"> <h2 class="text-xl font-semibold text-gray-800 mb-4">System Status</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div class="bg-gray-50 rounded-lg p-4"> <h3 class="font-medium text-gray-700 mb-2">API Tier</h3> <div id="api-tier" class="text-lg font-semibold text-blue-600">Checking...</div> </div> <div class="bg-gray-50 rounded-lg p-4"> <h3 class="font-medium text-gray-700 mb-2">Current Mode</h3> <div id="current-mode" class="text-lg font-semibold text-green-600">Unknown</div> </div> <div class="bg-gray-50 rounded-lg p-4"> <h3 class="font-medium text-gray-700 mb-2">Token Status</h3> <div id="token-status" class="text-lg font-semibold text-gray-600">No Token</div> </div> </div> </div> <!-- Feature Matrix --> <div class="bg-white rounded-lg shadow-md p-6 mb-8"> <h2 class="text-xl font-semibold text-gray-800 mb-4">Feature Availability</h2> <div class="overflow-x-auto"> <table class="w-full table-auto"> <thead> <tr class="bg-gray-50"> <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Feature</th> <th class="px-4 py-2 text-center text-sm font-medium text-gray-700">Available</th> <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th> </tr> </thead> <tbody id="feature-table"> <tr><td colspan="3" class="px-4 py-2 text-center text-gray-500">Loading...</td></tr> </tbody> </table> </div> </div> <!-- Actions --> <div class="bg-white rounded-lg shadow-md p-6 mb-8"> <h2 class="text-xl font-semibold text-gray-800 mb-4">Actions</h2> <div class="flex flex-wrap gap-4"> <button id="check-compatibility" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
Check Compatibility
</button> <button id="request-token" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
Request Token
</button> <button id="test-demo" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
Test Demo Mode
</button> <button id="test-fallback" class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
Test Fallback API
</button> </div> </div> <!-- Logs --> <div class="bg-white rounded-lg shadow-md p-6"> <h2 class="text-xl font-semibold text-gray-800 mb-4">Logs</h2> <div id="logs" class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto"> <div>Voice Agent Compatibility Test initialized...</div> </div> </div> <!-- Warnings/Recommendations --> <div id="warnings" class="hidden bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8"> <h2 class="text-xl font-semibold text-yellow-800 mb-4">⚠️ Warnings & Recommendations</h2> <div id="warnings-content" class="space-y-2"></div> </div> </div> </div> ${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-agent-compatibility-test.astro?astro&type=script&index=1&lang.ts")} </body> </html>`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-agent-compatibility-test.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-agent-compatibility-test.astro";
const $$url = "/voice-agent-compatibility-test";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$VoiceAgentCompatibilityTest,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
