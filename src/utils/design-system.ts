/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Design system utilities and helper functions
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250802-770
 * @init-timestamp: 2025-08-02T11:15:00Z
 * @reasoning:
 * - **Objective:** Provide utility functions for design system consistency
 * - **Strategy:** TypeScript utilities for component styling and theming
 * - **Outcome:** Reusable helpers for maintaining design consistency
 */

type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean };

/**
 * Utility function to merge class names intelligently
 * Lightweight alternative to clsx without external dependencies
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .filter(Boolean)
    .map(input => {
      if (typeof input === 'string') return input;
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

/**
 * Design system size mappings
 */
export const designSystem = {
  spacing: {
    xs: 'var(--spacing-1)',
    sm: 'var(--spacing-2)',
    md: 'var(--spacing-4)',
    lg: 'var(--spacing-6)',
    xl: 'var(--spacing-8)',
    '2xl': 'var(--spacing-12)',
  },
  
  typography: {
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    base: 'var(--text-base)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    '2xl': 'var(--text-2xl)',
    '3xl': 'var(--text-3xl)',
    '4xl': 'var(--text-4xl)',
  },
  
  radius: {
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
  },
  
  shadows: {
    sm: 'var(--shadow-sm)',
    default: 'var(--shadow)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
  
  durations: {
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    slow: 'var(--duration-slow)',
  }
} as const;

/**
 * Button size and variant helpers
 */
export const buttonVariants = {
  variant: {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    destructive: 'btn-destructive',
  },
  size: {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }
} as const;

/**
 * Card variant helpers
 */
export const cardVariants = {
  variant: {
    default: 'card-modern',
    outlined: 'card-modern border-2',
    elevated: 'card-modern shadow-smooth-lg',
    glass: 'card-modern glass-effect',
  },
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
} as const;

/**
 * Voice agent status helpers
 */
export const voiceStatus = {
  connected: 'voice-status connected',
  connecting: 'voice-status connecting',
  error: 'voice-status error',
  recording: 'voice-status recording',
  processing: 'voice-status processing',
} as const;

/**
 * Animation helpers
 */
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleIn: 'animate-scale-in',
  pulse: 'animate-pulse-slow',
  bounce: 'animate-bounce-gentle',
  shimmer: 'animate-shimmer',
} as const;

/**
 * Responsive helpers
 */
export const responsive = {
  container: 'container mx-auto px-6',
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-1 md:grid-cols-2',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
  gap: {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  }
} as const;

/**
 * Theme management utilities
 */
export class ThemeManager {
  private static readonly STORAGE_KEY = 'theme';
  
  static getTheme(): 'light' | 'dark' | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.STORAGE_KEY) as 'light' | 'dark' | null;
  }
  
  static setTheme(theme: 'light' | 'dark'): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
  
  static toggleTheme(): 'light' | 'dark' {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }
  
  static initializeTheme(): void {
    if (typeof window === 'undefined') return;
    
    const savedTheme = this.getTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  static trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }
  
  static restoreFocus(previousElement: HTMLElement | null): void {
    if (previousElement) {
      previousElement.focus();
    }
  }
}

/**
 * Animation utilities
 */
export class AnimationManager {
  static observeElements(selector: string, animationClass: string): void {
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(animationClass);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    document.querySelectorAll(selector).forEach((el) => {
      observer.observe(el);
    });
  }
  
  static respectsReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

/**
 * Accessibility utilities
 */
export class A11yManager {
  static announceToScreenReader(message: string): void {
    if (typeof window === 'undefined') return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  static setAriaExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  }
  
  static generateId(prefix: string = 'ds'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250802-770
 * @timestamp: 2025-08-02T11:15:00Z
 * @reasoning:
 * - **Objective:** Complete design system utilities
 * - **Strategy:** TypeScript helpers for theming, focus, animations, and a11y
 * - **Outcome:** Robust utility library for consistent UI development
 */