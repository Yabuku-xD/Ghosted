/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Accent - Emerald with cyan gradient base
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: 'rgba(16, 185, 129, 0.1)',
          lighter: 'rgba(16, 185, 129, 0.05)',
          glow: 'rgba(16, 185, 129, 0.3)',
        },
        // Premium Dark Theme Backgrounds
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a25',
          elevated: '#1e1e2e',
          glass: 'rgba(255, 255, 255, 0.03)',
        },
        // Text colors for dark theme
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        // Semantic colors - vibrant for dark theme
        success: {
          DEFAULT: '#22c55e',
          light: 'rgba(34, 197, 94, 0.1)',
          glow: 'rgba(34, 197, 94, 0.3)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: 'rgba(245, 158, 11, 0.1)',
          glow: 'rgba(245, 158, 11, 0.3)',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: 'rgba(239, 68, 68, 0.1)',
          glow: 'rgba(239, 68, 68, 0.3)',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: 'rgba(59, 130, 246, 0.1)',
          glow: 'rgba(59, 130, 246, 0.3)',
        },
        // Border colors for glassmorphism
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          light: 'rgba(255, 255, 255, 0.04)',
          accent: 'rgba(16, 185, 129, 0.3)',
        },
        // Cyan for gradient accents
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        // Violet for gradient accents
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
      },
      fontFamily: {
        // Premium font stack - Geist for UI
        display: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        // Premium shadows for dark theme
        'glow': '0 0 40px rgba(16, 185, 129, 0.15)',
        'glow-lg': '0 0 60px rgba(16, 185, 129, 0.2)',
        'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'floating': '0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.1)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
        // Legacy shadows for compatibility
        'diffusion': '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
        'diffusion-sm': '0 10px 25px -10px rgba(0, 0, 0, 0.2)',
        'diffusion-lg': '0 30px 60px -20px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
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
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.03)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
        },
        '.glass-nav': {
          'background': 'rgba(10, 10, 15, 0.7)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'border-bottom': '1px solid rgba(255, 255, 255, 0.05)',
        },
      })
    },
  ],
}
