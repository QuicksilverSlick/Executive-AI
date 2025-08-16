/* empty css                                 */
import { e as createComponent, r as renderTemplate, ak as renderHead } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                            */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$VoiceDiagnostic = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["<html data-astro-cid-64bgbn2l> <head><title>Voice Agent Diagnostic</title>", `</head> <body data-astro-cid-64bgbn2l> <h1 data-astro-cid-64bgbn2l>Voice Agent Connection Diagnostic</h1> <div id="tests" data-astro-cid-64bgbn2l> <div class="test" id="test-env" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>1. Environment Check</h3> <button onclick="testEnvironment()" data-astro-cid-64bgbn2l>Test Environment</button> <pre id="env-result" data-astro-cid-64bgbn2l></pre> </div> <div class="test" id="test-health" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>2. Health Check</h3> <button onclick="testHealth()" data-astro-cid-64bgbn2l>Test Health API</button> <pre id="health-result" data-astro-cid-64bgbn2l></pre> </div> <div class="test" id="test-token" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>3. Token Generation</h3> <button onclick="testToken()" data-astro-cid-64bgbn2l>Test Token API</button> <pre id="token-result" data-astro-cid-64bgbn2l></pre> </div> <div class="test" id="test-search" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>4. Search API</h3> <button onclick="testSearch()" data-astro-cid-64bgbn2l>Test Search API</button> <pre id="search-result" data-astro-cid-64bgbn2l></pre> </div> <div class="test" id="test-voice" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>5. Voice Agent Connection</h3> <button onclick="testVoiceAgent()" data-astro-cid-64bgbn2l>Test Voice Agent</button> <pre id="voice-result" data-astro-cid-64bgbn2l></pre> </div> </div> <script type="module">
        // Make functions global
        window.testEnvironment = async function() {
            const resultEl = document.getElementById('env-result');
            const testEl = document.getElementById('test-env');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/voice-agent/debug-env');
                const data = await response.json();
                
                testEl.className = 'test success';
                resultEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                testEl.className = 'test error';
                resultEl.textContent = \`Error: \${error.message}\`;
            }
        };
        
        window.testHealth = async function() {
            const resultEl = document.getElementById('health-result');
            const testEl = document.getElementById('test-health');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/voice-agent/health');
                const data = await response.json();
                
                testEl.className = data.status === 'healthy' ? 'test success' : 'test error';
                resultEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                testEl.className = 'test error';
                resultEl.textContent = \`Error: \${error.message}\`;
            }
        };
        
        window.testToken = async function() {
            const resultEl = document.getElementById('token-result');
            const testEl = document.getElementById('test-token');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing...';
            
            try {
                console.log('Making token request...');
                const response = await fetch('/api/voice-agent/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: 'test-' + Date.now() })
                });
                
                console.log('Token response status:', response.status);
                const data = await response.json();
                console.log('Token data:', data);
                
                testEl.className = data.success ? 'test success' : 'test error';
                resultEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                console.error('Token error:', error);
                testEl.className = 'test error';
                resultEl.textContent = \`Error: \${error.message}\\n\${error.stack}\`;
            }
        };
        
        window.testSearch = async function() {
            const resultEl = document.getElementById('search-result');
            const testEl = document.getElementById('test-search');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/voice-agent/responses-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: 'test search' })
                });
                
                const data = await response.json();
                
                testEl.className = data.success ? 'test success' : 'test error';
                resultEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                testEl.className = 'test error';
                resultEl.textContent = \`Error: \${error.message}\`;
            }
        };
        
        window.testVoiceAgent = async function() {
            const resultEl = document.getElementById('voice-result');
            const testEl = document.getElementById('test-voice');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing voice agent initialization...';
            
            try {
                // Import voice agent
                const { createWebRTCVoiceAgent } = await import('/src/lib/voice-agent/webrtc/main.ts');
                
                resultEl.textContent += '\\n\u2713 Voice agent module loaded';
                
                // Create agent with explicit configuration
                const agent = createWebRTCVoiceAgent({
                    apiEndpoint: window.location.origin + '/api/voice-agent',
                    maxReconnectAttempts: 1,
                    reconnectDelay: 1000
                });
                
                resultEl.textContent += '\\n\u2713 Voice agent created';
                
                // Set up event listeners
                const events = [];
                agent.on('connectionStateChanged', (state) => {
                    events.push(\`Connection: \${state}\`);
                    resultEl.textContent += \`\\n\u2192 Connection state: \${state}\`;
                });
                
                agent.on('error', (error) => {
                    events.push(\`Error: \${error.message}\`);
                    resultEl.textContent += \`\\n\u2717 Error: \${error.message}\`;
                });
                
                // Try to initialize
                resultEl.textContent += '\\n\u2192 Initializing...';
                await agent.initialize();
                
                resultEl.textContent += '\\n\u2713 Voice agent initialized successfully!';
                testEl.className = 'test success';
                
                // Disconnect after 2 seconds
                setTimeout(() => {
                    agent.disconnect();
                    resultEl.textContent += '\\n\u2192 Voice agent disconnected';
                }, 2000);
                
            } catch (error) {
                console.error('Voice agent error:', error);
                testEl.className = 'test error';
                resultEl.textContent += \`\\n\u2717 Failed: \${error.message}\\n\${error.stack}\`;
            }
        };
        
        // Auto-run environment test on load
        window.addEventListener('load', () => {
            window.testEnvironment();
        });
    <\/script> </body> </html>`], ["<html data-astro-cid-64bgbn2l> <head><title>Voice Agent Diagnostic</title>", `</head> <body data-astro-cid-64bgbn2l> <h1 data-astro-cid-64bgbn2l>Voice Agent Connection Diagnostic</h1> <div id="tests" data-astro-cid-64bgbn2l> <div class="test" id="test-env" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>1. Environment Check</h3> <button onclick="testEnvironment()" data-astro-cid-64bgbn2l>Test Environment</button> <pre id="env-result" data-astro-cid-64bgbn2l></pre> </div> <div class="test" id="test-health" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>2. Health Check</h3> <button onclick="testHealth()" data-astro-cid-64bgbn2l>Test Health API</button> <pre id="health-result" data-astro-cid-64bgbn2l></pre> </div> <div class="test" id="test-token" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>3. Token Generation</h3> <button onclick="testToken()" data-astro-cid-64bgbn2l>Test Token API</button> <pre id="token-result" data-astro-cid-64bgbn2l></pre> </div> <div class="test" id="test-search" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>4. Search API</h3> <button onclick="testSearch()" data-astro-cid-64bgbn2l>Test Search API</button> <pre id="search-result" data-astro-cid-64bgbn2l></pre> </div> <div class="test" id="test-voice" data-astro-cid-64bgbn2l> <h3 data-astro-cid-64bgbn2l>5. Voice Agent Connection</h3> <button onclick="testVoiceAgent()" data-astro-cid-64bgbn2l>Test Voice Agent</button> <pre id="voice-result" data-astro-cid-64bgbn2l></pre> </div> </div> <script type="module">
        // Make functions global
        window.testEnvironment = async function() {
            const resultEl = document.getElementById('env-result');
            const testEl = document.getElementById('test-env');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/voice-agent/debug-env');
                const data = await response.json();
                
                testEl.className = 'test success';
                resultEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                testEl.className = 'test error';
                resultEl.textContent = \\\`Error: \\\${error.message}\\\`;
            }
        };
        
        window.testHealth = async function() {
            const resultEl = document.getElementById('health-result');
            const testEl = document.getElementById('test-health');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/voice-agent/health');
                const data = await response.json();
                
                testEl.className = data.status === 'healthy' ? 'test success' : 'test error';
                resultEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                testEl.className = 'test error';
                resultEl.textContent = \\\`Error: \\\${error.message}\\\`;
            }
        };
        
        window.testToken = async function() {
            const resultEl = document.getElementById('token-result');
            const testEl = document.getElementById('test-token');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing...';
            
            try {
                console.log('Making token request...');
                const response = await fetch('/api/voice-agent/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: 'test-' + Date.now() })
                });
                
                console.log('Token response status:', response.status);
                const data = await response.json();
                console.log('Token data:', data);
                
                testEl.className = data.success ? 'test success' : 'test error';
                resultEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                console.error('Token error:', error);
                testEl.className = 'test error';
                resultEl.textContent = \\\`Error: \\\${error.message}\\\\n\\\${error.stack}\\\`;
            }
        };
        
        window.testSearch = async function() {
            const resultEl = document.getElementById('search-result');
            const testEl = document.getElementById('test-search');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/voice-agent/responses-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: 'test search' })
                });
                
                const data = await response.json();
                
                testEl.className = data.success ? 'test success' : 'test error';
                resultEl.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                testEl.className = 'test error';
                resultEl.textContent = \\\`Error: \\\${error.message}\\\`;
            }
        };
        
        window.testVoiceAgent = async function() {
            const resultEl = document.getElementById('voice-result');
            const testEl = document.getElementById('test-voice');
            testEl.className = 'test pending';
            resultEl.textContent = 'Testing voice agent initialization...';
            
            try {
                // Import voice agent
                const { createWebRTCVoiceAgent } = await import('/src/lib/voice-agent/webrtc/main.ts');
                
                resultEl.textContent += '\\\\n\u2713 Voice agent module loaded';
                
                // Create agent with explicit configuration
                const agent = createWebRTCVoiceAgent({
                    apiEndpoint: window.location.origin + '/api/voice-agent',
                    maxReconnectAttempts: 1,
                    reconnectDelay: 1000
                });
                
                resultEl.textContent += '\\\\n\u2713 Voice agent created';
                
                // Set up event listeners
                const events = [];
                agent.on('connectionStateChanged', (state) => {
                    events.push(\\\`Connection: \\\${state}\\\`);
                    resultEl.textContent += \\\`\\\\n\u2192 Connection state: \\\${state}\\\`;
                });
                
                agent.on('error', (error) => {
                    events.push(\\\`Error: \\\${error.message}\\\`);
                    resultEl.textContent += \\\`\\\\n\u2717 Error: \\\${error.message}\\\`;
                });
                
                // Try to initialize
                resultEl.textContent += '\\\\n\u2192 Initializing...';
                await agent.initialize();
                
                resultEl.textContent += '\\\\n\u2713 Voice agent initialized successfully!';
                testEl.className = 'test success';
                
                // Disconnect after 2 seconds
                setTimeout(() => {
                    agent.disconnect();
                    resultEl.textContent += '\\\\n\u2192 Voice agent disconnected';
                }, 2000);
                
            } catch (error) {
                console.error('Voice agent error:', error);
                testEl.className = 'test error';
                resultEl.textContent += \\\`\\\\n\u2717 Failed: \\\${error.message}\\\\n\\\${error.stack}\\\`;
            }
        };
        
        // Auto-run environment test on load
        window.addEventListener('load', () => {
            window.testEnvironment();
        });
    <\/script> </body> </html>`])), renderHead());
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-diagnostic.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/voice-diagnostic.astro";
const $$url = "/voice-diagnostic";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$VoiceDiagnostic,
    file: $$file,
    prerender,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
