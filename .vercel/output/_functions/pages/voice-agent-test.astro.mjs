/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_7UizUh1a.mjs';
export { renderers } from '../renderers.mjs';

const $$VoiceAgentTest = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Voice Agent Test - Executive AI Training", "description": "Test page for voice assistant functionality and integration verification", "noindex": true, "disableVoiceWidget": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-brand-pearl dark:bg-dark-surface py-12"> <div class="container mx-auto px-6 max-w-4xl"> <!-- Header --> <div class="text-center mb-12"> <h1 class="text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-4">
Voice Agent Integration Test
</h1> <p class="text-lg text-gray-600 dark:text-dark-text-secondary mb-8">
This page tests all voice assistant components and integrations
</p> <div class="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-4 py-2 rounded-lg"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg>
Voice Agent Ready
</div> </div> <!-- Test Sections --> <div class="space-y-8"> <!-- Component Status --> <section class="bg-white dark:bg-dark-surface-2 rounded-xl p-6 shadow-lg"> <h2 class="text-2xl font-semibold text-brand-charcoal dark:text-dark-text mb-6">
Component Status
</h2> <div class="grid md:grid-cols-2 gap-6"> <!-- WebRTC Status --> <div class="space-y-4"> <h3 class="text-lg font-medium text-brand-charcoal dark:text-dark-text">
WebRTC Connection
</h3> <div id="webrtc-status" class="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary"> <div class="w-3 h-3 rounded-full bg-gray-400"></div> <span>Not connected</span> </div> </div> <!-- Audio Status --> <div class="space-y-4"> <h3 class="text-lg font-medium text-brand-charcoal dark:text-dark-text">
Audio System
</h3> <div id="audio-status" class="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary"> <div class="w-3 h-3 rounded-full bg-gray-400"></div> <span>Not initialized</span> </div> </div> <!-- Token Status --> <div class="space-y-4"> <h3 class="text-lg font-medium text-brand-charcoal dark:text-dark-text">
Authentication
</h3> <div id="token-status" class="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary"> <div class="w-3 h-3 rounded-full bg-gray-400"></div> <span>No token</span> </div> </div> <!-- Knowledge Base --> <div class="space-y-4"> <h3 class="text-lg font-medium text-brand-charcoal dark:text-dark-text">
Knowledge Base
</h3> <div id="knowledge-status" class="flex items-center gap-2 text-green-600 dark:text-green-400"> <div class="w-3 h-3 rounded-full bg-green-500"></div> <span>Loaded</span> </div> </div> </div> </section> <!-- Test Controls --> <section class="bg-white dark:bg-dark-surface-2 rounded-xl p-6 shadow-lg"> <h2 class="text-2xl font-semibold text-brand-charcoal dark:text-dark-text mb-6">
Test Controls
</h2> <div class="grid md:grid-cols-2 gap-6"> <!-- Connection Tests --> <div class="space-y-4"> <h3 class="text-lg font-medium text-brand-charcoal dark:text-dark-text">
Connection Tests
</h3> <div class="space-y-3"> <button id="test-token" class="w-full bg-accent-sky hover:bg-accent-sky-dark text-white px-4 py-2 rounded-lg transition-colors">
Test Token Endpoint
</button> <button id="test-health" class="w-full bg-accent-green hover:bg-accent-green-dark text-white px-4 py-2 rounded-lg transition-colors">
Test Health Check
</button> <button id="test-microphone" class="w-full bg-accent-gold hover:bg-accent-gold-dark text-white px-4 py-2 rounded-lg transition-colors">
Test Microphone Access
</button> </div> </div> <!-- UI Tests --> <div class="space-y-4"> <h3 class="text-lg font-medium text-brand-charcoal dark:text-dark-text">
UI Tests
</h3> <div class="space-y-3"> <button id="test-widget-expand" class="w-full bg-brand-gold hover:bg-brand-gold-warm text-white px-4 py-2 rounded-lg transition-colors">
Expand Widget
</button> <button id="test-widget-minimize" class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
Minimize Widget
</button> <button id="test-notifications" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
Test Notifications
</button> </div> </div> </div> </section> <!-- Debug Console --> <section class="bg-white dark:bg-dark-surface-2 rounded-xl p-6 shadow-lg"> <h2 class="text-2xl font-semibold text-brand-charcoal dark:text-dark-text mb-6">
Debug Console
</h2> <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto"> <div id="debug-output"> <div class="text-gray-500">[Debug] Voice agent test page loaded</div> </div> </div> <div class="mt-4 flex gap-2"> <button id="clear-debug" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
Clear Console
</button> <button id="test-all" class="bg-brand-gold hover:bg-brand-gold-warm text-white px-4 py-2 rounded-lg transition-colors">
Run All Tests
</button> </div> </section> <!-- Browser Compatibility --> <section class="bg-white dark:bg-dark-surface-2 rounded-xl p-6 shadow-lg"> <h2 class="text-2xl font-semibold text-brand-charcoal dark:text-dark-text mb-6">
Browser Compatibility
</h2> <div class="grid md:grid-cols-3 gap-4" id="browser-compat"> <!-- Will be populated by JavaScript --> </div> </section> <!-- Usage Instructions --> <section class="bg-white dark:bg-dark-surface-2 rounded-xl p-6 shadow-lg"> <h2 class="text-2xl font-semibold text-brand-charcoal dark:text-dark-text mb-6">
Usage Instructions
</h2> <div class="prose dark:prose-invert max-w-none"> <ol class="space-y-3"> <li> <strong>Voice Widget:</strong> Look for the floating microphone button in the bottom-right corner
</li> <li> <strong>Expand Panel:</strong> Click the floating button to open the voice assistant panel
</li> <li> <strong>Start Conversation:</strong> Click the main microphone button or press Space bar to start talking
</li> <li> <strong>Permissions:</strong> Grant microphone access when prompted by your browser
</li> <li> <strong>Test Features:</strong> Use the test buttons above to verify individual components
</li> <li> <strong>Debug:</strong> Monitor the debug console for detailed logging information
</li> </ol> </div> </section> </div> </div> </div>  ${renderScript($$result2, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-agent-test.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-agent-test.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-agent-test.astro";
const $$url = "/voice-agent-test";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$VoiceAgentTest,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
