/* empty css                                 */
import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, n as renderSlot, r as renderTemplate, l as renderScript, k as renderComponent } from '../chunks/astro/server_BUcCHCB2.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_7UizUh1a.mjs';
import { $ as $$Button } from '../chunks/Button_DEO6jh-a.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro();
const $$Card = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Card;
  const {
    class: className = "",
    variant = "default",
    interactive = false,
    padding = "md"
  } = Astro2.props;
  const variantClasses = {
    default: "card-modern",
    outlined: "card-modern border-2",
    elevated: "card-modern shadow-smooth-lg",
    glass: "card-modern glass-effect"
  };
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };
  const baseClasses = variantClasses[variant];
  const interactiveClasses = interactive ? "cursor-pointer transition-all duration-200 hover:shadow-smooth-lg hover:-translate-y-1" : "";
  const finalClasses = `${baseClasses} ${paddingClasses[padding]} ${interactiveClasses} ${className}`.trim();
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(finalClasses, "class")}> ${renderSlot($$result, $$slots["default"])} </div> <!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250802-770
 * @timestamp: 2025-08-02T10:45:00Z
 * @reasoning:
 * - **Objective:** Complete card component with variants
 * - **Strategy:** Simple, flexible design following system patterns
 * - **Outcome:** Reusable card component ready for content
 -->`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/components/Card.astro", void 0);

const $$Astro = createAstro();
const $$VoiceAgentWidget = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$VoiceAgentWidget;
  const {
    class: className = "",
    position = "bottom-right",
    size = "md",
    theme = "auto"
  } = Astro2.props;
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2"
  };
  const sizeClasses = {
    sm: "w-80 max-h-96",
    md: "w-96 max-h-[32rem]",
    lg: "w-[28rem] max-h-[36rem]"
  };
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`voice-agent-widget ${positionClasses[position]} ${sizeClasses[size]} ${className}`, "class")} data-voice-agent-widget${addAttribute(theme, "data-theme")}> <!-- Widget Header --> <div class="card-header"> <div class="flex items-center justify-between"> <div class="flex items-center space-x-3"> <div class="voice-status" data-status="connecting"> <div class="voice-status-dot"></div> <span id="voice-status-text">Connecting...</span> </div> </div> <button class="btn-modern btn-ghost btn-sm" id="voice-widget-close" aria-label="Close voice assistant"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> </div> <!-- Conversation Area --> <div class="card-content"> <div class="conversation-container overflow-y-auto space-y-3 h-64" id="conversation-container" role="log" aria-live="polite" aria-label="Voice conversation"> <!-- Welcome message --> <div class="message-bubble assistant"> <p class="text-sm">
Hi! I'm your AI voice assistant. Click the microphone to start talking, or type a message below.
</p> </div> </div> </div> <!-- Audio Visualizer --> <div class="px-6 py-2"> <div class="audio-visualizer" id="audio-visualizer" aria-hidden="true"> <div class="audio-bar" style="height: 4px;"></div> <div class="audio-bar" style="height: 6px;"></div> <div class="audio-bar" style="height: 8px;"></div> <div class="audio-bar" style="height: 6px;"></div> <div class="audio-bar" style="height: 4px;"></div> </div> </div> <!-- Input Area --> <div class="card-footer"> <div class="flex space-x-2 w-full"> <!-- Text Input --> <input type="text" class="input-modern flex-1" placeholder="Type a message..." id="text-input" maxlength="500" aria-label="Type your message"> <!-- Voice Button --> <button class="btn-modern btn-primary btn-md voice-toggle-btn" id="voice-toggle" aria-label="Start voice conversation" data-recording="false"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path> </svg> </button> <!-- Send Button --> <button class="btn-modern btn-outline btn-md" id="send-button" aria-label="Send message" disabled> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path> </svg> </button> </div> </div> </div> <!-- Floating Action Button (when widget is closed) --> <button class="voice-fab" id="voice-fab" aria-label="Open voice assistant" data-widget-open="false"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path> </svg> </button> ${renderScript($$result, "/home/dreamforge/ai_masterclass/executive-ai-training/src/components/VoiceAgentWidget.astro?astro&type=script&index=0&lang.ts")} <!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250802-770
 * @timestamp: 2025-08-02T10:15:00Z
 * @reasoning:
 * - **Objective:** Complete voice widget with modern design system
 * - **Strategy:** Astro component with vanilla JS for broad compatibility
 * - **Outcome:** Professional voice interface ready for integration
 -->`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/components/VoiceAgentWidget.astro", void 0);

