#!/usr/bin/env node

// Color mapping from old to new
const colorMappings = {
  // Background colors
  'bg-brand-white': 'bg-brand-pearl',
  'bg-brand-blue': 'bg-brand-navy',
  'dark:bg-brand-gold': 'dark:bg-accent-gold',
  'dark:bg-accent-amber': 'dark:bg-accent-gold',
  'dark:bg-accent-blue': 'dark:bg-dark-navy',
  'dark:bg-accent-emerald': 'dark:bg-semantic-success',
  'dark:bg-accent-violet': 'dark:bg-dark-surface-3',
  
  // Text colors
  'text-brand-white': 'text-brand-pearl',
  'text-brand-blue': 'text-brand-navy',
  'dark:text-brand-gold': 'dark:text-accent-gold',
  'dark:text-accent-amber': 'dark:text-accent-gold',
  'dark:text-accent-blue': 'dark:text-accent-sky',
  'dark:text-accent-emerald': 'dark:text-semantic-success',
  
  // Border colors
  'border-brand-blue': 'border-brand-navy',
  'dark:border-accent-amber': 'dark:border-accent-gold',
  
  // Ring colors
  'ring-brand-blue': 'ring-brand-navy',
  'dark:ring-accent-amber': 'dark:ring-accent-gold',
  
  // Hover states
  'hover:text-brand-blue': 'hover:text-brand-navy',
  'dark:hover:text-brand-gold': 'dark:hover:text-accent-gold',
  'dark:hover:text-accent-blue': 'dark:hover:text-accent-sky',
  'dark:hover:bg-brand-gold': 'dark:hover:bg-accent-gold',
  
  // Focus states
  'focus:ring-brand-blue': 'focus:ring-brand-navy',
  'dark:focus:ring-brand-gold': 'dark:focus:ring-accent-gold',
  'dark:focus:ring-accent-blue': 'dark:focus:ring-accent-sky',
};

console.log('Color mapping reference created. Use these mappings to update components.');
console.log('\nKey updates needed:');
console.log('1. Replace brand-white with brand-pearl');
console.log('2. Replace brand-blue with brand-navy');
console.log('3. Replace accent-amber with accent-gold in dark mode');
console.log('4. Replace accent-blue with dark-navy or accent-sky as appropriate');
console.log('5. Ensure gold colors use warmer variants in dark mode');