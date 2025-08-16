/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_7UizUh1a.mjs';
import { $ as $$Button } from '../chunks/Button_DEO6jh-a.mjs';
import { $ as $$AnimatedSection } from '../chunks/AnimatedSection_BzMoGi4H.mjs';
export { renderers } from '../renderers.mjs';

const $$CaseStudies = createComponent(($$result, $$props, $$slots) => {
  const caseStudies = [
    {
      company: "QuantumLeap Capital",
      industry: "Private Equity",
      challenge: "Manual due diligence processes taking 6-8 weeks per deal",
      solution: "AI-powered document analysis and risk assessment system",
      results: [
        "75% reduction in due diligence time",
        "3x more deals evaluated annually",
        "$12M in operational savings",
        "99.2% accuracy in risk detection"
      ],
      quote: "The AI system we built during the masterclass transformed our entire investment process. We're now evaluating opportunities our competitors haven't even discovered yet.",
      author: "Sarah Chen",
      title: "Managing Partner"
    },
    {
      company: "Summit Health Alliance",
      industry: "Healthcare",
      challenge: "Patient wait times averaging 45 minutes, declining satisfaction scores",
      solution: "Predictive scheduling and automated patient flow optimization",
      results: [
        "68% reduction in wait times",
        "Patient satisfaction up 42%",
        "30% increase in daily capacity",
        "ROI achieved in 8 weeks"
      ],
      quote: "Russell didn't just teach us AI theory\u2014he helped us implement solutions that our patients feel every single day. The impact has been transformational.",
      author: "Dr. Michael Torres",
      title: "Chief Medical Officer"
    },
    {
      company: "Apex Logistics",
      industry: "Supply Chain",
      challenge: "Rising fuel costs and inefficient routing eating into margins",
      solution: "AI route optimization and predictive maintenance system",
      results: [
        "22% reduction in fuel costs",
        "35% fewer vehicle breakdowns",
        "$8.5M annual savings",
        "Carbon footprint reduced by 18%"
      ],
      quote: "In just 6 weeks, we went from AI skeptics to industry leaders. Our competitors are still trying to figure out what hit them.",
      author: "James Davidson",
      title: "CEO"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Case Studies" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="pt-32 pb-16 bg-gradient-to-br from-brand-pearl to-gray-50 dark:from-dark-base dark:to-dark-surface"> <div class="container-narrow"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade" }, { "default": ($$result3) => renderTemplate` <div class="text-center max-w-3xl mx-auto"> <h1 class="text-4xl md:text-6xl font-bold text-brand-charcoal dark:text-dark-text mb-6">
Real Results from Real Leaders
</h1> <p class="text-xl text-gray-700 dark:text-dark-text-secondary">
See how executives like you transformed their businesses with AI in weeks, not years.
</p> </div> ` })} </div> </section>  <section class="section-padding"> <div class="container-narrow"> <div class="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24"> ${caseStudies.map((study, index) => renderTemplate`${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "delay": index * 0.2 }, { "default": ($$result3) => renderTemplate` <div${addAttribute(study.company, "data-case-study")} class="relative"> ${index > 0 && renderTemplate`<div class="absolute -top-6 sm:-top-8 md:-top-10 lg:-top-12 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 md:w-24 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>`} <div class="bg-white dark:bg-dark-surface-2 rounded-xl shadow-xl dark:shadow-black/30 overflow-hidden border border-gray-100 dark:border-dark-border hover:shadow-2xl transition-shadow duration-300"> <div class="md:grid md:grid-cols-2"> <!-- Results Side --> <div class="bg-brand-charcoal dark:bg-dark-surface-3 text-white p-8 md:p-12"> <div class="mb-6"> <h2 class="text-3xl font-bold mb-2">${study.company}</h2> <p class="text-brand-gold dark:text-accent-gold">${study.industry}</p> </div> <div class="mb-8"> <h3 class="text-lg font-semibold mb-3 text-gray-300">The Challenge</h3> <p class="text-gray-100">${study.challenge}</p> </div> <div class="mb-8"> <h3 class="text-lg font-semibold mb-3 text-gray-300">The Solution</h3> <p class="text-gray-100">${study.solution}</p> </div> <div> <h3 class="text-lg font-semibold mb-4 text-gray-300">The Results</h3> <ul class="space-y-3"> ${study.results.map((result) => renderTemplate`<li class="flex items-start gap-3"> <svg class="w-5 h-5 text-brand-gold dark:text-accent-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg> <span class="text-lg font-semibold">${result}</span> </li>`)} </ul> </div> </div> <!-- Quote Side --> <div class="p-8 md:p-12 flex flex-col justify-center"> <svg class="w-12 h-12 text-brand-gold dark:text-accent-gold mb-6" fill="currentColor" viewBox="0 0 24 24"> <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"></path> </svg> <blockquote class="text-xl text-gray-800 dark:text-dark-text mb-6 leading-relaxed"> ${study.quote} </blockquote> <div> <p class="font-semibold text-lg text-brand-charcoal dark:text-dark-text">${study.author}</p> <p class="text-gray-600 dark:text-dark-text-secondary">${study.title}, ${study.company}</p> </div> </div> </div> </div> </div> ` })}`)} </div> </div> </section>  <section class="section-padding bg-gray-50 dark:bg-dark-surface"> <div class="container-narrow"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade" }, { "default": ($$result3) => renderTemplate` <div class="text-center mb-12"> <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text">
By the Numbers
</h2> </div> <div class="grid md:grid-cols-4 gap-8 text-center"> <div> <div class="text-5xl font-bold text-brand-gold dark:text-accent-gold mb-2">94%</div> <p class="text-gray-700 dark:text-dark-text-secondary">Average efficiency gain</p> </div> <div> <div class="text-5xl font-bold text-brand-gold dark:text-accent-gold mb-2">6.2x</div> <p class="text-gray-700 dark:text-dark-text-secondary">Average ROI in Year 1</p> </div> <div> <div class="text-5xl font-bold text-brand-gold dark:text-accent-gold mb-2">8</div> <p class="text-gray-700 dark:text-dark-text-secondary">Weeks to implementation</p> </div> <div> <div class="text-5xl font-bold text-brand-gold dark:text-accent-gold mb-2">100%</div> <p class="text-gray-700 dark:text-dark-text-secondary">Client satisfaction rate</p> </div> </div> ` })} </div> </section>  <section class="section-padding bg-brand-navy dark:bg-dark-surface-2 text-white"> <div class="container-narrow"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide" }, { "default": ($$result3) => renderTemplate` <div class="text-center max-w-3xl mx-auto"> <h2 class="text-4xl font-bold mb-6">
Your Success Story Starts Here
</h2> <p class="text-xl mb-8 text-brand-pearl/90 dark:text-dark-text-secondary">
Join the executives who've already transformed their businesses with AI.
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> ${renderComponent($$result3, "Button", $$Button, { "size": "lg", "class": "calendly-trigger" }, { "default": ($$result4) => renderTemplate`
Schedule Your Strategy Session
` })} ${renderComponent($$result3, "Button", $$Button, { "href": "/services", "variant": "outline", "size": "lg", "class": "!text-white !border-white hover:!bg-white hover:!text-brand-navy dark:hover:!bg-dark-surface-3 dark:hover:!text-dark-text dark:hover:!border-dark-border" }, { "default": ($$result4) => renderTemplate`
View Training Options
` })} </div> </div> ` })} </div> </section> ` })}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/case-studies.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/case-studies.astro";
const $$url = "/case-studies";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$CaseStudies,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
