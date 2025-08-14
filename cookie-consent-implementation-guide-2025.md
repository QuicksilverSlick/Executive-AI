# Cookie Consent Implementation Guide
## Executive AI Training - July 2025

### Overview

This guide provides implementation details for the cookie consent management system that complies with 2025 privacy regulations and integrates with the Executive AI Training website.

---

## 1. Cookie Consent Banner Component

### Technical Requirements

**Consent Banner Features:**
- Appears on first visit (no prior consent stored)
- Blocks non-essential cookies until consent given
- Granular category controls
- Accessibility compliant (WCAG 2.1 AA)
- Mobile-responsive design
- Supports GPC signals
- Multi-language ready

### Component Structure

```astro
---
// CookieConsent.astro
import Icon from './Icon.astro';

const categories = [
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website.',
    required: false
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'Enable enhanced functionality like chat and personalization.',
    required: false
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to deliver relevant content and measure campaigns.',
    required: false
  }
];
---

<div id="cookie-consent-banner" class="cookie-consent-container" role="dialog" aria-label="Cookie consent">
  <!-- Implementation details in full component -->
</div>
```

---

## 2. Consent State Management

### LocalStorage Schema

```javascript
// Consent state structure
const consentState = {
  version: "2.0",
  timestamp: "2025-07-01T10:30:00Z",
  consent: {
    essential: true, // Always true
    analytics: false,
    functional: false,
    marketing: false
  },
  gpc: false, // Global Privacy Control detected
  method: "banner", // banner, gpc, or preferences
  region: "US-CA" // Detected region for compliance
};
```

### Cookie Setting Logic

```javascript
// Only set cookies if consent exists
function canSetCookie(category) {
  const consent = getConsentState();
  return consent && consent.consent[category] === true;
}

// Wrap all non-essential cookie operations
if (canSetCookie('analytics')) {
  // Initialize Google Analytics
  gtag('consent', 'update', {
    'analytics_storage': 'granted'
  });
}
```

---

## 3. Google Analytics 4 Consent Mode v2

### Implementation for GA4

```javascript
// Initialize with denied by default
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Default to denied
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted' // Always granted for essential
});

// Update based on user consent
function updateGoogleConsent(consentState) {
  gtag('consent', 'update', {
    'analytics_storage': consentState.analytics ? 'granted' : 'denied',
    'functionality_storage': consentState.functional ? 'granted' : 'denied',
    'personalization_storage': consentState.functional ? 'granted' : 'denied',
    'ad_storage': consentState.marketing ? 'granted' : 'denied',
    'ad_user_data': consentState.marketing ? 'granted' : 'denied',
    'ad_personalization': consentState.marketing ? 'granted' : 'denied'
  });
}
```

---

## 4. Global Privacy Control (GPC) Support

### Detection and Handling

```javascript
// Detect GPC signal
function detectGPC() {
  return navigator.globalPrivacyControl === true;
}

// Auto-apply GPC preferences
if (detectGPC()) {
  // Automatically opt out of sale/sharing
  const gpcConsent = {
    essential: true,
    analytics: true, // May be allowed depending on jurisdiction
    functional: true, // Usually allowed
    marketing: false // Always denied with GPC
  };
  
  saveConsentState(gpcConsent, 'gpc');
  
  // Show notification
  showGPCNotification();
}
```

---

## 5. Regional Compliance

### Geographic Detection

```javascript
// Use CloudFlare headers or IP geolocation
function detectRegion() {
  const cfCountry = request.headers.get('CF-IPCountry');
  const cfRegion = request.headers.get('CF-Region');
  
  // Map to privacy regions
  if (cfCountry === 'US') {
    if (['CA', 'CO', 'CT', 'VA'].includes(cfRegion)) {
      return `US-${cfRegion}`;
    }
    return 'US-OTHER';
  }
  
  if (['DE', 'FR', 'IT', 'ES', ...EU_COUNTRIES].includes(cfCountry)) {
    return 'EU';
  }
  
  if (cfCountry === 'GB') return 'UK';
  if (cfCountry === 'CA') return 'CA';
  
  return 'OTHER';
}
```

### Region-Specific Banners

```javascript
// Customize banner based on region
function getRegionalBannerConfig(region) {
  const configs = {
    'EU': {
      requireExplicitConsent: true,
      showRejectAll: true,
      defaultState: 'denied',
      message: 'We use cookies to enhance your experience...'
    },
    'US-CA': {
      requireExplicitConsent: true,
      showDoNotSell: true,
      honorGPC: true,
      message: 'We use cookies and similar technologies...'
    },
    'UK': {
      requireExplicitConsent: true,
      showRejectAll: true,
      allowLegitimateInterest: true,
      message: 'We use cookies to provide our services...'
    }
  };
  
  return configs[region] || configs['OTHER'];
}
```

---

## 6. Cookie Preference Center

### Detailed Preference UI

