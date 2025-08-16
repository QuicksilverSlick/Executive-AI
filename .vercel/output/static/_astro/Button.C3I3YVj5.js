import{e as createAstro,f as createComponent,k as renderComponent,r as renderTemplate,n as renderSlot,m as maybeRenderHead}from"./astro/server.DAk61OsX.js";import"kleur/colors";import{a as $$Icon}from"./Layout.Dz-ECntR.js";const $$Astro=createAstro("https://executiveaitraining.com"),$$Button=createComponent(((e,t,r)=>{const n=e.createAstro($$Astro,t,r);n.self=$$Button;const{variant:o="primary",href:s,size:a="md",class:i="",target:c,rel:m,icon:l,iconPosition:d="left",disabled:p=!1,loading:$=!1,...u}=n.props,g={sm:16,md:20,lg:24},b=`btn-modern ${{primary:"btn-primary",secondary:"btn-secondary",outline:"btn-outline",ghost:"btn-ghost",destructive:"btn-destructive"}[o]} ${{sm:"btn-sm",md:"btn-md",lg:"btn-lg"}[a]} ${i}`.trim();return renderTemplate`${renderComponent(e,"Component",s?"a":"button",{class:b,href:s,target:c,rel:m,disabled:p||$,...u},{default:e=>renderTemplate`${$&&renderTemplate`${maybeRenderHead()}<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>`}${!$&&l&&"left"===d&&renderTemplate`${renderComponent(e,"Icon",$$Icon,{name:l,size:g[a],class:"mr-2"})}`}${renderSlot(e,r.default)} ${!$&&l&&"right"===d&&renderTemplate`${renderComponent(e,"Icon",$$Icon,{name:l,size:g[a],class:"ml-2"})}`}`})} <!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 2.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250802-770
 * @timestamp: 2025-08-02T10:30:00Z
 * @reasoning:
 * - **Objective:** Enhanced button with loading states and new variants
 * - **Strategy:** Modern design system integration with accessibility
 * - **Outcome:** Professional button component ready for use
 -->`}),"/home/dreamforge/ai_masterclass/executive-ai-training/src/components/Button.astro",void 0);export{$$Button as $};