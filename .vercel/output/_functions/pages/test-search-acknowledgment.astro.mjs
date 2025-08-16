/* empty css                                 */
import { e as createComponent, ak as renderHead, l as renderScript, r as renderTemplate } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                                      */
export { renderers } from '../renderers.mjs';

const $$TestSearchAcknowledgment = createComponent(async ($$result, $$props, $$slots) => {
  const title = "Voice Search Acknowledgment Test";
  return renderTemplate`<html lang="en" data-astro-cid-fu75smga> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderHead()}</head> <body data-astro-cid-fu75smga> <div class="container" data-astro-cid-fu75smga> <div class="main-panel" data-astro-cid-fu75smga> <h1 data-astro-cid-fu75smga>Voice Search Acknowledgment Test</h1> <div class="status-indicator" data-astro-cid-fu75smga> <div class="status-dot" id="statusDot" data-astro-cid-fu75smga></div> <span id="connectionStatus" data-astro-cid-fu75smga>Disconnected</span> </div> <div class="controls" data-astro-cid-fu75smga> <div class="control-group" data-astro-cid-fu75smga> <h3 data-astro-cid-fu75smga>Connection</h3> <div class="audio-controls" data-astro-cid-fu75smga> <button id="connectBtn" data-astro-cid-fu75smga>Connect Voice Agent</button> <button id="disconnectBtn" disabled data-astro-cid-fu75smga>Disconnect</button> <button id="testAudioBtn" disabled data-astro-cid-fu75smga>Test Audio</button> </div> </div> <div class="control-group" data-astro-cid-fu75smga> <h3 data-astro-cid-fu75smga>Test Scenarios</h3> <div class="test-scenarios" data-astro-cid-fu75smga> <button class="scenario-button" data-query="What's the weather?" data-astro-cid-fu75smga> <strong data-astro-cid-fu75smga>Simple Search</strong><br data-astro-cid-fu75smga>
"What's the weather?"
</button> <button class="scenario-button" data-query="Find information about quantum computing" data-astro-cid-fu75smga> <strong data-astro-cid-fu75smga>Complex Search</strong><br data-astro-cid-fu75smga>
"Find information about quantum computing"
</button> <button class="scenario-button" data-query="What's the weather? Then search for restaurants nearby." data-astro-cid-fu75smga> <strong data-astro-cid-fu75smga>Multi-Search</strong><br data-astro-cid-fu75smga>
Sequential searches
</button> <button class="scenario-button" data-query="Search for something that will fail" data-error="true" data-astro-cid-fu75smga> <strong data-astro-cid-fu75smga>Error Case</strong><br data-astro-cid-fu75smga>
Network failure simulation
</button> </div> </div> <div class="control-group" data-astro-cid-fu75smga> <h3 data-astro-cid-fu75smga>Manual Testing</h3> <div class="audio-controls" data-astro-cid-fu75smga> <button id="startRecording" class="success" disabled data-astro-cid-fu75smga>Start Recording</button> <button id="stopRecording" class="warning" disabled data-astro-cid-fu75smga>Stop Recording</button> <button id="clearEvents" data-astro-cid-fu75smga>Clear Event Log</button> </div> </div> </div> </div> <div class="debug-panel" data-astro-cid-fu75smga> <div class="debug-section" data-astro-cid-fu75smga> <h4 data-astro-cid-fu75smga>Event Flow</h4> <div class="event-log" id="eventLog" data-astro-cid-fu75smga> <div class="event-item event-info" data-astro-cid-fu75smga>Ready to test voice search acknowledgment system...</div> </div> </div> <div class="debug-section" data-astro-cid-fu75smga> <h4 data-astro-cid-fu75smga>Performance Metrics</h4> <div class="metrics" data-astro-cid-fu75smga> <div class="metric-item" data-astro-cid-fu75smga> <div class="metric-value" id="acknowledgmentTime" data-astro-cid-fu75smga>0ms</div> <div class="metric-label" data-astro-cid-fu75smga>Acknowledgment Time</div> </div> <div class="metric-item" data-astro-cid-fu75smga> <div class="metric-value" id="searchTime" data-astro-cid-fu75smga>0ms</div> <div class="metric-label" data-astro-cid-fu75smga>Search Time</div> </div> <div class="metric-item" data-astro-cid-fu75smga> <div class="metric-value" id="totalInteractions" data-astro-cid-fu75smga>0</div> <div class="metric-label" data-astro-cid-fu75smga>Total Tests</div> </div> <div class="metric-item" data-astro-cid-fu75smga> <div class="metric-value" id="successRate" data-astro-cid-fu75smga>100%</div> <div class="metric-label" data-astro-cid-fu75smga>Success Rate</div> </div> </div> </div> <div class="debug-section" data-astro-cid-fu75smga> <h4 data-astro-cid-fu75smga>Validation Checklist</h4> <ul class="validation-checklist" id="validationChecklist" data-astro-cid-fu75smga> <li data-astro-cid-fu75smga> <div class="checkbox" id="check-acknowledgment" data-astro-cid-fu75smga>✓</div>
Agent acknowledges search request
</li> <li data-astro-cid-fu75smga> <div class="checkbox" id="check-voice-consistency" data-astro-cid-fu75smga>✓</div>
Same voice used throughout
</li> <li data-astro-cid-fu75smga> <div class="checkbox" id="check-no-manual-tts" data-astro-cid-fu75smga>✓</div>
No manual TTS or different voices
</li> <li data-astro-cid-fu75smga> <div class="checkbox" id="check-smooth-transition" data-astro-cid-fu75smga>✓</div>
Smooth transition to results
</li> <li data-astro-cid-fu75smga> <div class="checkbox" id="check-error-handling" data-astro-cid-fu75smga>✓</div>
Error cases handled gracefully
</li> </ul> </div> </div> </div> ${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-search-acknowledgment.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-search-acknowledgment.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-search-acknowledgment.astro";
const $$url = "/test-search-acknowledgment";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$TestSearchAcknowledgment,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
