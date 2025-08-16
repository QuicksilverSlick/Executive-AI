/* empty css                                 */
import { e as createComponent, m as maybeRenderHead, k as renderComponent, r as renderTemplate, l as renderScript, h as addAttribute } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import { a as $$Icon, $ as $$Layout } from '../chunks/Layout_7UizUh1a.mjs';
import { $ as $$Button } from '../chunks/Button_DEO6jh-a.mjs';
/* empty css                                 */
import { $ as $$AnimatedSection } from '../chunks/AnimatedSection_BzMoGi4H.mjs';
export { renderers } from '../renderers.mjs';

const $$HeroSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="section-padding bg-gradient-to-br from-brand-pearl to-gray-50 dark:from-dark-base dark:to-dark-surface relative overflow-hidden" data-astro-cid-nlow4r3u> <!-- Background decoration --> <div class="absolute inset-0 pointer-events-none" data-astro-cid-nlow4r3u> <div class="absolute top-0 right-0 w-96 h-96 bg-brand-navy/5 rounded-full blur-3xl" data-astro-cid-nlow4r3u></div> <div class="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" data-astro-cid-nlow4r3u></div> </div> <div class="container-narrow relative z-10" data-astro-cid-nlow4r3u> <div class="max-w-4xl mx-auto text-center" data-astro-cid-nlow4r3u> <div id="hero-content" data-astro-cid-nlow4r3u> <h1 class="text-4xl md:text-6xl font-bold text-brand-charcoal dark:text-dark-text mb-8 leading-tight" data-astro-cid-nlow4r3u> <span class="hero-line-1 opacity-0 block pb-2" data-astro-cid-nlow4r3u>Stop Falling Behind.</span> <span class="block text-gradient hero-line-2 opacity-0 mt-2 pb-2" data-astro-cid-nlow4r3u>Start Dominating.</span> </h1> <p class="text-xl md:text-2xl text-gray-700 dark:text-dark-text-secondary mb-8 hero-description opacity-0 px-4 sm:px-0" data-astro-cid-nlow4r3u>
Our Private, Customized One on One AI Masterclass gives leaders the decisive competitive edge. 
          In weeks, you'll move from AI confusion to complete confidence.
</p> <div class="flex flex-col md:flex-row gap-4 justify-center hero-buttons opacity-0 px-4 sm:px-0" data-astro-cid-nlow4r3u> ${renderComponent($$result, "Button", $$Button, { "href": "#schedule", "size": "lg", "icon": "lucide:calendar", "class": "calendly-trigger transform hover:scale-105 transition-all duration-300 w-full md:w-auto text-center justify-center whitespace-normal md:whitespace-nowrap md:min-w-[280px]", "data-astro-cid-nlow4r3u": true }, { "default": ($$result2) => renderTemplate` <span class="hidden sm:inline" data-astro-cid-nlow4r3u>Schedule Your Custom Strategy Session</span> <span class="sm:hidden" data-astro-cid-nlow4r3u>Schedule Strategy Session</span> ` })} ${renderComponent($$result, "Button", $$Button, { "href": "#audit", "variant": "outline", "size": "lg", "icon": "lucide:clipboard-check", "class": "transform hover:scale-105 transition-all duration-300 w-full md:w-auto text-center justify-center whitespace-normal md:whitespace-nowrap md:min-w-[280px]", "data-astro-cid-nlow4r3u": true }, { "default": ($$result2) => renderTemplate` <span class="hidden sm:inline" data-astro-cid-nlow4r3u>Take the 2-minute AI Opportunity Audit</span> <span class="sm:hidden" data-astro-cid-nlow4r3u>Take AI Audit</span> ` })} </div> </div> <!-- Trust indicators --> <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600 dark:text-dark-text-tertiary hero-trust opacity-0" data-astro-cid-nlow4r3u> <div class="flex items-center gap-3" data-astro-cid-nlow4r3u> ${renderComponent($$result, "Icon", $$Icon, { "name": "lucide:lock", "size": 24, "class": "text-brand-gold dark:text-accent-gold flex-shrink-0", "data-astro-cid-nlow4r3u": true })} <span class="text-center sm:text-left" data-astro-cid-nlow4r3u>100% Private & Confidential</span> </div> <div class="flex items-center gap-3" data-astro-cid-nlow4r3u> ${renderComponent($$result, "Icon", $$Icon, { "name": "lucide:shield-check", "size": 24, "class": "text-brand-gold dark:text-accent-gold flex-shrink-0", "data-astro-cid-nlow4r3u": true })} <span class="text-center sm:text-left" data-astro-cid-nlow4r3u>Money-Back Guarantee</span> </div> </div> </div> </div> </section> `;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/components/HeroSection.astro", void 0);

