import { f as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../_astro/astro/server.DAk61OsX.js';
import 'kleur/colors';
import { $ as $$Layout } from '../_astro/Layout.Dz-ECntR.js';
export { renderers } from '../renderers.mjs';

const $$VoiceTestWebrtc = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "WebRTC Voice Assistant Test", "disableVoiceWidget": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container-narrow py-20"> <h1 class="text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-8">
WebRTC Voice Assistant Test
</h1> <div class="bg-white dark:bg-dark-surface-2 rounded-lg shadow-lg p-8 mb-8"> <h2 class="text-2xl font-semibold mb-4">Testing OpenAI Realtime API</h2> <div class="prose dark:prose-invert"> <p>This page tests the WebRTC voice assistant with OpenAI's Realtime API.</p> <h3>How to use:</h3> <ol> <li>Click the golden microphone button in the bottom-right corner</li> <li>Click the large microphone or hold Space to start talking</li> <li>Release to stop recording and get a response</li> <li>The AI will respond with both voice and text</li> </ol> <h3>Features:</h3> <ul> <li>Real-time speech recognition via WebRTC</li> <li>AI responses with natural voice synthesis</li> <li>Live transcripts for both user and assistant</li> <li>Keyboard shortcuts (Space to talk, Esc to minimize, Ctrl+M to mute)</li> </ul> <h3>Connection Status:</h3> <div id="connection-status" class="mt-4 p-4 bg-gray-100 dark:bg-dark-surface rounded-lg"> <p class="text-sm">Checking connection...</p> </div> </div> </div> <div class="bg-brand-pearl dark:bg-dark-surface-3 rounded-lg p-6"> <h3 class="text-lg font-semibold mb-3">Debug Console</h3> <div id="debug-console" class="bg-white dark:bg-dark-surface rounded p-4 h-64 overflow-y-auto font-mono text-sm"> <p class="text-gray-500">Console messages will appear here...</p> </div> </div> </div> ` })} ${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-test-webrtc.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-test-webrtc.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-test-webrtc.astro";
const $$url = "/voice-test-webrtc";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$VoiceTestWebrtc,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
