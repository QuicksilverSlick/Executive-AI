import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../_astro/astro/server.DAk61OsX.js';
import 'kleur/colors';
import { $ as $$Layout } from '../_astro/Layout.Dz-ECntR.js';
import { $ as $$Button } from '../_astro/Button.C3I3YVj5.js';
import { $ as $$AnimatedSection } from '../_astro/AnimatedSection.fHVqQ-iE.js';
export { renderers } from '../renderers.mjs';

const $$ThankYou = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Thank You - Resources Sent!", "description": "Your AI transformation resources have been sent. Check your email for instant access.", "noindex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="pt-32 pb-20"> <div class="container-narrow"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade" }, { "default": ($$result3) => renderTemplate` <div class="max-w-2xl mx-auto text-center"> <div class="mb-8"> <svg class="w-24 h-24 text-green-500 mx-auto mb-6" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg> <h1 class="text-4xl md:text-5xl font-bold text-brand-charcoal mb-4">
Check Your Email!
</h1> <p class="text-xl text-gray-700 mb-8">
We've sent your AI transformation resources to your inbox. 
              They should arrive within the next 2-3 minutes.
</p> </div> <div class="bg-gray-50 rounded-lg p-6 mb-8"> <h2 class="text-lg font-semibold text-brand-charcoal mb-3">
🎯 While You Wait, Here's Your Next Step:
</h2> <p class="text-gray-700 mb-4">
Watch this 3-minute video where I explain the #1 mistake executives make 
              when implementing AI (and how to avoid it).
</p> <div class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4"> <!-- Video embed would go here --> <div class="flex items-center justify-center h-48"> <span class="text-gray-500">[Video Player Placeholder]</span> </div> </div> </div> <div class="bg-brand-blue text-white rounded-lg p-8 mb-8"> <h2 class="text-2xl font-bold mb-4">
Ready to Accelerate Your AI Journey?
</h2> <p class="text-lg mb-6">
The resources you just downloaded are powerful, but nothing beats 
              personalized guidance. Let's discuss your specific AI opportunities.
</p> ${renderComponent($$result3, "Button", $$Button, { "size": "lg", "class": "calendly-trigger !bg-white !text-brand-blue hover:!bg-gray-100" }, { "default": ($$result4) => renderTemplate`
Schedule Your Free Strategy Session
` })} </div> <div class="text-left bg-white rounded-lg shadow-md p-6"> <h3 class="font-semibold text-brand-charcoal mb-3">
📧 Didn't receive your resources?
</h3> <ol class="space-y-2 text-gray-700 text-sm"> <li>1. Check your spam/promotions folder</li> <li>2. Add russell@executiveaitraining.com to your contacts</li> <li>3. Still nothing? <a href="mailto:support@executiveaitraining.com" class="text-brand-blue hover:underline">Email our support team</a></li> </ol> </div> </div> ` })} </div> </section> ${renderScript($$result2, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/thank-you.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/thank-you.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/thank-you.astro";
const $$url = "/thank-you";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ThankYou,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