const $$CredibilityBar = createComponent(($$result, $$props, $$slots) => {
  const clients = [
    {
      name: "QuantumLeap Capital",
      icon: "lucide:trending-up",
      type: "Private Equity",
      delay: "0s"
    },
    {
      name: "Summit Health Alliance",
      icon: "lucide:heart-pulse",
      type: "Healthcare",
      delay: "0.1s"
    },
    {
      name: "Apex Logistics",
      icon: "lucide:truck",
      type: "Supply Chain",
      delay: "0.2s"
    },
    {
      name: "InnovateTech Solutions",
      icon: "lucide:cpu",
      type: "Technology",
      delay: "0.3s"
    }
  ];
  const formatName = (name, isMobile = false) => {
    const words = name.split(" ");
    if (isMobile && words.length >= 2) {
      if (words.length === 2) {
        return {
          line1: words[0],
          line2: words[1]
        };
      } else if (words.length === 3) {
        return {
          line1: words.slice(0, 2).join(" "),
          line2: words[2]
        };
      }
    }
    if (!isMobile && words.length === 3) {
      return {
        line1: words.slice(0, 2).join(" "),
        line2: words[2]
      };
    }
    return {
      line1: name,
      line2: null
    };
  };
  return renderTemplate`${maybeRenderHead()}<section class="py-16 bg-brand-pearl dark:bg-dark-surface border-y border-gray-100 dark:border-dark-border overflow-hidden" data-astro-cid-y3v2qqfv> <div class="container-narrow" data-astro-cid-y3v2qqfv> <h3 class="text-center text-lg font-semibold text-gray-600 dark:text-dark-text-secondary mb-10 opacity-0 credibility-title uppercase tracking-wide" data-astro-cid-y3v2qqfv>
Trusted by industry leaders across sectors
</h3> <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto" data-astro-cid-y3v2qqfv> ${clients.map((client) => {
    const formattedName = formatName(client.name, true);
    return renderTemplate`<div class="group flex flex-col items-center gap-4 opacity-0 credibility-logo"${addAttribute(`animation-delay: ${client.delay}`, "style")} data-astro-cid-y3v2qqfv>  <div class="text-center min-h-[3rem] flex items-center justify-center px-2" data-astro-cid-y3v2qqfv> ${formattedName.line2 ? renderTemplate`<div data-astro-cid-y3v2qqfv> <p class="text-base font-bold text-gray-800 dark:text-dark-text group-hover:text-brand-navy dark:group-hover:text-accent-gold transition-colors leading-5" data-astro-cid-y3v2qqfv> ${formattedName.line1} </p> <p class="text-base font-bold text-gray-800 dark:text-dark-text group-hover:text-brand-navy dark:group-hover:text-accent-gold transition-colors leading-5" data-astro-cid-y3v2qqfv> ${formattedName.line2} </p> </div>` : renderTemplate`<p class="text-base font-bold text-gray-800 dark:text-dark-text group-hover:text-brand-navy dark:group-hover:text-accent-gold transition-colors" data-astro-cid-y3v2qqfv> ${formattedName.line1} </p>`} </div>  <div class="flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-white dark:bg-dark-surface-3 border-2 border-gray-200 dark:border-dark-border group-hover:bg-brand-navy/5 dark:group-hover:bg-accent-gold/10 group-hover:border-brand-navy/30 dark:group-hover:border-accent-gold/30 transition-all duration-300 shadow-sm group-hover:shadow-lg p-4" data-astro-cid-y3v2qqfv> ${renderComponent($$result, "Icon", $$Icon, { "name": client.icon, "class": "w-12 h-12 text-gray-600 dark:text-dark-text-secondary group-hover:text-brand-navy dark:group-hover:text-accent-gold transition-colors mb-2", "data-astro-cid-y3v2qqfv": true })} <p class="text-xs font-medium text-gray-600 dark:text-dark-text-tertiary text-center leading-4" data-astro-cid-y3v2qqfv> ${client.type} </p> </div> </div>`;
  })} </div> </div> </section>  ${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/components/CredibilityBar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/components/CredibilityBar.astro", void 0);

const $$ResourceCTA = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="section-padding bg-gradient-to-br from-brand-charcoal to-gray-900 dark:from-dark-surface-2 dark:to-dark-surface text-white"> <div class="container-narrow"> ${renderComponent($$result, "AnimatedSection", $$AnimatedSection, { "animate": "scale" }, { "default": ($$result2) => renderTemplate` <div class="max-w-4xl mx-auto text-center"> <div class="mb-8"> <span class="inline-block bg-brand-gold dark:bg-accent-gold text-brand-charcoal dark:text-dark-base px-4 py-1 rounded-full text-sm font-semibold mb-4">
FREE RESOURCES
</span> <h2 class="text-3xl md:text-4xl font-bold mb-4">
Get $4,700 Worth of AI Resources—Free
</h2> <p class="text-xl text-gray-300 dark:text-dark-text-secondary mb-8 px-4 sm:px-0">
The same tools and templates we use in our $15,000 masterclass. 
            Instant access to assessments, playbooks, and ROI calculators.
</p> </div> <div class="grid md:grid-cols-3 gap-6 mb-8"> <div class="bg-white/10 dark:bg-dark-surface-3/70 rounded-lg p-4 border border-white/20 dark:border-dark-border"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "lucide:bar-chart-3", "class": "w-8 h-8 text-brand-gold dark:text-accent-gold mb-2" })} <h3 class="font-semibold mb-1 text-white">AI Readiness Assessment</h3> <p class="text-sm text-gray-300 dark:text-dark-text-tertiary">50-point evaluation tool</p> </div> <div class="bg-white/10 dark:bg-dark-surface-3/70 rounded-lg p-4 border border-white/20 dark:border-dark-border"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "lucide:book-open", "class": "w-8 h-8 text-brand-gold dark:text-accent-gold mb-2" })} <h3 class="font-semibold mb-1 text-white">Executive AI Playbook</h3> <p class="text-sm text-gray-300 dark:text-dark-text-tertiary">47-page implementation guide</p> </div> <div class="bg-white/10 dark:bg-dark-surface-3/70 rounded-lg p-4 border border-white/20 dark:border-dark-border"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "lucide:calculator", "class": "w-8 h-8 text-brand-gold dark:text-accent-gold mb-2" })} <h3 class="font-semibold mb-1 text-white">ROI Calculator</h3> <p class="text-sm text-gray-300 dark:text-dark-text-tertiary">Calculate your AI savings</p> </div> </div> ${renderComponent($$result2, "Button", $$Button, { "href": "/resources", "size": "lg", "class": "!bg-brand-gold !text-brand-charcoal hover:!bg-brand-gold-warm w-full sm:w-auto" }, { "default": ($$result3) => renderTemplate`
Get Free Resources Now
` })} <p class="text-sm text-gray-400 dark:text-dark-text-muted mt-4">
No credit card required • Instant access • 2,847 executives already downloaded
</p> </div> ` })} </div> </section>`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/components/ResourceCTA.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Executive AI Training",
    "description": "Transform from overwhelmed observer to Master of Synthetic Intelligence\u2122 with our private custom AI masterclass for executives.",
    "url": "https://executiveaitraining.com",
    "telephone": "+1-XXX-XXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "priceRange": "$$$",
    "offers": [
      {
        "@type": "Offer",
        "name": "Executive AI Masterclass",
        "price": "15000",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "47"
    }
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Stop Falling Behind. Start Dominating.", "schema": schema }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(["  ", "  ", "  ", '<section class="section-padding"> <div class="container-narrow"> ', ` </div> </section>  <section class="section-padding bg-gray-50 dark:bg-dark-surface"> <div class="container-narrow"> <div class="max-w-4xl mx-auto"> <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-12 text-center px-4 sm:px-0">
The AI Dominance Blueprint: Your Path to Mastery.
</h2> <div class="grid md:grid-cols-3 gap-8"> <div class="bg-white dark:bg-dark-surface-2 p-8 rounded-lg shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-dark-border"> <div class="text-5xl font-bold text-brand-gold dark:text-accent-gold mb-4">1</div> <h3 class="text-xl font-semibold mb-3 text-brand-charcoal dark:text-dark-text">Schedule Your AI Strategy Call</h3> <p class="text-gray-700 dark:text-dark-text-tertiary">
A no-risk, deep-dive into your specific business challenges and opportunities.
</p> </div> <div class="bg-white dark:bg-dark-surface-2 p-8 rounded-lg shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-dark-border"> <div class="text-5xl font-bold text-brand-gold dark:text-accent-gold mb-4">2</div> <h3 class="text-xl font-semibold mb-3 text-brand-charcoal dark:text-dark-text">Attend Your Custom AI Masterclass</h3> <p class="text-gray-700 dark:text-dark-text-tertiary">
A personalized education\u2014no generic fluff\u2014focused entirely on your objectives.
</p> </div> <div class="bg-white dark:bg-dark-surface-2 p-8 rounded-lg shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-dark-border"> <div class="text-5xl font-bold text-brand-gold dark:text-accent-gold mb-4">3</div> <h3 class="text-xl font-semibold mb-3 text-brand-charcoal dark:text-dark-text">Dominate Your Market</h3> <p class="text-gray-700 dark:text-dark-text-tertiary">
Implement your new strategy with confidence and watch your productivity and profitability soar.
</p> </div> </div> </div> </div> </section>  <section class="section-padding"> <div class="container-narrow"> <div class="max-w-4xl mx-auto"> <div class="grid md:grid-cols-2 gap-12 items-center"> <div> <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-6 px-4 md:px-0">
You Don't Need Another Course. You Need a Guide.
</h2> <p class="text-lg text-gray-700 dark:text-dark-text-secondary mb-6 leading-relaxed px-4 md:px-0">
I understand the feeling of being a successful leader, yet feeling completely overwhelmed 
              by the AI curve. For nearly a decade, I've personally guided executives like you, 
              translating complex AI capabilities into tangible business results. We've been in the 
              trenches, and we'll equip you for victory.
</p> </div> <div class="bg-brand-navy dark:bg-dark-surface-3 text-white p-8 rounded-lg border border-transparent dark:border-dark-border"> <div class="mb-4"> `, ` </div> <p class="text-lg italic mb-4">
"In six weeks, we went from AI confusion to deploying a strategy that put us two years 
              ahead of our competition. Russell doesn't just teach; he delivers a decisive edge."
</p> <p class="font-semibold">
\u2013 Jane Doe, CTO, Innovate Dynamics
</p> </div> </div> </div> </div> </section>  <section id="audit" class="section-padding bg-gray-50 dark:bg-dark-surface"> <div class="container-narrow"> <div class="max-w-3xl mx-auto text-center"> <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-6 px-4 sm:px-0">
Discover Your #1 AI Opportunity\u2014In 2 Minutes.
</h2> <p class="text-lg text-gray-700 dark:text-dark-text-secondary mb-8 px-4 sm:px-0">
Not ready for a full strategy session? Take our complimentary AI Opportunity Audit. 
          Answer a few strategic questions and instantly receive a personalized brief highlighting 
          the most profitable area to deploy AI in your business first.
</p> `, " </div> </div> </section>  ", '  <section id="schedule" class="section-padding bg-brand-charcoal dark:bg-dark-surface-2 text-white"> <div class="container-narrow"> <div class="max-w-3xl mx-auto text-center"> <h2 class="text-3xl md:text-4xl font-bold mb-6 px-4 sm:px-0">\nThe Future is Being Built Now. Will You Lead or Follow?\n</h2> <p class="text-xl mb-8 text-gray-300 dark:text-dark-text-secondary px-4 sm:px-0">\nThe window of opportunity to gain a massive AI advantage is closing. \n          Secure your position as an industry leader.\n</p> ', ' </div> </div> </section>  <script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async><\/script> ', " "])), renderComponent($$result2, "HeroSection", $$HeroSection, {}), renderComponent($$result2, "CredibilityBar", $$CredibilityBar, {}), maybeRenderHead(), renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide" }, { "default": ($$result3) => renderTemplate` <div class="max-w-3xl mx-auto text-center"> <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-6 px-4 sm:px-0">
The Cost of Waiting is Irrelevance.
</h2> <p class="text-lg text-gray-700 dark:text-dark-text-secondary leading-relaxed px-4 sm:px-0">
Every day you delay, your competitors are getting faster. They're leveraging AI to capture 
            market share that should be yours, making their teams orders of magnitude more productive 
            while you're stuck in meetings. This isn't just a technology gap—it's an existential threat.
</p> </div> ` }), renderComponent($$result2, "Icon", $$Icon, { "name": "lucide:quote", "class": "w-12 h-12 text-brand-gold dark:text-accent-gold" }), renderComponent($$result2, "Button", $$Button, { "href": "/ai-audit", "size": "lg", "variant": "secondary", "class": "w-full sm:w-auto" }, { "default": ($$result3) => renderTemplate`
Access the AI Opportunity Audit
` }), renderComponent($$result2, "ResourceCTA", $$ResourceCTA, {}), renderComponent($$result2, "Button", $$Button, { "href": "#", "size": "lg", "class": "calendly-trigger w-full sm:w-auto" }, { "default": ($$result3) => renderTemplate` <span class="hidden sm:inline">Schedule Your Custom Strategy Session</span> <span class="sm:hidden">Schedule Strategy Session</span> ` }), renderScript($$result2, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/index.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/index.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
