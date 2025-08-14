/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Modern Design System Colors (shadcn/ui compatible)
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					gold: '#D4A034',        // Accent gold for components
					'gold-light': '#E6B347', // Lighter variant
					'gold-dark': '#B48628',  // Darker variant
					sky: '#38bdf8',         // Sky blue
					'sky-dark': '#0284c7',  // Darker sky
					green: '#22c55e',       // Success green
					'green-dark': '#16a34a', // Darker green
					coral: '#fb923c',       // Coral orange
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				
				// Core Brand Colors - Used in both themes
				'brand': {
					// Primary brand colors
					'charcoal': '#1D1D1F',    // Deep charcoal - sophistication
					'navy': '#0A2240',        // Executive navy - trust & stability
					'gold': '#B48628',        // Premium gold - excellence & success
					'pearl': '#F9F9F9',       // Off-white - clarity
					
					// Brand color variations for dark mode
					'navy-light': '#1A3A5C',  // Lighter navy for dark backgrounds
					'gold-warm': '#D4A034',   // Warmer gold for dark mode
					'gold-muted': '#8B6914',  // Muted gold for subtle accents
				},
				
				// Cohesive Dark Theme Palette
				'dark': {
					// Background hierarchy - Navy-tinted grays for brand cohesion
					'base': '#0B0D10',        // Navy-black base
					'surface': '#111418',     // Slightly navy-tinted surface
					'surface-2': '#1A1E24',   // Navigation/cards
					'surface-3': '#22272E',   // Hover states
					'surface-4': '#2C323B',   // Input fields
					
					// Text hierarchy - Warm whites for softer feel
					'text': '#FAFAFA',        // Soft white (not pure white)
					'text-secondary': '#E1E4E8',  // Warm gray
					'text-tertiary': '#B1B7C0',   // Muted text
					'text-muted': '#7A8290',      // Disabled state
					
					// Borders - Consistent with surfaces
					'border': '#2C323B',
					'border-hover': '#3A414D',
					
					// Brand colors adapted for dark mode
					'gold': '#D4A034',        // Brighter gold for dark backgrounds
					'navy': '#1A3A5C',        // Lighter navy for visibility
				},
				
				// Voice Agent specific colors
				'voice': {
					'connected': '#10b981',   // Success green
					'connecting': '#f59e0b',  // Warning amber
					'error': '#ef4444',       // Error red
					'recording': '#dc2626',   // Recording red
					'processing': '#d97706',  // Processing orange
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.5s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
				'scale-in': 'scaleIn 0.2s ease-out',
				'pulse-slow': 'pulse 2s infinite',
				'bounce-gentle': 'bounceGentle 0.6s ease-out',
				'shimmer': 'shimmer 1.5s infinite',
				'audio-wave': 'audioWave 1.5s ease-in-out infinite alternate',
				'typing-bounce': 'typingBounce 1.4s ease-in-out infinite both',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				bounceGentle: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				audioWave: {
					'0%': { height: '4px' },
					'100%': { height: '20px' },
				},
				typingBounce: {
					'0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
					'40%': { transform: 'scale(1)', opacity: '1' },
				},
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'smooth': '0 2px 8px 0 rgb(0 0 0 / 0.05)',
				'smooth-lg': '0 4px 16px 0 rgb(0 0 0 / 0.08)',
				'smooth-xl': '0 8px 32px 0 rgb(0 0 0 / 0.12)',
			},
		},
	},
	plugins: [],
}