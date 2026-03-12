/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        background: 'var(--bg-900)',
        foreground: 'var(--text-primary)',
        'surface-dark': 'var(--bg-800)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-tertiary': 'var(--accent-tertiary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        border: 'var(--border-neutral)',
        'border-focus': 'var(--border-focus)',
        // Legacy ns-* aliases — hex values required for opacity modifier support
        'ns-accent': '#137fec',
        'ns-bg-900': '#0B0B0D',
        'ns-bg-800': '#0F1722',
        'ns-grey': {
          100: '#F5F5F7',
          300: '#C9CDD4',
          400: '#A6AAB0',
          500: '#6B7178',
          600: '#4A4F57',
          700: '#2E3238',
          800: '#1A1D21',
        },
        'ns-success': '#16A34A',
        'ns-danger': '#EF4444',
        'ns-teal': '#0EA5A4'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      transitionDuration: {
        micro: 'var(--motion-micro)',
        small: 'var(--motion-small)',
        medium: 'var(--motion-medium)',
        large: 'var(--motion-large)'
      },
      transitionTimingFunction: {
        primary: 'var(--ease-primary)'
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in var(--motion-medium) var(--ease-primary) forwards',
        'slide-up': 'slide-up var(--motion-large) var(--ease-primary) forwards'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
