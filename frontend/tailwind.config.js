/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accent
        accent: {
          DEFAULT: '#c73e1d',
          hover: '#a83218',
          light: 'rgba(199, 62, 29, 0.1)',
        },
        // Backgrounds
        bg: {
          primary: '#faf9f7',
          secondary: '#f5f5f0',
          tertiary: '#ebe9e4',
        },
        // Text
        text: {
          primary: '#1a1a1a',
          secondary: '#6b6b6b',
          muted: '#9a9a9a',
        },
        // Semantic
        success: {
          DEFAULT: '#2d6a4f',
          light: 'rgba(45, 106, 79, 0.1)',
        },
        warning: {
          DEFAULT: '#d4a373',
          light: 'rgba(212, 163, 115, 0.15)',
        },
        danger: {
          DEFAULT: '#9b2226',
          light: 'rgba(155, 34, 38, 0.1)',
        },
        info: {
          DEFAULT: '#1d4e89',
          light: 'rgba(29, 78, 137, 0.1)',
        },
        // Border
        border: {
          DEFAULT: '#1a1a1a',
          light: '#e5e5e5',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Monaco', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'solid': '4px 4px 0 0 #1a1a1a',
        'solid-sm': '2px 2px 0 0 #1a1a1a',
        'solid-lg': '6px 6px 0 0 #1a1a1a',
        'solid-accent': '4px 4px 0 0 #c73e1d',
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
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
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}