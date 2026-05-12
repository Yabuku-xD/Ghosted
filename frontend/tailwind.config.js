/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm cognac/amber accent — RGB channels for opacity modifier support
        accent: {
          DEFAULT: 'rgb(var(--rgb-accent) / <alpha-value>)',
          hover: '#a5652a',
          light: 'var(--color-accent-light)',
          lighter: 'var(--color-accent-lighter)',
          glow: 'var(--color-accent-glow)',
        },
        // Backgrounds — RGB channels so /85, /95, from-*, via-* work in both themes
        bg: {
          primary: 'rgb(var(--rgb-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--rgb-bg-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--rgb-bg-tertiary) / <alpha-value>)',
          elevated: 'rgb(var(--rgb-bg-elevated) / <alpha-value>)',
          glass: 'var(--color-bg-glass)',
        },
        // Text — RGB channels for opacity modifier support
        text: {
          primary: 'rgb(var(--rgb-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--rgb-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--rgb-text-muted) / <alpha-value>)',
        },
        // Semantic colors
        success: {
          DEFAULT: '#4a9e6e',
          light: 'rgba(74, 158, 110, 0.10)',
          glow: 'rgba(74, 158, 110, 0.25)',
        },
        warning: {
          DEFAULT: '#d4882e',
          light: 'rgba(212, 136, 46, 0.10)',
          glow: 'rgba(212, 136, 46, 0.25)',
        },
        danger: {
          DEFAULT: '#c44a40',
          light: 'rgba(196, 74, 64, 0.10)',
          glow: 'rgba(196, 74, 64, 0.25)',
        },
        info: {
          DEFAULT: '#4878c4',
          light: 'rgba(72, 120, 196, 0.10)',
          glow: 'rgba(72, 120, 196, 0.25)',
        },
        // Border colors via CSS variables so they adapt in light mode
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
          accent: 'var(--color-border-accent)',
        },
      },
      fontFamily: {
        // Sailors Slant — hero display only
        display: ['"Sailors Slant"', 'Georgia', 'serif'],
        // Open Sauce Sans — UI workhorse
        sans: ['"Open Sauce Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        // Peace Sans — kicker labels and stat markers
        kicker: ['"Peace Sans"', 'system-ui', 'sans-serif'],
        // Geist Mono — code and data
        mono: ['"Geist Mono"', 'SF Mono', 'Monaco', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(196, 129, 58, 0.14)',
        'glow-lg': '0 0 60px rgba(196, 129, 58, 0.20)',
        'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.55)',
        'floating': '0 20px 40px -10px rgba(0, 0, 0, 0.45), 0 0 20px rgba(196, 129, 58, 0.10)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 248, 238, 0.10), inset 0 -1px 0 rgba(0, 0, 0, 0.20)',
        'diffusion': '0 20px 40px -15px rgba(0, 0, 0, 0.35)',
        'diffusion-sm': '0 10px 25px -10px rgba(0, 0, 0, 0.25)',
        'diffusion-lg': '0 30px 60px -20px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #c4813a 0%, #a5652a 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'slide-in': 'slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      letterSpacing: {
        'tighter': '-0.04em',
        'tight': '-0.02em',
      },
      lineHeight: {
        'none': '1',
        'tight': '1.15',
        'snug': '1.35',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}
