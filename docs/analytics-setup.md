# Analytics Setup Guide

## Google Analytics 4 Integration

This site is pre-configured with comprehensive Google Analytics 4 tracking. Here's how to set it up:

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property
3. Copy your Measurement ID (starts with `G-`)

### 2. Configure Environment Variable

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your GA4 Measurement ID:
   ```
   PUBLIC_GA_MEASUREMENT_ID=G-YOUR-ID-HERE
   ```

### 3. What's Tracked

The site automatically tracks:

#### Page Analytics
- Page views
- Time on page
- Scroll depth (25%, 50%, 75%, 90%, 100%)
- External link clicks

#### User Interactions
- CTA button clicks
- Service card views
- Case study engagement
- Navigation clicks

#### Form Analytics
- AI Audit form starts
- Step completions
- Form abandonment
- Lead submissions

#### Conversion Events
- `generate_lead` - When audit form is submitted
- `schedule_consultation` - When Calendly meeting is booked
- `download_resource` - When gated content is accessed
- `sign_up` - When email signup occurs

### 4. Custom Events

The site fires these custom events:

- `ai_audit_progress` - Tracks wizard step navigation
- `audit_submission` - Captures form data (anonymized)
- `content_engagement` - Tracks interaction with services/case studies
- `calendly_scheduled` - Enhanced booking data
- `javascript_error` - Client-side error tracking

### 5. Enhanced E-commerce (Optional)

To track revenue from consultations:

1. Set up Enhanced E-commerce in GA4
2. The site already sends value data:
   - Strategy Session: $15,000
   - Workshop: $5,000
   - Retainer: $10,000/mo

### 6. Testing Your Setup

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. Open browser console
3. Navigate the site and verify events fire

### 7. Conversion Tracking

Set up these conversions in GA4:

1. **Lead Generation**
   - Event: `generate_lead`
   - Value: Assign based on your average deal size

2. **Strategy Session Booking**
   - Event: `schedule_consultation`
   - Value: $15,000 (or your session price)

3. **Form Engagement**
   - Event: `form_complete`
   - Track which forms drive conversions

### 8. Audience Segments

Create these audiences for remarketing:

1. **High-Intent Visitors**
   - Viewed services page
   - Spent >2 minutes on site
   - Scrolled >75% on any page

2. **Audit Starters**
   - Started AI Audit but didn't complete
   - Target with completion reminders

3. **Case Study Readers**
   - Engaged with case studies
   - High purchase intent

### 9. Dashboard Setup

Import our recommended dashboard configuration:

1. GA4 > Explore > Template Gallery
2. Create custom reports for:
   - AI Audit funnel analysis
   - Service page engagement
   - Conversion path analysis
   - Content effectiveness

### 10. Privacy Compliance

The implementation:
- Only loads GA in production
- Respects DNT headers (optional)
- No PII collection
- Cookie-less tracking available

For GDPR compliance, add a cookie consent banner that controls the GoogleAnalytics component loading.