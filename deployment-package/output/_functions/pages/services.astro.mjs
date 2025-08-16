import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../_astro/astro/server.DAk61OsX.js';
import 'kleur/colors';
import { $ as $$Layout, a as $$Icon } from '../_astro/Layout.Dz-ECntR.js';
import { $ as $$Button } from '../_astro/Button.C3I3YVj5.js';
import { $ as $$AnimatedSection } from '../_astro/AnimatedSection.fHVqQ-iE.js';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

const $$Services = createComponent(($$result, $$props, $$slots) => {
  const services = [
    {
      title: "Executive AI Masterclass",
      subtitle: "1-on-1 Private Training",
      price: "$15,000",
      duration: "6 Weeks",
      features: [
        "Personalized curriculum tailored to your industry",
        "Weekly 2-hour private sessions",
        "Direct access to AI implementation strategies",
        "Custom AI tools built for your business",
        "30-day post-training support",
        "ROI guarantee"
      ],
      highlight: true,
      cta: "Schedule Strategy Session"
    },
    {
      title: "AI Leadership Workshop",
      subtitle: "Small Group Training",
      price: "$5,000",
      duration: "3 Days",
      features: [
        "Maximum 8 executives per cohort",
        "Intensive hands-on AI training",
        "Peer learning and networking",
        "AI strategy playbooks",
        "Implementation roadmap",
        "Certificate of completion"
      ],
      highlight: false,
      cta: "View Next Dates"
    },
    {
      title: "AI Advisory Retainer",
      subtitle: "Ongoing Strategic Guidance",
      price: "$10,000/mo",
      duration: "Minimum 3 Months",
      features: [
        "Monthly strategy sessions",
        "Unlimited email consultations",
        "AI vendor evaluation",
        "Team training sessions",
        "Priority support",
        "Quarterly business reviews"
      ],
      highlight: false,
      cta: "Learn More"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "AI Training Services", "data-astro-cid-ucd2ps2b": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="pt-32 pb-16 bg-gradient-to-br from-brand-pearl to-gray-50 dark:from-dark-base dark:to-dark-surface" data-astro-cid-ucd2ps2b> <div class="container-narrow" data-astro-cid-ucd2ps2b> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade", "data-astro-cid-ucd2ps2b": true }, { "default": ($$result3) => renderTemplate` <div class="text-center max-w-3xl mx-auto" data-astro-cid-ucd2ps2b> <h1 class="text-4xl md:text-6xl font-bold text-brand-charcoal dark:text-dark-text mb-6" data-astro-cid-ucd2ps2b>
Transform Your Leadership with
<span class="text-gradient block mt-2" data-astro-cid-ucd2ps2b>Synthetic Intelligence™</span> </h1> <p class="text-xl text-gray-700 dark:text-dark-text-secondary" data-astro-cid-ucd2ps2b>
Private, personalized AI training designed for executives who refuse to be left behind.
</p> </div> ` })} </div> </section>  <section class="section-padding" data-astro-cid-ucd2ps2b> <div class="container-narrow" data-astro-cid-ucd2ps2b> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "data-astro-cid-ucd2ps2b": true }, { "default": ($$result3) => renderTemplate` <div class="grid md:grid-cols-3 gap-8 mb-16" data-astro-cid-ucd2ps2b> ${services.map((service, index) => renderTemplate`<div${addAttribute(`relative bg-white dark:bg-dark-surface-2 rounded-xl shadow-lg dark:shadow-black/30 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-black/40 ${service.highlight ? "ring-2 ring-brand-gold dark:ring-accent-gold" : ""} border border-gray-100 dark:border-dark-border`, "class")}${addAttribute(`animation-delay: ${index * 0.1}s`, "style")}${addAttribute(service.title, "data-service")} data-astro-cid-ucd2ps2b> ${service.highlight && renderTemplate`<div class="absolute top-0 right-0 bg-brand-gold dark:bg-accent-gold text-white dark:text-dark-base px-4 py-1 text-sm font-semibold" data-astro-cid-ucd2ps2b>
MOST POPULAR
</div>`} <div class="p-8" data-astro-cid-ucd2ps2b> <h3 class="text-2xl font-bold text-brand-charcoal dark:text-dark-text mb-2" data-astro-cid-ucd2ps2b> ${service.title} </h3> <p class="text-gray-600 dark:text-dark-text-tertiary mb-4" data-astro-cid-ucd2ps2b>${service.subtitle}</p> <div class="mb-6" data-astro-cid-ucd2ps2b> <span class="text-4xl font-bold text-brand-charcoal dark:text-dark-text" data-astro-cid-ucd2ps2b>${service.price}</span> <span class="text-gray-600 dark:text-dark-text-tertiary ml-2" data-astro-cid-ucd2ps2b>/ ${service.duration}</span> </div> <ul class="space-y-3 mb-8" data-astro-cid-ucd2ps2b> ${service.features.map((feature) => renderTemplate`<li class="flex items-start gap-3" data-astro-cid-ucd2ps2b> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:check-circle", "class": "w-5 h-5 text-brand-gold dark:text-accent-gold mt-0.5 flex-shrink-0", "data-astro-cid-ucd2ps2b": true })} <span class="text-gray-700 dark:text-dark-text-secondary" data-astro-cid-ucd2ps2b>${feature}</span> </li>`)} </ul> ${renderComponent($$result3, "Button", $$Button, { "href": "#schedule", "variant": service.highlight ? "primary" : "secondary", "class": "w-full justify-center calendly-trigger", "data-astro-cid-ucd2ps2b": true }, { "default": ($$result4) => renderTemplate`${service.cta}` })} </div> </div>`)} </div> ` })} <!-- Value Props --> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade", "delay": 0.3, "data-astro-cid-ucd2ps2b": true }, { "default": ($$result3) => renderTemplate` <div class="bg-brand-charcoal dark:bg-dark-surface-2 text-white rounded-xl p-12 text-center border border-transparent dark:border-dark-border" data-astro-cid-ucd2ps2b> <h2 class="text-3xl font-bold mb-8" data-astro-cid-ucd2ps2b>Why Choose Executive AI Training?</h2> <div class="grid md:grid-cols-3 gap-8" data-astro-cid-ucd2ps2b> <div data-astro-cid-ucd2ps2b> <div class="w-16 h-16 mx-auto mb-4 bg-white/10 dark:bg-dark-surface-3/50 rounded-full flex items-center justify-center" data-astro-cid-ucd2ps2b> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:target", "class": "w-8 h-8 text-brand-gold dark:text-accent-gold", "data-astro-cid-ucd2ps2b": true })} </div> <h3 class="text-xl font-semibold mb-2" data-astro-cid-ucd2ps2b>100% Customized</h3> <p class="text-gray-300 dark:text-dark-text-tertiary" data-astro-cid-ucd2ps2b>Every session tailored to your specific business challenges and opportunities.</p> </div> <div data-astro-cid-ucd2ps2b> <div class="w-16 h-16 mx-auto mb-4 bg-white/10 dark:bg-dark-surface-3/50 rounded-full flex items-center justify-center" data-astro-cid-ucd2ps2b> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:lock", "class": "w-8 h-8 text-brand-gold dark:text-accent-gold", "data-astro-cid-ucd2ps2b": true })} </div> <h3 class="text-xl font-semibold mb-2" data-astro-cid-ucd2ps2b>Completely Private</h3> <p class="text-gray-300 dark:text-dark-text-tertiary" data-astro-cid-ucd2ps2b>Your competitive strategies stay confidential. No group sharing required.</p> </div> <div data-astro-cid-ucd2ps2b> <div class="w-16 h-16 mx-auto mb-4 bg-white/10 dark:bg-dark-surface-3/50 rounded-full flex items-center justify-center" data-astro-cid-ucd2ps2b> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:trending-up", "class": "w-8 h-8 text-brand-gold dark:text-accent-gold", "data-astro-cid-ucd2ps2b": true })} </div> <h3 class="text-xl font-semibold mb-2" data-astro-cid-ucd2ps2b>ROI Guaranteed</h3> <p class="text-gray-300 dark:text-dark-text-tertiary" data-astro-cid-ucd2ps2b>We guarantee measurable results or your investment back. No questions asked.</p> </div> </div> </div> ` })} </div> </section>  <section class="section-padding bg-gray-50 dark:bg-dark-base" data-astro-cid-ucd2ps2b> <div class="container-narrow" data-astro-cid-ucd2ps2b> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "scale", "data-astro-cid-ucd2ps2b": true }, { "default": ($$result3) => renderTemplate` <div class="max-w-4xl mx-auto" data-astro-cid-ucd2ps2b> <div class="bg-white dark:bg-dark-surface-2 rounded-xl shadow-xl dark:shadow-black/30 p-12 border border-gray-100 dark:border-dark-border" data-astro-cid-ucd2ps2b> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:quote", "class": "w-16 h-16 text-brand-gold dark:text-accent-gold mb-6", "data-astro-cid-ucd2ps2b": true })} <blockquote class="text-2xl text-gray-800 dark:text-dark-text mb-6 leading-relaxed" data-astro-cid-ucd2ps2b>
"Russell's AI Masterclass didn't just teach us about AI—it transformed how we operate. 
              We've automated 40% of our processes and gained insights that put us years ahead of competitors. 
              The ROI was evident within the first month."
</blockquote> <div class="flex items-center gap-4" data-astro-cid-ucd2ps2b> <div class="w-16 h-16 bg-brand-navy dark:bg-accent-gold rounded-full flex items-center justify-center text-white dark:text-dark-base font-bold text-xl" data-astro-cid-ucd2ps2b>
JD
</div> <div data-astro-cid-ucd2ps2b> <p class="font-semibold text-lg text-brand-charcoal dark:text-dark-text" data-astro-cid-ucd2ps2b>James Davidson</p> <p class="text-gray-600 dark:text-dark-text-tertiary" data-astro-cid-ucd2ps2b>CEO, TechVentures Inc.</p> </div> </div> </div> </div> ` })} </div> </section>  <section id="schedule" class="section-padding bg-brand-charcoal dark:bg-dark-surface-2 text-white" data-astro-cid-ucd2ps2b> <div class="container-narrow" data-astro-cid-ucd2ps2b> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "data-astro-cid-ucd2ps2b": true }, { "default": ($$result3) => renderTemplate` <div class="text-center max-w-3xl mx-auto" data-astro-cid-ucd2ps2b> <h2 class="text-4xl font-bold mb-6" data-astro-cid-ucd2ps2b>
Ready to Dominate Your Industry with AI?
</h2> <p class="text-xl mb-8 text-gray-300 dark:text-dark-text-secondary" data-astro-cid-ucd2ps2b>
Schedule a confidential strategy session to discuss your specific needs and goals.
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center" data-astro-cid-ucd2ps2b> ${renderComponent($$result3, "Button", $$Button, { "size": "lg", "class": "calendly-trigger", "data-astro-cid-ucd2ps2b": true }, { "default": ($$result4) => renderTemplate`
Schedule Your Strategy Session
` })} ${renderComponent($$result3, "Button", $$Button, { "href": "/ai-audit", "variant": "outline", "size": "lg", "class": "!text-white !border-white hover:!bg-white hover:!text-brand-charcoal dark:hover:!text-dark-base", "data-astro-cid-ucd2ps2b": true }, { "default": ($$result4) => renderTemplate`
Take the AI Opportunity Audit
` })} </div> </div> ` })} </div> </section> ` })} `;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/services.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/services.astro";
const $$url = "/services";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Services,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
