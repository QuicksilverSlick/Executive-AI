/* empty css                                 */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Icon } from '../chunks/Layout_7UizUh1a.mjs';
import { $ as $$Button } from '../chunks/Button_DEO6jh-a.mjs';
import { $ as $$AnimatedSection } from '../chunks/AnimatedSection_BzMoGi4H.mjs';
/* empty css                                     */
export { renderers } from '../renderers.mjs';

const $$Resources = createComponent(async ($$result, $$props, $$slots) => {
  const resources = [
    {
      id: "ai-readiness-assessment",
      title: "AI Readiness Assessment Tool",
      description: "Evaluate your organization's preparedness for AI implementation with our comprehensive 50-point assessment.",
      type: "Tool",
      icon: "lucide:bar-chart-3",
      value: "$2,500",
      gated: true,
      popular: true
    },
    {
      id: "executive-ai-playbook",
      title: "The Executive AI Playbook",
      description: "47-page guide covering AI strategy, implementation roadmaps, and ROI calculation frameworks.",
      type: "Guide",
      icon: "lucide:book-open",
      value: "$997",
      gated: true,
      popular: true
    },
    {
      id: "ai-vendor-comparison",
      title: "AI Vendor Comparison Matrix",
      description: "Side-by-side comparison of 25+ enterprise AI platforms with pricing, features, and use cases.",
      type: "Spreadsheet",
      icon: "lucide:table",
      value: "$497",
      gated: true,
      popular: false
    },
    {
      id: "prompting-templates",
      title: "Executive Prompting Templates",
      description: "Battle-tested prompts for strategy, analysis, and decision-making across 15 business functions.",
      type: "Templates",
      icon: "lucide:file-text",
      value: "$297",
      gated: true,
      popular: false
    },
    {
      id: "ai-glossary",
      title: "AI Terms Every Executive Should Know",
      description: "Demystify AI jargon with our plain-English glossary of 100+ essential terms.",
      type: "Reference",
      icon: "lucide:book",
      value: "Free",
      gated: false,
      popular: false
    },
    {
      id: "roi-calculator",
      title: "AI ROI Calculator",
      description: "Calculate potential savings and efficiency gains from AI implementation in your organization.",
      type: "Calculator",
      icon: "lucide:calculator",
      value: "$197",
      gated: true,
      popular: true
    }
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "AI Resources for Executives",
    "description": "Premium tools, guides, and templates to accelerate your AI transformation journey.",
    "url": "https://executiveaitraining.com/resources",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": resources.map((resource, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "DigitalDocument",
          "name": resource.title,
          "description": resource.description,
          "offers": {
            "@type": "Offer",
            "price": resource.value === "Free" ? "0" : resource.value.replace("$", "").replace(",", ""),
            "priceCurrency": "USD"
          }
        }
      }))
    }
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "AI Resources for Executives", "description": "Premium tools, guides, and templates to accelerate your AI transformation journey.", "schema": schema, "data-astro-cid-gauq755v": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="pt-32 pb-16 bg-gradient-to-br from-brand-pearl to-gray-50 dark:from-dark-base dark:to-dark-surface" data-astro-cid-gauq755v> <div class="container-narrow" data-astro-cid-gauq755v> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade", "data-astro-cid-gauq755v": true }, { "default": async ($$result3) => renderTemplate` <div class="text-center max-w-3xl mx-auto" data-astro-cid-gauq755v> <h1 class="text-4xl md:text-6xl font-bold text-brand-charcoal dark:text-dark-text mb-6" data-astro-cid-gauq755v>
Your AI Transformation Toolkit
</h1> <p class="text-xl text-gray-700 dark:text-dark-text-secondary mb-8" data-astro-cid-gauq755v>
Battle-tested resources worth over $4,700. Get instant access to the same tools 
            we use with our $15,000 masterclass clients.