```astro
---
// CookiePreferences.astro
---

<div id="cookie-preferences" class="cookie-preferences-modal">
  <div class="preferences-header">
    <h2>Cookie Preferences</h2>
    <p>Manage how we use cookies and similar technologies.</p>
  </div>
  
  <div class="preferences-categories">
    <!-- Essential Cookies (Always On) -->
    <div class="category-item">
      <div class="category-header">
        <h3>Essential Cookies</h3>
        <label class="toggle-switch disabled">
          <input type="checkbox" checked disabled />
          <span class="slider">Always On</span>
        </label>
      </div>
      <p>Required for the website to function. Cannot be disabled.</p>
      <details>
        <summary>View cookies</summary>
        <ul>
          <li>session_id - Session management</li>
          <li>csrf_token - Security</li>
          <li>theme_preference - Display settings</li>
        </ul>
      </details>
    </div>
    
    <!-- Other categories with toggles -->
  </div>
  
  <div class="preferences-actions">
    <button class="btn-save">Save Preferences</button>
    <button class="btn-accept-all">Accept All</button>
    <button class="btn-reject-all">Reject All</button>
  </div>
</div>
```

---

## 7. Third-Party Script Management

### Conditional Script Loading

```javascript
// Script loader utility
class ConditionalScriptLoader {
  static loadScript(src, category, callback) {
    if (!canSetCookie(category)) {
      console.log(`Blocked ${src} - no consent for ${category}`);
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }
  
  static loadAnalytics() {
    this.loadScript(
      'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX',
      'analytics',
      () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXX', {
          'anonymize_ip': true,
          'cookie_flags': 'SameSite=None;Secure'
        });
      }
    );
  }
}
```

---

## 8. Consent API Endpoints

### Backend API Structure

```javascript
// API routes for consent management
app.post('/api/consent/update', async (req, res) => {
  const { consent, timestamp, method } = req.body;
  const userId = req.session?.userId || generateAnonymousId();
  
  // Store consent record
  await db.consent.create({
    userId,
    consent,
    timestamp,
    method,
    ip: hashIP(req.ip), // Hash for privacy
    userAgent: req.headers['user-agent']
  });
  
  res.json({ success: true });
});

app.get('/api/consent/export/:userId', async (req, res) => {
  // GDPR data export
  const records = await db.consent.findAll({
    where: { userId: req.params.userId }
  });
  
  res.json(records);
});
```

---

## 9. Testing & Validation

### Automated Testing Suite

```javascript
// Cypress tests for cookie consent
describe('Cookie Consent', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });
  
  it('shows banner on first visit', () => {
    cy.visit('/');
    cy.get('#cookie-consent-banner').should('be.visible');
  });
  
  it('blocks GA4 until consent', () => {
    cy.visit('/');
    cy.window().then((win) => {
      expect(win.ga).to.be.undefined;
    });
  });
  
  it('honors GPC signal', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.navigator.globalPrivacyControl = true;
      }
    });
    cy.getCookie('marketing_consent').should('not.exist');
  });
});
```

---

## 10. Implementation Checklist

### Pre-Launch Requirements

- [ ] Cookie audit completed and documented
- [ ] Consent banner implemented and tested
- [ ] GA4 Consent Mode v2 configured
- [ ] GPC signal detection working
- [ ] Regional detection accurate
- [ ] Preference center functional
- [ ] Scripts load conditionally
- [ ] API endpoints secure
- [ ] Automated tests passing
- [ ] Accessibility audit passed
- [ ] Mobile experience optimized
- [ ] Documentation updated
- [ ] Legal review completed
- [ ] Performance impact minimal
- [ ] Fallback for JS disabled

### Post-Launch Monitoring

- [ ] Consent rates by region
- [ ] Script blocking effectiveness  
- [ ] User feedback on UX
- [ ] Compliance notifications
- [ ] Error logging for failures
- [ ] A/B test consent language
- [ ] Regular consent audits

---

## 11. Troubleshooting Guide

### Common Issues

**Banner Not Showing**
- Check for existing consent in localStorage
- Verify script loading order
- Check for JS errors

**Scripts Loading Without Consent**
- Audit all script tags for proper wrapping
- Check for hardcoded scripts
- Verify conditional loading logic

**GPC Not Working**
- Test browser support
- Check detection logic
- Verify auto-opt-out flow

**Regional Detection Failed**
- Fallback to safe defaults (EU-level)
- Log errors for investigation
- Consider IP geolocation service

---

## 12. Maintenance Schedule

### Regular Tasks

**Weekly**
- Review consent metrics
- Check for new regulations
- Monitor error logs

**Monthly**
- Update cookie inventory
- Test all consent flows
- Review third-party changes

**Quarterly**
- Full compliance audit
- Update documentation
- Performance optimization
- Legal review of changes

---

*This implementation guide ensures the Executive AI Training website maintains compliance with 2025 cookie regulations while providing a smooth user experience.*