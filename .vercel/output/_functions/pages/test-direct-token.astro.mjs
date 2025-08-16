/* empty css                                 */
import { e as createComponent, ak as renderHead, l as renderScript, r as renderTemplate } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$TestDirectToken = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`<html> <head><title>Direct Token Test</title>${renderHead()}</head> <body> <h1>Direct Token Test</h1> <button id="test">Test Token Endpoint</button> <pre id="output"></pre> ${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-direct-token.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-direct-token.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/test-direct-token.astro";
const $$url = "/test-direct-token";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$TestDirectToken,
    file: $$file,
    prerender,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
