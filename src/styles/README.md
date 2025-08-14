# Modern UI/UX Design System

A comprehensive design system built following shadcn/ui principles, specifically tailored for the voice agent interface and executive AI training platform.

## Overview

This design system provides a consistent, modern, and accessible foundation for all UI components. It features:

- **Design Tokens**: CSS custom properties for consistent theming
- **Component Library**: Reusable, accessible components
- **Smooth Animations**: Professional transitions and micro-interactions
- **Dark Mode Support**: Automatic theme switching
- **Voice Agent Specific**: Specialized components for AI voice interactions
- **Mobile Responsive**: Touch-friendly interfaces

## Core Files

### `design-system.css`
The main design system file containing:
- CSS custom properties (design tokens)
- Component base classes
- Animation keyframes
- Accessibility improvements

### `globals.css`
Enhanced global styles with:
- Tailwind integration
- Import of design system
- Legacy component compatibility

## Design Tokens

### Colors
```css
/* Semantic colors */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--secondary: 210 40% 96%;
--muted: 210 40% 96%;
--accent: 210 40% 96%;
--destructive: 0 84.2% 60.2%;
--border: 214.3 31.8% 91.4%;
--ring: 221.2 83.2% 53.3%;
```

### Typography Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing System (8px grid)
```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
```

## Component Classes

### Buttons
```html
<!-- Primary Button -->
<button class="btn-modern btn-primary btn-md">Primary</button>

<!-- Secondary Button -->
<button class="btn-modern btn-secondary btn-md">Secondary</button>

<!-- Outline Button -->
<button class="btn-modern btn-outline btn-md">Outline</button>

<!-- Ghost Button -->
<button class="btn-modern btn-ghost btn-md">Ghost</button>

<!-- Destructive Button -->
<button class="btn-modern btn-destructive btn-md">Delete</button>
```

### Cards
```html
<!-- Default Card -->
<div class="card-modern">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-description">Card description</p>
  </div>
  <div class="card-content">
    Content goes here
  </div>
  <div class="card-footer">
    Footer content
  </div>
</div>

<!-- Glass Effect Card -->
<div class="card-modern glass-effect">
  Content with glassmorphism
</div>
```

### Input Fields
```html
<!-- Standard Input -->
<input type="text" class="input-modern" placeholder="Enter text...">

<!-- With Focus Ring -->
<input type="email" class="input-modern" placeholder="your@email.com">
```

## Voice Agent Components

### Voice Status Indicator
```html
<div class="voice-status connected">
  <div class="voice-status-dot"></div>
  <span>Connected</span>
</div>
```

### Audio Visualizer
```html
<div class="audio-visualizer active">
  <div class="audio-bar"></div>
  <div class="audio-bar"></div>
  <div class="audio-bar"></div>
  <div class="audio-bar"></div>
  <div class="audio-bar"></div>
</div>
```

### Message Bubbles
```html
<!-- User Message -->
<div class="message-bubble user">
  <p class="text-sm">User message content</p>
</div>

<!-- Assistant Message -->
<div class="message-bubble assistant">
  <p class="text-sm">Assistant response</p>
</div>

<!-- Typing Indicator -->
<div class="message-bubble typing">
  <div class="typing-indicator">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>
</div>
```

### Floating Action Button
```html
<button class="voice-fab" aria-label="Open voice assistant">
  <svg class="w-6 h-6"><!-- Microphone icon --></svg>
</button>
```

## Animations

### Available Animations
- `animate-fade-in`: Fade in effect
- `animate-slide-up`: Slide up from bottom
- `animate-slide-down`: Slide down from top
- `animate-scale-in`: Scale in effect
- `animate-pulse-slow`: Slow pulse (2s)
- `animate-bounce-gentle`: Gentle bounce
- `animate-shimmer`: Loading shimmer effect
- `animate-audio-wave`: Audio visualization bars
- `animate-typing-bounce`: Typing indicator dots

### Usage
```html
<div class="card-modern animate-fade-in">Animated card</div>
<div class="message-bubble user animate-slide-up">New message</div>
```

## Accessibility Features

### Focus Management
- Consistent focus indicators with `focus-visible`
- Keyboard navigation support
- ARIA attributes for screen readers

### Reduced Motion
- Respects `prefers-reduced-motion: reduce`
- Fallbacks for animation-sensitive users

### Color Contrast
- WCAG AA compliant color ratios
- High contrast mode support

### Touch Targets
- Minimum 44px touch targets
- Hover states for interactive elements

## Dark Mode

### Automatic Detection
The system automatically detects user preference:
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

### Manual Toggle
```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Save preference
localStorage.setItem('theme', 'dark');
```

## Tailwind Integration

### Enhanced Config
The design system extends Tailwind with:
- Custom color variables
- Additional animations
- Extended spacing scale
- Custom shadows
- Border radius system

### Usage
```html
<!-- Use design system colors -->
<div class="bg-primary text-primary-foreground">Primary styled</div>

<!-- Use enhanced animations -->
<div class="animate-slide-up">Animated content</div>
```

## Component Examples

### Voice Agent Widget
```astro
---
import VoiceAgentWidget from '../components/VoiceAgentWidget.astro';
---

<!-- Floating widget -->
<VoiceAgentWidget position="bottom-right" size="md" />
```

### Modern Button
```astro
---
import Button from '../components/Button.astro';
---

<!-- Various button states -->
<Button variant="primary" size="lg">Primary Action</Button>
<Button variant="outline" loading={true}>Loading...</Button>
<Button variant="ghost" icon="star">With Icon</Button>
```

### Card Component
```astro
---
import Card from '../components/Card.astro';
---

<Card variant="elevated" interactive={true}>
  <h3>Interactive Card</h3>
  <p>Hover for effects</p>
</Card>
```

## Utility Classes

### Layout
- `.sr-only`: Screen reader only content
- `.truncate`: Text truncation with ellipsis
- `.loading-skeleton`: Loading state shimmer

### Glassmorphism
- `.glass-effect`: Backdrop blur with transparency

### Performance
- `.contain-layout`: CSS containment for layout
- `.contain-all`: Full CSS containment

## Browser Support

- **Modern Browsers**: Full feature support
- **CSS Grid**: Required for layout system
- **CSS Custom Properties**: Required for theming
- **Backdrop Filter**: Graceful degradation for glass effects

## Getting Started

1. **Import the design system**:
```css
@import './design-system.css';
```

2. **Use in components**:
```html
<button class="btn-modern btn-primary">Get Started</button>
```

3. **Enable dark mode**:
```html
<html class="dark">
```

## Best Practices

### Component Development
- Use semantic HTML elements
- Include proper ARIA attributes
- Test with keyboard navigation
- Verify color contrast ratios

### Performance
- Use CSS containment where appropriate
- Minimize animation complexity
- Optimize for mobile devices

### Consistency
- Use design tokens instead of hardcoded values
- Follow the 8px spacing grid
- Maintain consistent component patterns

## Testing

Visit `/design-showcase` to see all components in action with:
- Interactive examples
- Dark mode toggle
- Responsive breakpoints
- Animation demonstrations

---

*This design system follows modern web standards and accessibility guidelines to ensure a professional, inclusive user experience across all devices and user preferences.*