</p> <div class="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600 dark:text-dark-text-tertiary" data-astro-cid-gauq755v> <div class="flex items-center gap-3" data-astro-cid-gauq755v> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:users", "size": 24, "class": "text-brand-gold dark:text-accent-gold flex-shrink-0", "data-astro-cid-gauq755v": true })} <span class="text-center sm:text-left" data-astro-cid-gauq755v>Downloaded by 2,847 executives</span> </div> <div class="flex items-center gap-3" data-astro-cid-gauq755v> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:star", "size": 24, "class": "text-brand-gold dark:text-accent-gold flex-shrink-0", "data-astro-cid-gauq755v": true })} <span class="text-center sm:text-left" data-astro-cid-gauq755v>Average rating: 4.9/5</span> </div> </div> </div> ` })} </div> </section>  <section class="section-padding" data-astro-cid-gauq755v> <div class="container-narrow" data-astro-cid-gauq755v> <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-astro-cid-gauq755v> ${resources.map((resource, index) => renderTemplate`${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "delay": index * 0.1, "data-astro-cid-gauq755v": true }, { "default": async ($$result3) => renderTemplate` <div${addAttribute(`resource-card bg-white dark:bg-dark-surface-2 rounded-lg shadow-lg dark:shadow-black/30 overflow-hidden hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 ${resource.popular ? "ring-2 ring-brand-gold dark:ring-accent-gold" : ""} border border-gray-100 dark:border-dark-border`, "class")} data-astro-cid-gauq755v> ${resource.popular && renderTemplate`<div class="bg-brand-gold dark:bg-accent-gold text-white dark:text-dark-base text-center py-1 text-sm font-semibold" data-astro-cid-gauq755v>
MOST POPULAR
</div>`} <div class="p-6" data-astro-cid-gauq755v> <div class="flex items-start justify-between mb-4" data-astro-cid-gauq755v> <div class="w-12 h-12 bg-brand-navy/10 dark:bg-accent-gold/20 rounded-lg flex items-center justify-center" data-astro-cid-gauq755v> ${renderComponent($$result3, "Icon", $$Icon, { "name": resource.icon, "class": "w-6 h-6 text-brand-navy dark:text-accent-gold", "data-astro-cid-gauq755v": true })} </div> <span class="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wider" data-astro-cid-gauq755v> ${resource.type} </span> </div> <h3 class="text-xl font-bold text-brand-charcoal dark:text-dark-text mb-2" data-astro-cid-gauq755v> ${resource.title} </h3> <p class="text-gray-600 dark:text-dark-text-tertiary mb-4 text-sm leading-relaxed" data-astro-cid-gauq755v> ${resource.description} </p> <div class="flex items-center justify-between mb-4" data-astro-cid-gauq755v> <span class="text-sm text-gray-500 dark:text-dark-text-muted" data-astro-cid-gauq755v>Value:</span> <span class="text-lg font-bold text-brand-charcoal dark:text-dark-text" data-astro-cid-gauq755v>${resource.value}</span> </div> ${resource.gated ? renderTemplate`${renderComponent($$result3, "Button", $$Button, { "href": `#download-${resource.id}`, "class": "w-full justify-center resource-download", "data-resource": resource.id, "data-value": resource.value, "data-astro-cid-gauq755v": true }, { "default": async ($$result4) => renderTemplate`
Get Instant Access
` })}` : renderTemplate`${renderComponent($$result3, "Button", $$Button, { "href": `/downloads/${resource.id}.md`, "variant": "secondary", "class": "w-full justify-center", "download": true, "data-astro-cid-gauq755v": true }, { "default": async ($$result4) => renderTemplate`
Download Free
` })}`} </div> </div> ` })}`)} </div> </div> </section>  <section class="section-padding bg-gray-50 dark:bg-dark-base" data-astro-cid-gauq755v> <div class="container-narrow" data-astro-cid-gauq755v> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade", "data-astro-cid-gauq755v": true }, { "default": async ($$result3) => renderTemplate` <div class="text-center mb-12" data-astro-cid-gauq755v> <h2 class="text-3xl font-bold text-brand-charcoal dark:text-dark-text mb-4" data-astro-cid-gauq755v>
Trusted by Industry Leaders
</h2> <p class="text-lg text-gray-700 dark:text-dark-text-secondary" data-astro-cid-gauq755v>
Join executives from these companies who've transformed their operations with our resources
</p> </div> <div class="grid grid-cols-2 md:grid-cols-4 gap-8 items-center" data-astro-cid-gauq755v> <!-- Tech Company --> <div class="flex flex-col items-center gap-2 group" data-astro-cid-gauq755v> <div class="w-20 h-20 bg-gray-100 dark:bg-dark-surface-3 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-dark-surface-4 transition-colors" data-astro-cid-gauq755v> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:globe-2", "class": "w-10 h-10 text-gray-600 dark:text-dark-text-secondary", "data-astro-cid-gauq755v": true })} </div> <span class="text-sm font-semibold text-gray-600 dark:text-dark-text-tertiary" data-astro-cid-gauq755v>GlobalTech Corp</span> </div> <!-- Finance Company --> <div class="flex flex-col items-center gap-2 group" data-astro-cid-gauq755v> <div class="w-20 h-20 bg-gray-100 dark:bg-dark-surface-3 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-dark-surface-4 transition-colors" data-astro-cid-gauq755v> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:landmark", "class": "w-10 h-10 text-gray-600 dark:text-dark-text-secondary", "data-astro-cid-gauq755v": true })} </div> <span class="text-sm font-semibold text-gray-600 dark:text-dark-text-tertiary" data-astro-cid-gauq755v>Apex Financial</span> </div> <!-- Healthcare Company --> <div class="flex flex-col items-center gap-2 group" data-astro-cid-gauq755v> <div class="w-20 h-20 bg-gray-100 dark:bg-dark-surface-3 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-dark-surface-4 transition-colors" data-astro-cid-gauq755v> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:heart-pulse", "class": "w-10 h-10 text-gray-600 dark:text-dark-text-secondary", "data-astro-cid-gauq755v": true })} </div> <span class="text-sm font-semibold text-gray-600 dark:text-dark-text-tertiary" data-astro-cid-gauq755v>MedLife Group</span> </div> <!-- Manufacturing Company --> <div class="flex flex-col items-center gap-2 group" data-astro-cid-gauq755v> <div class="w-20 h-20 bg-gray-100 dark:bg-dark-surface-3 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-dark-surface-4 transition-colors" data-astro-cid-gauq755v> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:factory", "class": "w-10 h-10 text-gray-600 dark:text-dark-text-secondary", "data-astro-cid-gauq755v": true })} </div> <span class="text-sm font-semibold text-gray-600 dark:text-dark-text-tertiary" data-astro-cid-gauq755v>Industrial Pro</span> </div> </div> ` })} </div> </section>  <section class="section-padding" data-astro-cid-gauq755v> <div class="container-narrow" data-astro-cid-gauq755v> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "data-astro-cid-gauq755v": true }, { "default": async ($$result3) => renderTemplate` <div class="max-w-3xl mx-auto" data-astro-cid-gauq755v> <h2 class="text-3xl font-bold text-brand-charcoal dark:text-dark-text mb-8 text-center" data-astro-cid-gauq755v>
Frequently Asked Questions
</h2> <div class="space-y-6" data-astro-cid-gauq755v> <div class="bg-white dark:bg-dark-surface-2 rounded-lg shadow-md dark:shadow-black/20 p-6 border border-gray-100 dark:border-dark-border" data-astro-cid-gauq755v> <h3 class="text-lg font-semibold text-brand-charcoal dark:text-dark-text mb-2" data-astro-cid-gauq755v>
Are these resources really free?
</h3> <p class="text-gray-700 dark:text-dark-text-secondary" data-astro-cid-gauq755v>
Yes! In exchange for your email, you get instant access to all resources. 
                These are the same materials we use in our paid programs.
