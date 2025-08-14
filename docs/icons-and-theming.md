# Icons and Theming Guide

## Icon System

This project uses **Astro Icon** with **Lucide** icons for a consistent, performant icon system.

### Why Astro Icon?
- Zero runtime JavaScript - all icons are inlined as SVG at build time
- Automatic optimization with SVGO
- Tree-shaking - only icons you use are included
- TypeScript support with autocomplete
- Accessible by default

### Available Icon Sets
- **Lucide** (primary): 1,500+ minimalist icons with consistent 24x24 viewbox
- **MDI** (Material Design Icons): Additional icons if needed

### Using Icons

#### Basic Usage
```astro
---
import { Icon } from 'astro-icon/components';
// or use our wrapper component
import Icon from '@/components/Icon.astro';
---

<!-- Basic icon -->
<Icon name="lucide:home" />

<!-- With size -->
<Icon name="lucide:settings" size={32} />

<!-- With custom styling -->
<Icon name="lucide:user" class="text-brand-gold w-6 h-6" />
```

#### In Buttons
```astro
<Button icon="lucide:download" href="/download">
  Download PDF
</Button>

<!-- Icon on right -->
<Button icon="lucide:arrow-right" iconPosition="right">
  Continue
</Button>
```

### Common Icons Reference

**Navigation**
- `lucide:menu` - Hamburger menu
- `lucide:x` - Close
- `lucide:chevron-down` - Dropdown arrow
- `lucide:arrow-right` - Next/Continue

**Actions**
- `lucide:download` - Download
- `lucide:share-2` - Share
- `lucide:copy` - Copy
- `lucide:external-link` - External link

**UI Elements**
- `lucide:sun` - Light mode
- `lucide:moon` - Dark mode
- `lucide:monitor` - System theme
- `lucide:check` - Success/Complete
- `lucide:alert-circle` - Warning
- `lucide:info` - Information

**Business**
- `lucide:calendar` - Schedule/Calendar
- `lucide:clock` - Time
- `lucide:mail` - Email
- `lucide:phone` - Phone
- `lucide:building-2` - Company
- `lucide:users` - Team

### Finding Icons
Browse all available icons at:
- [Lucide Icons](https://lucide.dev/icons/)
- [Iconify](https://icon-sets.iconify.design/lucide/)

## Theme System

The site supports three theme modes: Light, Dark, and System (auto).

### Theme Features
- **No Flash**: Theme is applied before render using inline script
- **System Preference**: Respects OS dark mode setting
- **Persistent**: User preference saved to localStorage
- **Smooth Transitions**: All color changes are animated

### Theme Implementation

#### CSS Classes
The theme system uses Tailwind's class-based dark mode:

```css
/* Light mode (default) */
.bg-white

/* Dark mode variant */
.dark:bg-dark-surface
```

#### Color Palette

**Light Mode**
- Background: `brand-white` (#F9F9F9)
- Text: `brand-charcoal` (#1D1D1F)
- Primary: `brand-gold` (#B48628)
- Secondary: `brand-blue` (#0A2240)

**Dark Mode**
- Background: `dark-bg` (#0F0F10)
- Surface: `dark-surface` (#1A1A1C)
- Border: `dark-border` (#2A2A2D)
- Text: `dark-text` (#E4E4E7)
- Muted: `dark-muted` (#A1A1AA)

### Using Dark Mode Classes

```astro
<!-- Background -->
<div class="bg-white dark:bg-dark-bg">

<!-- Text -->
<p class="text-brand-charcoal dark:text-dark-text">

<!-- Borders -->
<div class="border-gray-200 dark:border-dark-border">

<!-- Hover States -->
<a class="hover:text-brand-blue dark:hover:text-brand-gold">
```

### Theme Toggle Component

The theme toggle is included in the main navigation:

```astro
---
import ThemeToggle from '@/components/ThemeToggle.astro';
---

<nav>
  <!-- Other nav items -->
  <ThemeToggle />
</nav>
```

### JavaScript API

```javascript
// Get current theme
const theme = localStorage.getItem('theme') || 'system';

// Set theme
function setTheme(theme) {
  if (theme === 'system') {
    localStorage.removeItem('theme');
  } else {
    localStorage.setItem('theme', theme);
  }
  
  // Apply theme
  const isDark = theme === 'dark' || 
    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
  document.documentElement.classList.toggle('dark', isDark);
}
```

### Best Practices

1. **Always provide dark variants** for backgrounds, text, and borders
2. **Test contrast ratios** in both modes (WCAG AA minimum)
3. **Use semantic color names** (e.g., `dark-surface` not `gray-800`)
4. **Avoid pure black/white** - use off-blacks and off-whites
5. **Consider images** - some may need filters in dark mode

### Component Examples

#### Card Component
```astro
<div class="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
  <h3 class="text-brand-charcoal dark:text-dark-text">
    Card Title
  </h3>
  <p class="text-gray-600 dark:text-dark-muted">
    Card description text
  </p>
</div>
```

#### Button Component
```astro
<!-- Primary button stays the same -->
<button class="bg-brand-gold text-white hover:bg-brand-gold/90">
  Primary Action
</button>

<!-- Secondary adjusts -->
<button class="bg-gray-100 dark:bg-dark-surface text-brand-charcoal dark:text-dark-text">
  Secondary Action
</button>
```

## Accessibility

### Icons
- Decorative icons use `aria-hidden="true"`
- Functional icons have proper labels
- Icon-only buttons include `aria-label`

### Theme Toggle
- Keyboard accessible (Tab, Enter/Space)
- Screen reader announces current theme
- Focus indicators in both modes

### Color Contrast
- All text meets WCAG AA standards
- Important UI elements have 3:1 contrast
- Focus indicators visible in both themes