import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Neutral backgrounds (dark scale) ── */
        bg: {
          base:    '#0B0B0D',  /* near-black chrome        */
          canvas:  '#0F1722',  /* page canvas              */
          surface: '#0F172A',  /* primary surface          */
          panel:   '#111827',  /* panels / drawers         */
          card:    '#0B1220',  /* card surface (deepest)   */
          elevated:'#1A1E28',  /* elevated UI elements     */
          subtle:  '#1A1E28',  /* alias for elevated       */
        },
        /* ── Borders ── */
        border: {
          DEFAULT: '#1F2937',
          muted:   '#131B24',
          strong:  '#374151',
        },
        /* ── Text ── */
        text: {
          primary:   '#E6EEF8',
          secondary: '#A1AAB2',
          tertiary:  '#64748B',
          muted:     '#64748B',
          inverse:   '#0B0B0D',
        },
        /* ── Accent — teal (brief: --accent-teal-500) ── */
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0EA5A4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#134e4a',
        },
        /* ── Accent — amber (brief: --accent-warm-500) ── */
        amber: {
          400: '#fbbf24',
          500: '#F59E0B',
          600: '#d97706',
        },
        /* ── Semantic status ── */
        status: {
          error:   '#EF4444',
          success: '#16A34A',
          warning: '#F59E0B',
          info:    '#38BDF8',
        },
        /* ── Legacy aliases ── */
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0EA5A4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#134e4a',
        },
        accent: {
          50:  '#fffbeb',
          400: '#fbbf24',
          500: '#F59E0B',
          600: '#d97706',
        },
        surface: {
          DEFAULT: '#0F172A',
          card:    '#0B1220',
          dark:    '#0B0B0D',
          'dark-card': '#0F172A',
        },
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'SF Mono', 'monospace'],
      },

      fontSize: {
        /* Brief typography scale */
        'display':    ['clamp(2rem,5vw,2.5rem)',   { lineHeight: '3.5rem',   letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['clamp(2.5rem,6vw,3.5rem)', { lineHeight: '1.05',     letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-sm': ['clamp(1.75rem,3.5vw,2rem)',{ lineHeight: '1.1',      letterSpacing: '-0.02em'                   }],
        'h1':         ['2.5rem',   { lineHeight: '3.5rem',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2':         ['1.75rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3':         ['1.375rem', { lineHeight: '2rem',    letterSpacing: '0',       fontWeight: '600' }],
      },

      borderRadius: {
        input:  '0.75rem',   /* 12px — brief: inputs */
        panel:  '0.625rem',  /* 10px — brief: panels */
        card:   '0.625rem',
      },

      boxShadow: {
        /* Three elevation levels per brief */
        'elevation-0': 'none',
        'elevation-1': '0 1px 4px 0 rgb(0 0 0/0.45), 0 1px 2px -1px rgb(0 0 0/0.3)',
        'elevation-2': '0 8px 32px 0 rgb(0 0 0/0.55), 0 2px 8px -2px rgb(0 0 0/0.45)',
        /* Run-code hover per brief microinteraction spec */
        'run-hover':   '0 8px 20px rgba(2,6,23,0.4)',
        'glow-teal':   '0 0 20px 0 rgb(14 165 164/0.25)',
        /* Aliases */
        'card':        '0 1px 4px 0 rgb(0 0 0/0.45), 0 1px 2px -1px rgb(0 0 0/0.3)',
        'card-hover':  '0 8px 32px 0 rgb(0 0 0/0.55), 0 2px 8px -2px rgb(0 0 0/0.45)',
        'panel':       '0 0 0 1px #1F2937, 0 4px 16px 0 rgb(0 0 0/0.5)',
        'float':       '0 4px 24px 0 rgb(0 0 0/0.6), 0 0 0 1px #1F2937',
      },

      animation: {
        'fade-up':     'fadeUp 0.32s cubic-bezier(0.2,0.9,0.2,1) forwards',
        'fade-in':     'fadeIn 0.25s ease-out forwards',
        'shimmer':     'shimmer 1.8s linear infinite',
        'live-pulse':  'livePulse 2s ease-in-out infinite',
        'hero-float':  'heroFloat 10s ease-in-out infinite',
        'slide-in-r':  'slideInRight 0.28s cubic-bezier(0.2,0.9,0.2,1) forwards',
        'slide-out-r': 'slideOutRight 0.22s cubic-bezier(0.4,0,0.2,1) forwards',
      },

      keyframes: {
        fadeUp:        { '0%': { opacity:'0', transform:'translateY(8px)' },   '100%': { opacity:'1', transform:'translateY(0)'    } },
        fadeIn:        { '0%': { opacity:'0'                              },   '100%': { opacity:'1'                               } },
        shimmer:       { '0%': { backgroundPosition:'-200% 0'            },   '100%': { backgroundPosition:'200% 0'              } },
        livePulse:     { '0%,100%':{ opacity:'1',transform:'scale(1)'    },   '50%':  { opacity:'0.5',transform:'scale(0.9)'      } },
        heroFloat:     { '0%,100%':{ transform:'translateY(0px)'         },   '50%':  { transform:'translateY(-10px)'             } },
        slideInRight:  { '0%': { opacity:'0', transform:'translateX(16px)' }, '100%': { opacity:'1', transform:'translateX(0)'    } },
        slideOutRight: { '0%': { opacity:'1', transform:'translateX(0)'   }, '100%': { opacity:'0', transform:'translateX(16px)'  } },
      },

      transitionTimingFunction: {
        /* Brief easing tokens */
        'enter':  'cubic-bezier(0.2, 0.9, 0.2, 1)',
        'exit':   'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'spring': 'cubic-bezier(0.2, 0.9, 0.2, 1)',
      },

      transitionDuration: {
        '80':  '80ms',
        '120': '120ms',
        '180': '180ms',
        '220': '220ms',
        '360': '360ms',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
