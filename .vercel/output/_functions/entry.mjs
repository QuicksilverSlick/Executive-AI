import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BEroGKja.mjs';
import { manifest } from './manifest_CoHZ12EK.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/ai-audit.astro.mjs');
const _page3 = () => import('./pages/api/debug.astro.mjs');
const _page4 = () => import('./pages/api/dev/clear-rate-limits.astro.mjs');
const _page5 = () => import('./pages/api/download-resource.astro.mjs');
const _page6 = () => import('./pages/api/health.astro.mjs');
const _page7 = () => import('./pages/api/simple.astro.mjs');
const _page8 = () => import('./pages/api/test.astro.mjs');
const _page9 = () => import('./pages/api/test-search.astro.mjs');
const _page10 = () => import('./pages/api/test-voice.astro.mjs');
const _page11 = () => import('./pages/api/vercel-test.astro.mjs');
const _page12 = () => import('./pages/api/voice-agent/chat-fallback.astro.mjs');
const _page13 = () => import('./pages/api/voice-agent/compatibility.astro.mjs');
const _page14 = () => import('./pages/api/voice-agent/debug-env.astro.mjs');
const _page15 = () => import('./pages/api/voice-agent/demo.astro.mjs');
const _page16 = () => import('./pages/api/voice-agent/health.astro.mjs');
const _page17 = () => import('./pages/api/voice-agent/proxy.astro.mjs');
const _page18 = () => import('./pages/api/voice-agent/refresh-token.astro.mjs');
const _page19 = () => import('./pages/api/voice-agent/responses-search.astro.mjs');
const _page20 = () => import('./pages/api/voice-agent/secure-token.astro.mjs');
const _page21 = () => import('./pages/api/voice-agent/simple-search.astro.mjs');
const _page22 = () => import('./pages/api/voice-agent/test-connection.astro.mjs');
const _page23 = () => import('./pages/api/voice-agent/token.astro.mjs');
const _page24 = () => import('./pages/case-studies.astro.mjs');
const _page25 = () => import('./pages/contact.astro.mjs');
const _page26 = () => import('./pages/design-showcase.astro.mjs');
const _page27 = () => import('./pages/privacy.astro.mjs');
const _page28 = () => import('./pages/resources.astro.mjs');
const _page29 = () => import('./pages/services.astro.mjs');
const _page30 = () => import('./pages/terms.astro.mjs');
const _page31 = () => import('./pages/test-audio.astro.mjs');
const _page32 = () => import('./pages/test-direct-token.astro.mjs');
const _page33 = () => import('./pages/test-page.astro.mjs');
const _page34 = () => import('./pages/test-production.astro.mjs');
const _page35 = () => import('./pages/test-search-acknowledgment.astro.mjs');
const _page36 = () => import('./pages/test-voice-chat.astro.mjs');
const _page37 = () => import('./pages/test-voice-search.astro.mjs');
const _page38 = () => import('./pages/thank-you.astro.mjs');
const _page39 = () => import('./pages/voice-agent-compatibility-test.astro.mjs');
const _page40 = () => import('./pages/voice-agent-test.astro.mjs');
const _page41 = () => import('./pages/voice-diagnostic.astro.mjs');
const _page42 = () => import('./pages/voice-test-webrtc.astro.mjs');
const _page43 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/ai-audit.astro", _page2],
    ["src/pages/api/debug.ts", _page3],
    ["src/pages/api/dev/clear-rate-limits.ts", _page4],
    ["src/pages/api/download-resource.js", _page5],
    ["src/pages/api/health.ts", _page6],
    ["src/pages/api/simple.js", _page7],
    ["src/pages/api/test.ts", _page8],
    ["src/pages/api/test-search.ts", _page9],
    ["src/pages/api/test-voice.ts", _page10],
    ["src/pages/api/vercel-test.ts", _page11],
    ["src/pages/api/voice-agent/chat-fallback.ts", _page12],
    ["src/pages/api/voice-agent/compatibility.ts", _page13],
    ["src/pages/api/voice-agent/debug-env.ts", _page14],
    ["src/pages/api/voice-agent/demo.ts", _page15],
    ["src/pages/api/voice-agent/health.ts", _page16],
    ["src/pages/api/voice-agent/proxy.ts", _page17],
    ["src/pages/api/voice-agent/refresh-token.ts", _page18],
    ["src/pages/api/voice-agent/responses-search.ts", _page19],
    ["src/pages/api/voice-agent/secure-token.ts", _page20],
    ["src/pages/api/voice-agent/simple-search.ts", _page21],
    ["src/pages/api/voice-agent/test-connection.ts", _page22],
    ["src/pages/api/voice-agent/token.ts", _page23],
    ["src/pages/case-studies.astro", _page24],
    ["src/pages/contact.astro", _page25],
    ["src/pages/design-showcase.astro", _page26],
    ["src/pages/privacy.astro", _page27],
    ["src/pages/resources.astro", _page28],
    ["src/pages/services.astro", _page29],
    ["src/pages/terms.astro", _page30],
    ["src/pages/test-audio.astro", _page31],
    ["src/pages/test-direct-token.astro", _page32],
    ["src/pages/test-page.astro", _page33],
    ["src/pages/test-production.html", _page34],
    ["src/pages/test-search-acknowledgment.astro", _page35],
    ["src/pages/test-voice-chat.astro", _page36],
    ["src/pages/test-voice-search.astro", _page37],
    ["src/pages/thank-you.astro", _page38],
    ["src/pages/voice-agent-compatibility-test.astro", _page39],
    ["src/pages/voice-agent-test.astro", _page40],
    ["src/pages/voice-diagnostic.astro", _page41],
    ["src/pages/voice-test-webrtc.astro", _page42],
    ["src/pages/index.astro", _page43]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "43a9c553-d6bc-4253-9368-6ad72c1a5469",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
