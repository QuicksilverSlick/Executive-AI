import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../_astro/astro/server.DAk61OsX.js';
import 'kleur/colors';
import { $ as $$Layout, b as $$WebRTCVoiceWidget } from '../_astro/Layout.Dz-ECntR.js';
export { renderers } from '../renderers.mjs';

const $$TestVoiceChat = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Voice Chat Test", "disableVoiceWidget": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-20"> <div class="max-w-4xl mx-auto"> <h1 class="text-4xl font-bold mb-8">Voice Chat Input Test</h1> <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"> <h2 class="text-2xl font-semibold mb-4">Debug Information</h2> <div class="space-y-4"> <div> <h3 class="font-semibold mb-2">Quick Start:</h3> <ol class="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300"> <li>Click the voice assistant button in the bottom right</li> <li>Wait for "Connected" status (green dot)</li> <li>Type a message in the chat input</li> <li>Press Enter or click Send</li> <li>Your message should appear immediately</li> </ol> </div> <div> <h3 class="font-semibold mb-2">Debug Console Commands:</h3> <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto">// Force connected state (for testing)
window.DEBUG_VOICE_AGENT_FORCE_CONNECTED = true;

// Check voice agent status
window.WebRTCVoiceAgent

// Monitor console for these messages:
// [Text Input] Send attempt:
// [Text Input] Sending message:
// [WebRTC Voice Agent] Emitting userTranscript</pre> </div> <div> <h3 class="font-semibold mb-2">API Status Check:</h3> <div class="flex space-x-4"> <button id="checkConnection" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
Check Connection
</button> <button id="forceConnect" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
Force Connect Mode
</button> </div> <div id="statusOutput" class="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded text-sm"></div> </div> </div> </div> <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4"> <h3 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Environment Setup Required:</h3> <code class="block bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded text-sm">
OPENAI_API_KEY=sk-...your-key-here
</code> <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
Add this to your .env file (not .env.example)
</p> </div> </div> </main>  ${renderComponent($$result2, "WebRTCVoiceWidget", $$WebRTCVoiceWidget, { "position": "bottom-right", "theme": "auto", "showTranscript": true, "enableKeyboardShortcut": true })} ${renderScript($$result2, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-voice-chat.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-voice-chat.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-voice-chat.astro";
const $$url = "/test-voice-chat";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestVoiceChat,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
