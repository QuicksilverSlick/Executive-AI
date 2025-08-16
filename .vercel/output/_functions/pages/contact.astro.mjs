import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript, h as addAttribute } from '../_astro/astro/server.DAk61OsX.js';
import 'kleur/colors';
import { $ as $$Layout, a as $$Icon } from '../_astro/Layout.Dz-ECntR.js';
import { $ as $$AnimatedSection } from '../_astro/AnimatedSection.fHVqQ-iE.js';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

const $$Contact = createComponent(($$result, $$props, $$slots) => {
  const contactChannels = [
    {
      id: "schedule-call",
      title: "Schedule a Call",
      description: "Book a free 30-minute strategy session",
      icon: "lucide:calendar-check",
      priority: "Personal",
      responseTime: "At your convenience",
      available: true,
      action: "Book Now",
      link: "/schedule"
    },
    {
      id: "email-us",
      title: "Email Us",
      description: "Detailed inquiries and document sharing",
      icon: "lucide:mail",
      priority: "Detailed",
      responseTime: "< 4 hours",
      available: true,
      action: "support@executiveai.training",
      link: "mailto:support@executiveai.training"
    },
    {
      id: "call-direct",
      title: "Call Directly",
      description: "Speak with our team immediately",
      icon: "lucide:phone",
      priority: "Urgent",
      responseTime: "Business hours",
      available: true,
      action: "(918) 555-1234",
      link: "tel:+19185551234"
    }
  ];
  const faqs = [
    {
      question: "What is the best way to reach you?",
      answer: "For immediate assistance, use our live chat. For detailed inquiries, email is best. For urgent matters during business hours, call us directly."
    },
    {
      question: "What are your business hours?",
      answer: "We're available Monday through Friday, 8:00 AM - 6:00 PM CST. Live chat and email support may be available outside these hours."
    },
    {
      question: "How quickly will I get a response?",
      answer: "Live chat: < 2 minutes, Email: < 4 hours, Phone: Immediate during business hours, Contact form: < 24 hours."
    },
    {
      question: "Do you offer emergency support?",
      answer: "Yes, enterprise clients have access to 24/7 emergency support. Contact your account manager for details."
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Contact Us - Executive AI Training", "description": "Get in touch with Grey Matter LLC for AI training and consulting services. Multiple ways to connect with response times that meet your needs.", "data-astro-cid-uw5kdbxl": true }, { "default": ($$result2) => renderTemplate`   ${maybeRenderHead()}<section class="relative bg-gradient-to-br from-gray-50 via-white to-brand-pearl/30 dark:from-dark-surface dark:via-dark-base dark:to-dark-surface py-20 overflow-hidden" data-astro-cid-uw5kdbxl> <div class="absolute inset-0 pointer-events-none" data-astro-cid-uw5kdbxl> <div class="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" data-astro-cid-uw5kdbxl></div> <div class="absolute bottom-0 left-0 w-96 h-96 bg-brand-navy/5 rounded-full blur-3xl" data-astro-cid-uw5kdbxl></div> </div> <div class="container-narrow relative z-10" data-astro-cid-uw5kdbxl> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade", "data-astro-cid-uw5kdbxl": true }, { "default": ($$result3) => renderTemplate` <div class="text-center max-w-3xl mx-auto" data-astro-cid-uw5kdbxl> <!-- Live Status Indicator --> <div class="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6" data-astro-cid-uw5kdbxl> <span class="status-dot" data-astro-cid-uw5kdbxl></span> <span data-astro-cid-uw5kdbxl>We're online and ready to help</span> </div> <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-astro-cid-uw5kdbxl>
How Can We Help You Today?
</h1> <p class="text-xl text-gray-600 dark:text-gray-400 mb-8" data-astro-cid-uw5kdbxl>
Choose your preferred way to connect. We're here to support your AI journey with response times that match your needs.
</p> <!-- Trust Indicators --> <div class="flex flex-wrap justify-center gap-4 mb-8" data-astro-cid-uw5kdbxl> <div class="trust-badge" data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:shield-check", "class": "w-4 h-4", "data-astro-cid-uw5kdbxl": true })} <span data-astro-cid-uw5kdbxl>SSL Secured</span> </div> <div class="trust-badge" data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:lock", "class": "w-4 h-4", "data-astro-cid-uw5kdbxl": true })} <span data-astro-cid-uw5kdbxl>GDPR Compliant</span> </div> <div class="trust-badge" data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:award", "class": "w-4 h-4", "data-astro-cid-uw5kdbxl": true })} <span data-astro-cid-uw5kdbxl>Certified Experts</span> </div> </div> </div> ` })} </div> </section>  <section class="section-padding bg-white dark:bg-dark-base -mt-20 relative z-20" data-astro-cid-uw5kdbxl> <div class="container-narrow" data-astro-cid-uw5kdbxl> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "data-astro-cid-uw5kdbxl": true }, { "default": ($$result3) => renderTemplate` <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" data-astro-cid-uw5kdbxl> ${contactChannels.map((channel) => renderTemplate`<a${addAttribute(channel.link, "href")} class="contact-card bg-white dark:bg-dark-surface-2 rounded-xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-dark-border group cursor-pointer" data-astro-cid-uw5kdbxl> <div class="flex items-start justify-between mb-4" data-astro-cid-uw5kdbxl> <div${addAttribute(`w-12 h-12 rounded-lg flex items-center justify-center ${channel.id === "schedule-call" ? "bg-blue-100 dark:bg-blue-900/20" : channel.id === "email-us" ? "bg-purple-100 dark:bg-purple-900/20" : "bg-orange-100 dark:bg-orange-900/20"}`, "class")} data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": channel.icon, "class": `w-6 h-6 ${channel.id === "schedule-call" ? "text-blue-600 dark:text-blue-400" : channel.id === "email-us" ? "text-purple-600 dark:text-purple-400" : "text-orange-600 dark:text-orange-400"}`, "data-astro-cid-uw5kdbxl": true })} </div> <span class="response-badge" data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:clock", "class": "w-3 h-3", "data-astro-cid-uw5kdbxl": true })} ${channel.responseTime} </span> </div> <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-gold dark:group-hover:text-accent-gold transition-colors" data-astro-cid-uw5kdbxl> ${channel.title} </h3> <p class="text-sm text-gray-600 dark:text-gray-400 mb-4" data-astro-cid-uw5kdbxl> ${channel.description} </p> <div class="flex items-center justify-between" data-astro-cid-uw5kdbxl> <span class="text-sm font-medium text-brand-gold dark:text-accent-gold" data-astro-cid-uw5kdbxl> ${channel.action} </span> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:arrow-right", "class": "w-4 h-4 text-gray-400 group-hover:text-brand-gold dark:group-hover:text-accent-gold group-hover:translate-x-1 transition-all", "data-astro-cid-uw5kdbxl": true })} </div> </a>`)} </div> ` })} <!-- Main Contact Form with Progressive Enhancement --> <div class="grid lg:grid-cols-5 gap-12" data-astro-cid-uw5kdbxl> <!-- Left Column - Quick FAQ & Info --> <div class="lg:col-span-2" data-astro-cid-uw5kdbxl> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "fade", "data-astro-cid-uw5kdbxl": true }, { "default": ($$result3) => renderTemplate` <div class="sticky top-24" data-astro-cid-uw5kdbxl> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6" data-astro-cid-uw5kdbxl>
Quick Answers
</h2> <!-- Self-Service FAQ --> <div class="space-y-4 mb-8" data-astro-cid-uw5kdbxl> ${faqs.map((faq, index) => renderTemplate`<details class="group"${addAttribute(index, "key")} data-astro-cid-uw5kdbxl> <summary class="flex items-center justify-between cursor-pointer p-4 bg-gray-50 dark:bg-dark-surface rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-2 transition-colors" data-astro-cid-uw5kdbxl> <span class="font-medium text-gray-900 dark:text-white pr-4" data-astro-cid-uw5kdbxl> ${faq.question} </span> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:chevron-down", "class": "w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform", "data-astro-cid-uw5kdbxl": true })} </summary> <div class="p-4 text-gray-600 dark:text-gray-400" data-astro-cid-uw5kdbxl> ${faq.answer} </div> </details>`)} </div> <!-- Office Info --> <div class="bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white rounded-xl p-6 office-info-card" data-astro-cid-uw5kdbxl> <h3 class="font-semibold mb-4 flex items-center gap-2" data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:building-2", "class": "w-5 h-5", "data-astro-cid-uw5kdbxl": true })}
Office Location
</h3> <p class="text-sm mb-2" data-astro-cid-uw5kdbxl>
Grey Matter LLC<br data-astro-cid-uw5kdbxl>
123 Main Street, Suite 400<br data-astro-cid-uw5kdbxl>
Tulsa, Oklahoma 74103
</p> <p class="text-xs opacity-80" data-astro-cid-uw5kdbxl>
By appointment only
</p> </div> </div> ` })} </div> <!-- Right Column - Smart Contact Form --> <div class="lg:col-span-3" data-astro-cid-uw5kdbxl> ${renderComponent($$result2, "AnimatedSection", $$AnimatedSection, { "animate": "slide", "delay": 0.2, "data-astro-cid-uw5kdbxl": true }, { "default": ($$result3) => renderTemplate` <div class="bg-white dark:bg-dark-surface-2 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8" data-astro-cid-uw5kdbxl> <div class="mb-8" data-astro-cid-uw5kdbxl> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2" data-astro-cid-uw5kdbxl>
Send Us a Message
</h2> <p class="text-gray-600 dark:text-gray-400" data-astro-cid-uw5kdbxl>
Fill out the form below and we'll get back to you within 24 hours.
</p> </div> <!-- Form Progress Indicator --> <div class="mb-6" data-astro-cid-uw5kdbxl> <div class="h-2 bg-gray-200 dark:bg-dark-surface rounded-full overflow-hidden" data-astro-cid-uw5kdbxl> <div id="form-progress" class="form-progress h-full bg-brand-gold dark:bg-accent-gold rounded-full" style="width: 0%" data-astro-cid-uw5kdbxl></div> </div> </div> <form id="contact-form" class="space-y-6" novalidate data-astro-cid-uw5kdbxl> <!-- Name Fields --> <div class="grid sm:grid-cols-2 gap-4" data-astro-cid-uw5kdbxl> <div class="relative" data-astro-cid-uw5kdbxl> <input type="text" id="first-name" name="first-name" required autocomplete="given-name" class="form-field peer w-full px-4 py-3 pt-6 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent transition-all" placeholder=" " data-astro-cid-uw5kdbxl> <label for="first-name" class="floating-label absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none" data-astro-cid-uw5kdbxl>
First Name *
</label> <span class="error-message text-red-500 text-xs mt-1 hidden" data-astro-cid-uw5kdbxl>Please enter your first name</span> </div> <div class="relative" data-astro-cid-uw5kdbxl> <input type="text" id="last-name" name="last-name" required autocomplete="family-name" class="form-field peer w-full px-4 py-3 pt-6 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent transition-all" placeholder=" " data-astro-cid-uw5kdbxl> <label for="last-name" class="floating-label absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none" data-astro-cid-uw5kdbxl>
Last Name *
</label> <span class="error-message text-red-500 text-xs mt-1 hidden" data-astro-cid-uw5kdbxl>Please enter your last name</span> </div> </div> <!-- Email & Phone --> <div class="grid sm:grid-cols-2 gap-4" data-astro-cid-uw5kdbxl> <div class="relative" data-astro-cid-uw5kdbxl> <input type="email" id="email" name="email" required autocomplete="email" class="form-field peer w-full px-4 py-3 pt-6 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent transition-all" placeholder=" " data-astro-cid-uw5kdbxl> <label for="email" class="floating-label absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none" data-astro-cid-uw5kdbxl>
Email Address *
</label> <span class="error-message text-red-500 text-xs mt-1 hidden" data-astro-cid-uw5kdbxl>Please enter a valid email</span> </div> <div class="relative" data-astro-cid-uw5kdbxl> <input type="tel" id="phone" name="phone" autocomplete="tel" class="form-field peer w-full px-4 py-3 pt-6 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent transition-all" placeholder=" " data-astro-cid-uw5kdbxl> <label for="phone" class="floating-label absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none" data-astro-cid-uw5kdbxl>
Phone Number
</label> </div> </div> <!-- Company & Role --> <div class="grid sm:grid-cols-2 gap-4" data-astro-cid-uw5kdbxl> <div class="relative" data-astro-cid-uw5kdbxl> <input type="text" id="company" name="company" autocomplete="organization" class="form-field peer w-full px-4 py-3 pt-6 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent transition-all" placeholder=" " data-astro-cid-uw5kdbxl> <label for="company" class="floating-label absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none" data-astro-cid-uw5kdbxl>
Company
</label> </div> <div class="relative" data-astro-cid-uw5kdbxl> <input type="text" id="role" name="role" autocomplete="organization-title" class="form-field peer w-full px-4 py-3 pt-6 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent transition-all" placeholder=" " data-astro-cid-uw5kdbxl> <label for="role" class="floating-label absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none" data-astro-cid-uw5kdbxl>
Your Role
</label> </div> </div> <!-- Interest Area --> <div class="relative" data-astro-cid-uw5kdbxl> <select id="interest" name="interest" required class="form-field peer w-full px-4 py-3 pt-6 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent transition-all appearance-none" data-astro-cid-uw5kdbxl> <option value="" data-astro-cid-uw5kdbxl>Select your interest</option> <option value="executive-training" data-astro-cid-uw5kdbxl>Executive AI Training</option> <option value="team-workshops" data-astro-cid-uw5kdbxl>Team Workshops</option> <option value="consulting" data-astro-cid-uw5kdbxl>AI Strategy Consulting</option> <option value="implementation" data-astro-cid-uw5kdbxl>AI Implementation</option> <option value="custom-solutions" data-astro-cid-uw5kdbxl>Custom Solutions</option> <option value="other" data-astro-cid-uw5kdbxl>Other</option> </select> <label for="interest" class="floating-label absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none" data-astro-cid-uw5kdbxl>
How can we help? *
</label> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:chevron-down", "class": "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none", "data-astro-cid-uw5kdbxl": true })} <span class="error-message text-red-500 text-xs mt-1 hidden" data-astro-cid-uw5kdbxl>Please select an option</span> </div> <!-- Message --> <div class="relative" data-astro-cid-uw5kdbxl> <textarea id="message" name="message" rows="4" required class="form-field peer w-full px-4 py-3 pt-6 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold focus:border-transparent transition-all resize-none" placeholder=" " data-astro-cid-uw5kdbxl></textarea> <label for="message" class="floating-label absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none" data-astro-cid-uw5kdbxl>
Tell us more about your needs *
</label> <span class="error-message text-red-500 text-xs mt-1 hidden" data-astro-cid-uw5kdbxl>Please enter a message</span> <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right" data-astro-cid-uw5kdbxl> <span id="char-count" data-astro-cid-uw5kdbxl>0</span> / 500 characters
</div> </div> <!-- Privacy Consent --> <div class="flex items-start gap-3" data-astro-cid-uw5kdbxl> <input type="checkbox" id="privacy-consent" name="privacy-consent" required class="mt-1 w-5 h-5 text-brand-gold dark:text-accent-gold border-gray-300 dark:border-dark-border rounded focus:ring-2 focus:ring-brand-gold dark:focus:ring-accent-gold" data-astro-cid-uw5kdbxl> <label for="privacy-consent" class="text-sm text-gray-600 dark:text-gray-400" data-astro-cid-uw5kdbxl>
I agree to the <a href="/privacy" class="text-brand-gold dark:text-accent-gold hover:underline" data-astro-cid-uw5kdbxl>Privacy Policy</a> and understand that Grey Matter LLC will use my information to respond to my inquiry. *
</label> </div> <!-- Form Actions --> <div class="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4" data-astro-cid-uw5kdbxl> <button type="submit" class="w-full sm:w-auto px-8 py-4 bg-brand-gold hover:bg-brand-gold-warm dark:bg-accent-gold dark:hover:bg-accent-gold-light text-brand-charcoal font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" disabled data-astro-cid-uw5kdbxl> <span class="flex items-center justify-center gap-2" data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:send", "class": "w-5 h-5", "data-astro-cid-uw5kdbxl": true })}
Send Message
</span> </button> <p class="text-sm text-gray-500 dark:text-gray-400" data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:shield-check", "class": "inline w-4 h-4 mr-1", "data-astro-cid-uw5kdbxl": true })}
Your information is secure and encrypted
</p> </div> </form> <!-- Success Message (Hidden by default) --> <div id="success-message" class="hidden" data-astro-cid-uw5kdbxl> <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center" data-astro-cid-uw5kdbxl> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:check-circle", "class": "w-12 h-12 text-green-500 mx-auto mb-3", "data-astro-cid-uw5kdbxl": true })} <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2" data-astro-cid-uw5kdbxl>
Message Sent Successfully!
</h3> <p class="text-gray-600 dark:text-gray-400 mb-4" data-astro-cid-uw5kdbxl>
Thank you for reaching out. We'll get back to you within 24 hours.
</p> <button id="send-another" class="text-brand-gold dark:text-accent-gold font-medium hover:underline" data-astro-cid-uw5kdbxl>
Send another message
</button> </div> </div> </div> ` })} </div> </div> </div> </section>  ${renderScript($$result2, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/contact.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/contact.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/contact.astro";
const $$url = "/contact";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Contact,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