const $$DesignShowcase = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Modern Design System Showcase" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-background text-foreground"> <!-- Header --> <section class="border-b bg-card/50 backdrop-blur-sm"> <div class="container mx-auto px-6 py-8"> <h1 class="text-4xl font-bold mb-2">Modern Design System</h1> <p class="text-muted-foreground text-lg">
Professional UI components following shadcn/ui principles
</p> </div> </section> <div class="container mx-auto px-6 py-12 space-y-16"> <!-- Color Palette --> <section> <h2 class="text-3xl font-semibold mb-6">Color System</h2> <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"> <div class="space-y-2"> <div class="w-full h-16 bg-primary rounded-lg"></div> <p class="text-sm font-medium">Primary</p> </div> <div class="space-y-2"> <div class="w-full h-16 bg-secondary rounded-lg"></div> <p class="text-sm font-medium">Secondary</p> </div> <div class="space-y-2"> <div class="w-full h-16 bg-muted rounded-lg"></div> <p class="text-sm font-medium">Muted</p> </div> <div class="space-y-2"> <div class="w-full h-16 bg-accent rounded-lg"></div> <p class="text-sm font-medium">Accent</p> </div> <div class="space-y-2"> <div class="w-full h-16 bg-destructive rounded-lg"></div> <p class="text-sm font-medium">Destructive</p> </div> <div class="space-y-2"> <div class="w-full h-16 bg-voice-connected rounded-lg"></div> <p class="text-sm font-medium">Voice Connected</p> </div> </div> </section> <!-- Buttons --> <section> <h2 class="text-3xl font-semibold mb-6">Button Components</h2> <!-- Button Variants --> <div class="space-y-8"> <div> <h3 class="text-xl font-medium mb-4">Variants</h3> <div class="flex flex-wrap gap-4"> ${renderComponent($$result2, "Button", $$Button, { "variant": "primary" }, { "default": ($$result3) => renderTemplate`Primary Button` })} ${renderComponent($$result2, "Button", $$Button, { "variant": "secondary" }, { "default": ($$result3) => renderTemplate`Secondary Button` })} ${renderComponent($$result2, "Button", $$Button, { "variant": "outline" }, { "default": ($$result3) => renderTemplate`Outline Button` })} ${renderComponent($$result2, "Button", $$Button, { "variant": "ghost" }, { "default": ($$result3) => renderTemplate`Ghost Button` })} ${renderComponent($$result2, "Button", $$Button, { "variant": "destructive" }, { "default": ($$result3) => renderTemplate`Destructive Button` })} </div> </div> <!-- Button Sizes --> <div> <h3 class="text-xl font-medium mb-4">Sizes</h3> <div class="flex flex-wrap items-center gap-4"> ${renderComponent($$result2, "Button", $$Button, { "size": "sm", "variant": "primary" }, { "default": ($$result3) => renderTemplate`Small` })} ${renderComponent($$result2, "Button", $$Button, { "size": "md", "variant": "primary" }, { "default": ($$result3) => renderTemplate`Medium` })} ${renderComponent($$result2, "Button", $$Button, { "size": "lg", "variant": "primary" }, { "default": ($$result3) => renderTemplate`Large` })} </div> </div> <!-- Button States --> <div> <h3 class="text-xl font-medium mb-4">States</h3> <div class="flex flex-wrap gap-4"> ${renderComponent($$result2, "Button", $$Button, { "variant": "primary" }, { "default": ($$result3) => renderTemplate`Normal` })} ${renderComponent($$result2, "Button", $$Button, { "variant": "primary", "loading": true }, { "default": ($$result3) => renderTemplate`Loading` })} ${renderComponent($$result2, "Button", $$Button, { "variant": "primary", "disabled": true }, { "default": ($$result3) => renderTemplate`Disabled` })} ${renderComponent($$result2, "Button", $$Button, { "variant": "primary", "icon": "star", "iconPosition": "left" }, { "default": ($$result3) => renderTemplate`With Icon` })} </div> </div> </div> </section> <!-- Cards --> <section> <h2 class="text-3xl font-semibold mb-6">Card Components</h2> <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"> ${renderComponent($$result2, "Card", $$Card, { "variant": "default" }, { "default": ($$result3) => renderTemplate` <div class="card-header"> <h3 class="card-title">Default Card</h3> <p class="card-description">
A simple card with default styling and shadow.
</p> </div> <div class="card-content"> <p class="text-sm text-muted-foreground">
This is the card content area where you can place any content.
</p> </div> <div class="card-footer"> ${renderComponent($$result3, "Button", $$Button, { "size": "sm", "variant": "outline" }, { "default": ($$result4) => renderTemplate`Learn More` })} </div> ` })} ${renderComponent($$result2, "Card", $$Card, { "variant": "elevated", "interactive": true }, { "default": ($$result3) => renderTemplate` <div class="card-header"> <h3 class="card-title">Elevated Card</h3> <p class="card-description">
Interactive card with enhanced shadow and hover effects.
</p> </div> <div class="card-content"> <p class="text-sm text-muted-foreground">
Hover over this card to see the interaction effects.
</p> </div> ` })} ${renderComponent($$result2, "Card", $$Card, { "variant": "glass" }, { "default": ($$result3) => renderTemplate` <div class="card-header"> <h3 class="card-title">Glass Card</h3> <p class="card-description">
Modern glassmorphism effect with backdrop blur.
</p> </div> <div class="card-content"> <p class="text-sm text-muted-foreground">
Perfect for overlays and modern interfaces.
</p> </div> ` })} </div> </section> <!-- Input Components --> <section> <h2 class="text-3xl font-semibold mb-6">Input Components</h2> <div class="max-w-md space-y-4"> <div> <label class="block text-sm font-medium mb-2">Standard Input</label> <input type="text" class="input-modern" placeholder="Enter your message..."> </div> <div> <label class="block text-sm font-medium mb-2">Email Input</label> <input type="email" class="input-modern" placeholder="your@email.com"> </div> <div> <label class="block text-sm font-medium mb-2">Disabled Input</label> <input type="text" class="input-modern" placeholder="Disabled input" disabled> </div> </div> </section> <!-- Voice Agent Demo --> <section> <h2 class="text-3xl font-semibold mb-6">Voice Agent Components</h2> <div class="space-y-6"> <!-- Status Indicators --> <div> <h3 class="text-xl font-medium mb-4">Status Indicators</h3> <div class="flex flex-wrap gap-4"> <div class="voice-status connected"> <div class="voice-status-dot"></div> <span>Connected</span> </div> <div class="voice-status connecting"> <div class="voice-status-dot"></div> <span>Connecting</span> </div> <div class="voice-status error"> <div class="voice-status-dot"></div> <span>Error</span> </div> </div> </div> <!-- Audio Visualizer --> <div> <h3 class="text-xl font-medium mb-4">Audio Visualizer</h3> <div class="max-w-xs"> <div class="audio-visualizer active"> <div class="audio-bar" style="height: 8px;"></div> <div class="audio-bar" style="height: 12px;"></div> <div class="audio-bar" style="height: 16px;"></div> <div class="audio-bar" style="height: 12px;"></div> <div class="audio-bar" style="height: 8px;"></div> </div> </div> </div> <!-- Message Bubbles --> <div> <h3 class="text-xl font-medium mb-4">Message Bubbles</h3> <div class="max-w-md space-y-3"> <div class="message-bubble user"> <p class="text-sm">This is a user message bubble with modern styling.</p> </div> <div class="message-bubble assistant"> <p class="text-sm">This is an assistant response with proper contrast and spacing.</p> </div> <div class="message-bubble typing"> <div class="typing-indicator"> <div class="typing-dot"></div> <div class="typing-dot"></div> <div class="typing-dot"></div> </div> </div> </div> </div> </div> </section> <!-- Animation Examples --> <section> <h2 class="text-3xl font-semibold mb-6">Animations</h2> <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"> ${renderComponent($$result2, "Card", $$Card, { "class": "animate-fade-in" }, { "default": ($$result3) => renderTemplate` <div class="card-header"> <h3 class="card-title">Fade In</h3> </div> ` })} ${renderComponent($$result2, "Card", $$Card, { "class": "animate-slide-up" }, { "default": ($$result3) => renderTemplate` <div class="card-header"> <h3 class="card-title">Slide Up</h3> </div> ` })} ${renderComponent($$result2, "Card", $$Card, { "class": "animate-scale-in" }, { "default": ($$result3) => renderTemplate` <div class="card-header"> <h3 class="card-title">Scale In</h3> </div> ` })} </div> </section> <!-- Loading States --> <section> <h2 class="text-3xl font-semibold mb-6">Loading States</h2> <div class="space-y-4"> <div class="loading-skeleton h-4 w-3/4 rounded"></div> <div class="loading-skeleton h-4 w-1/2 rounded"></div> <div class="loading-skeleton h-4 w-2/3 rounded"></div> </div> </section> <!-- Dark Mode Toggle --> <section> <h2 class="text-3xl font-semibold mb-6">Theme Toggle</h2> ${renderComponent($$result2, "Button", $$Button, { "id": "theme-toggle", "variant": "outline" }, { "default": ($$result3) => renderTemplate`
Toggle Dark Mode
` })} </section> </div> <!-- Voice Agent Widget --> ${renderComponent($$result2, "VoiceAgentWidget", $$VoiceAgentWidget, {})} </main> ${renderScript($$result2, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/design-showcase.astro?astro&type=script&index=0&lang.ts")} ` })} <!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250802-770
 * @timestamp: 2025-08-02T11:00:00Z
 * @reasoning:
 * - **Objective:** Complete design system showcase page
 * - **Strategy:** Comprehensive demo of all components and features
 * - **Outcome:** Visual validation of modern UI implementation
 -->`;
}, "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/design-showcase.astro", void 0);

const $$file = "/home/dreamforge/ai_masterclass/executive-ai-training/src/pages/design-showcase.astro";
const $$url = "/design-showcase";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DesignShowcase,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