</p> </div> <div class="bg-white dark:bg-dark-surface-2 rounded-lg shadow-md dark:shadow-black/20 p-6 border border-gray-100 dark:border-dark-border" data-astro-cid-gauq755v> <h3 class="text-lg font-semibold text-brand-charcoal dark:text-dark-text mb-2" data-astro-cid-gauq755v>
How are these different from generic AI guides?
</h3> <p class="text-gray-700 dark:text-dark-text-secondary" data-astro-cid-gauq755v>
These resources are specifically designed for C-suite executives. 
                No technical jargon, just practical strategies you can implement immediately.
</p> </div> <div class="bg-white dark:bg-dark-surface-2 rounded-lg shadow-md dark:shadow-black/20 p-6 border border-gray-100 dark:border-dark-border" data-astro-cid-gauq755v> <h3 class="text-lg font-semibold text-brand-charcoal dark:text-dark-text mb-2" data-astro-cid-gauq755v>
Do I need technical knowledge to use these?
</h3> <p class="text-gray-700 dark:text-dark-text-secondary" data-astro-cid-gauq755v>
Absolutely not. Everything is written in plain English with step-by-step 
                instructions that any executive can follow.
</p> </div> </div> </div> ` })} </div> </section> ` })} <!-- Email Gate Modal --> <div id="resource-modal" class="fixed inset-0 z-50 hidden" data-astro-cid-gauq755v> <div class="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70" data-astro-cid-gauq755v></div> <div class="relative min-h-screen flex items-center justify-center p-4" data-astro-cid-gauq755v> <div class="bg-white dark:bg-dark-surface-2 rounded-xl shadow-2xl dark:shadow-black/50 max-w-md w-full p-8 transform transition-all border border-gray-100 dark:border-dark-border" data-astro-cid-gauq755v> <button id="close-modal" class="absolute top-4 right-4 text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text" data-astro-cid-gauq755v> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-gauq755v> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-astro-cid-gauq755v></path> </svg> </button> <div class="text-center mb-6" data-astro-cid-gauq755v> <div class="text-5xl mb-4" data-astro-cid-gauq755v>🎁</div> <h3 class="text-2xl font-bold text-brand-charcoal mb-2" data-astro-cid-gauq755v>
Get Instant Access
</h3> <p class="text-gray-700" data-astro-cid-gauq755v>
Enter your email to unlock <span id="resource-value" class="font-semibold" data-astro-cid-gauq755v></span> worth of AI resources
</p> </div> <form id="resource-form" class="space-y-4" data-astro-cid-gauq755v> <input type="hidden" id="resource-id" name="resource_id" data-astro-cid-gauq755v> <div data-astro-cid-gauq755v> <label for="email" class="block text-sm font-medium text-gray-700 mb-1" data-astro-cid-gauq755v>
Email Address
</label> <input type="email" id="email" name="email" required placeholder="your@company.com" class="w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface-4 text-gray-900 dark:text-dark-text rounded-md focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent" data-astro-cid-gauq755v> </div> <div data-astro-cid-gauq755v> <label for="company" class="block text-sm font-medium text-gray-700 mb-1" data-astro-cid-gauq755v>
Company
</label> <input type="text" id="company" name="company" required placeholder="Your Company" class="w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface-4 text-gray-900 dark:text-dark-text rounded-md focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent" data-astro-cid-gauq755v> </div> ${renderComponent($$result, "Button", $$Button, { "type": "submit", "class": "w-full justify-center", "data-astro-cid-gauq755v": true }, { "default": async ($$result2) => renderTemplate`
Send Me The Resources
` })} <p class="text-xs text-gray-500 text-center" data-astro-cid-gauq755v>
We respect your privacy. Unsubscribe at any time.
</p> </form> <div id="success-message" class="hidden text-center" data-astro-cid-gauq755v> <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-gauq755v> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-astro-cid-gauq755v></path> </svg> <h3 class="text-xl font-bold text-brand-charcoal mb-2" data-astro-cid-gauq755v>
Check Your Email!
</h3> <p class="text-gray-700" data-astro-cid-gauq755v>
We've sent your resources to <span id="success-email" class="font-semibold" data-astro-cid-gauq755v></span> </p> </div> </div> </div> </div>  ${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/resources.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/resources.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/resources.astro";
const $$url = "/resources";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Resources,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
