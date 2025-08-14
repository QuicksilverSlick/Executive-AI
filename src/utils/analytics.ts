// Google Analytics tracking utilities
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track conversions
export const trackConversion = (
  conversionType: 'lead' | 'schedule' | 'download' | 'signup',
  value?: number
) => {
  const eventMap = {
    lead: 'generate_lead',
    schedule: 'schedule_consultation',
    download: 'download_resource',
    signup: 'sign_up'
  };

  trackEvent(eventMap[conversionType], {
    value: value || 0,
    currency: 'USD',
    conversion: true
  });
};

// Track page views (for SPAs)
export const trackPageView = (url?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.GA_MEASUREMENT_ID || '', {
      page_path: url || window.location.pathname
    });
  }
};

// Track form interactions
export const trackFormInteraction = (
  formName: string,
  action: 'start' | 'complete' | 'abandon'
) => {
  trackEvent(`form_${action}`, {
    form_name: formName,
    form_id: formName.toLowerCase().replace(/\s+/g, '_')
  });
};

// Track CTA clicks
export const trackCTA = (
  ctaName: string,
  location: string,
  destination?: string
) => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: location,
    cta_destination: destination || 'unknown'
  });
};

// Track AI Audit progress
export const trackAuditProgress = (
  step: number,
  action: 'view' | 'complete' | 'skip'
) => {
  trackEvent('ai_audit_progress', {
    step_number: step,
    step_action: action,
    step_name: `step_${step}`
  });
};

// Track content engagement
export const trackContentEngagement = (
  contentType: 'case_study' | 'service' | 'resource',
  contentName: string,
  action: 'view' | 'download' | 'share'
) => {
  trackEvent('content_engagement', {
    content_type: contentType,
    content_name: contentName,
    engagement_action: action
  });
};

// Track scroll depth
export const initScrollTracking = () => {
  if (typeof window === 'undefined') return;

  let maxScroll = 0;
  const thresholds = [25, 50, 75, 90, 100];
  const trackedThresholds = new Set<number>();

  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          trackEvent('scroll_depth', {
            percent_scrolled: threshold,
            page_title: document.title,
            page_location: window.location.pathname
          });
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', handleScroll);
  });
};

// Track time on page
export const initTimeTracking = () => {
  if (typeof window === 'undefined') return;

  const startTime = Date.now();
  const pagePath = window.location.pathname;

  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000); // in seconds
    
    trackEvent('time_on_page', {
      time_seconds: timeOnPage,
      time_minutes: Math.round(timeOnPage / 60),
      page_path: pagePath
    });
  });
};