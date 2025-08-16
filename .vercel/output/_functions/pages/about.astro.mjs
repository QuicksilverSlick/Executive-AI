/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Icon } from '../chunks/Layout_7UizUh1a.mjs';
import { $ as $$Button } from '../chunks/Button_DEO6jh-a.mjs';
import { $ as $$AnimatedSection } from '../chunks/AnimatedSection_BzMoGi4H.mjs';
export { renderers } from '../renderers.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  const timeline = [
    {
      year: "2018",
      title: "AI Pioneer",
      description: "Russell began implementing AI solutions for Fortune 500 companies, seeing firsthand the gap between executive understanding and AI potential."
    },
    {
      year: "2020",
      title: "The Revelation",
      description: "After helping dozens of companies, Russell realized the biggest barrier wasn't technology\u2014it was executive confidence and understanding."
    },
    {
      year: "2022",
      title: "Executive AI Training Founded",
      description: "Launched the first AI masterclass specifically designed for executives, focusing on practical implementation over theory."
    },
    {
      year: "2024",
      title: "Industry Leader",
      description: "Trained over 500 executives, with clients achieving average efficiency gains of 94% and ROI of 6.2x in their first year."
    }
  ];
  const values = [
    {
      icon: "lucide:target",
      title: "Results-Driven",
      description: "We measure success by your business outcomes, not by hours taught or concepts covered."
    },
    {
      icon: "lucide:shield",
      title: "Privacy First",
      description: "Your strategies, data, and competitive advantages stay confidential. Always."
    },
    {
      icon: "lucide:rocket",
      title: "Speed to Value",
      description: "Implementation starts in week one. You'll see real results before the program ends."
    },
    {
      icon: "lucide:users",
      title: "Executive-Focused",
      description: "Built by executives, for executives. No coding required, ever."
    }
  ];
  const stats = [
    { number: "500+", label: "Executives Trained" },
    { number: "94%", label: "Average Efficiency Gain" },
    { number: "6.2x", label: "Average ROI Year 1" },
    { number: "100%", label: "Client Satisfaction" }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "About Executive AI Training" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="hero-modern bg-gradient-to-br from-brand-pearl to-gray-50 dark:from-dark-base dark:to-dark-surface"> <div class="container-modern"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade" }, { "default": ($$result3) => renderTemplate` <div class="text-content-modern mx-auto text-center"> <h1 class="text-4xl md:text-6xl font-bold text-brand-charcoal dark:text-dark-text mb-6">
Bridging the Gap Between Executive Vision and AI Reality
</h1> <p class="text-xl text-gray-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
We believe every executive should be empowered to lead in the AI age—without becoming a data scientist.
</p> </div> ` })} </div> </section>  <section class="section-responsive"> <div class="container-modern"> <div class="content-grid"> <div class="two-column-modern"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "class": "order-2 md:order-1" }, { "default": ($$result3) => renderTemplate` <div class="text-content-modern"> <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-6">
Our Mission
</h2> <p class="text-lg text-gray-700 dark:text-dark-text-secondary">
To transform overwhelmed executives into Masters of Synthetic Intelligence™—leaders who confidently leverage AI to create unstoppable competitive advantages.
</p> <p class="text-lg text-gray-700 dark:text-dark-text-secondary">
We don't just teach AI concepts. We guide you through implementing real solutions that deliver measurable business impact in weeks, not years.
</p> <p class="text-lg text-gray-700 dark:text-dark-text-secondary">
Because in the AI revolution, the companies that win aren't those with the best technology—they're those with leaders who know how to wield it.
</p> </div> ` })} ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "delay": 0.2, "class": "order-1 md:order-2" }, { "default": ($$result3) => renderTemplate` <div class="relative max-w-md mx-auto"> <div class="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-brand-navy/20 dark:from-accent-gold/20 dark:to-accent-blue/20 rounded-2xl transform rotate-3"></div> <div class="relative bg-white dark:bg-dark-surface-2 rounded-2xl shadow-xl p-6 md:p-8 contain-layout personalized-box"> <div class="large-number font-bold text-brand-gold dark:text-accent-gold mb-4">1:1</div> <h3 class="text-2xl font-bold text-brand-charcoal dark:text-dark-text mb-3">
Personalized Approach
</h3> <p class="text-gray-700 dark:text-dark-text-secondary">
Every masterclass is customized to your industry, challenges, and goals. No generic courses. No wasted time.
</p> </div> </div> ` })} </div> </div> </div> </section>  <section class="section-responsive bg-gray-50 dark:bg-dark-surface"> <div class="container-modern"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade" }, { "default": ($$result3) => renderTemplate` <div class="text-center mb-16"> <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-4">
Meet Russell Deming
</h2> <p class="text-xl text-gray-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
AI strategist, executive coach, and your guide to mastering synthetic intelligence
</p> </div> ` })} <div class="content-grid"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide" }, { "default": ($$result3) => renderTemplate` <div class="founder-layout">  <div class="image-container-modern"> <div class="relative">  <div class="absolute -inset-4 bg-gradient-to-br from-brand-gold/20 to-brand-navy/20 dark:from-accent-gold/20 dark:to-accent-blue/20 rounded-2xl blur-xl"></div> <img src="/images/russell-deming-founder.jpg" alt="Russell Deming - Executive AI Founder" class="image-modern" loading="lazy"> </div> </div>  <div class="text-content-modern"> <div class="prose prose-lg dark:prose-invert max-w-none"> <p class="text-gray-700 dark:text-dark-text-secondary leading-relaxed mb-6">
Russell has spent the last decade at the intersection of AI and business strategy, helping Fortune 500 companies implement transformative AI solutions. But he noticed something troubling: while AI capabilities were advancing exponentially, executive understanding was barely keeping pace.
</p> <p class="text-gray-700 dark:text-dark-text-secondary leading-relaxed mb-6">
"I watched brilliant executives—people who built empires—suddenly feel lost in AI conversations. They were making critical decisions about technology they didn't understand, often deferring to technical teams who didn't grasp business strategy."
</p> <p class="text-gray-700 dark:text-dark-text-secondary leading-relaxed mb-6">
This observation led Russell to create Executive AI Training: a unique approach that bridges the gap between executive vision and AI capability. No coding. No complex mathematics. Just practical, implementable strategies that deliver real business results.
</p> <blockquote class="border-l-4 border-brand-gold dark:border-accent-gold pl-6 my-8"> <p class="text-xl italic text-brand-charcoal dark:text-dark-text">
"My mission is simple: ensure that human executives, not just tech giants, shape the AI-powered future of business."
</p> </blockquote> </div> </div> </div> ` })} </div> </div> </section>  <section class="section-responsive"> <div class="container-modern"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade" }, { "default": ($$result3) => renderTemplate` <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-12 text-center">
Our Journey
</h2> ` })} <div class="max-w-3xl mx-auto"> ${timeline.map((item, index) => renderTemplate`${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "delay": index * 0.1 }, { "default": ($$result3) => renderTemplate` <div class="timeline-item relative pl-8">  ${index < timeline.length - 1 && renderTemplate`<div class="absolute left-0 top-8 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>`}  <div class="absolute left-0 top-2 w-2 h-2 bg-brand-gold dark:bg-accent-gold rounded-full -translate-x-[3.5px]"></div>  <div class="timeline-content bg-white dark:bg-dark-surface-2"> <div class="text-brand-gold dark:text-accent-gold font-bold mb-2">${item.year}</div> <h3 class="text-xl font-bold text-brand-charcoal dark:text-dark-text">${item.title}</h3> <p class="text-gray-700 dark:text-dark-text-secondary">${item.description}</p> </div> </div> ` })}`)} </div> </div> </section>  <section class="section-responsive bg-gray-50 dark:bg-dark-surface"> <div class="container-modern"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade" }, { "default": ($$result3) => renderTemplate` <h2 class="text-3xl md:text-4xl font-bold text-brand-charcoal dark:text-dark-text mb-12 text-center">
Our Values
</h2> ` })} <div class="values-grid"> ${values.map((value, index) => renderTemplate`${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "scale", "delay": index * 0.1 }, { "default": ($$result3) => renderTemplate` <div class="bg-white dark:bg-dark-surface-2 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 contain-layout"> ${renderComponent($$result3, "Icon", $$Icon, { "name": value.icon, "class": "w-12 h-12 text-brand-gold dark:text-accent-gold mb-4" })} <h3 class="text-xl font-bold text-brand-charcoal dark:text-dark-text mb-3"> ${value.title} </h3> <p class="text-gray-700 dark:text-dark-text-secondary"> ${value.description} </p> </div> ` })}`)} </div> </div> </section>  <section class="section-responsive"> <div class="container-modern"> <div class="content-grid"> <div class="bg-brand-navy dark:bg-dark-surface-2 rounded-2xl p-8 md:p-12 contain-all"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade" }, { "default": ($$result3) => renderTemplate` <h2 class="text-3xl md:text-4xl font-bold text-white dark:text-dark-text mb-12 text-center">
Our Impact
</h2> ` })} <div class="stats-grid"> ${stats.map((stat, index) => renderTemplate`${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "scale", "delay": index * 0.1 }, { "default": ($$result3) => renderTemplate` <div class="text-center"> <div class="text-4xl md:text-5xl font-bold text-brand-gold dark:text-accent-gold mb-2"> ${stat.number} </div> <p class="text-brand-pearl dark:text-dark-text-secondary"> ${stat.label} </p> </div> ` })}`)} </div> </div> </div> </div> </section>  <section class="section-responsive bg-gradient-to-br from-brand-pearl to-gray-50 dark:from-dark-base dark:to-dark-surface"> <div class="container-modern"> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide" }, { "default": ($$result3) => renderTemplate` <div class="text-center text-content-modern mx-auto"> <h2 class="text-4xl md:text-5xl font-bold text-brand-charcoal dark:text-dark-text mb-6">
Ready to Lead the AI Revolution?
</h2> <p class="text-xl text-gray-700 dark:text-dark-text-secondary mb-8">
Join the executives who are shaping the future of business with AI.
</p> <div class="button-group-modern"> ${renderComponent($$result3, "Button", $$Button, { "size": "lg", "class": "calendly-trigger touch-target" }, { "default": ($$result4) => renderTemplate`
Schedule Your Strategy Session
` })} ${renderComponent($$result3, "Button", $$Button, { "href": "/case-studies", "variant": "outline", "size": "lg", "class": "touch-target" }, { "default": ($$result4) => renderTemplate`
See Success Stories
` })} </div> </div> ` })} </div> </section> ` })}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/about.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
