/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Clash Display"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f6f7f4',
          100: '#eceee7',
          200: '#dbded3',
          300: '#c4c8b8',
          400: '#979d8a',
          500: '#6f7566',
          600: '#555b4e',
          700: '#43483e',
          800: '#2c3029',
          900: '#181b17',
        },
        accent: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce2ff',
          300: '#8fd1ff',
          400: '#58b6ff',
          500: '#2c97f4',
          600: '#1578d1',
          700: '#135faa',
          800: '#164f8b',
          900: '#19436f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'soft': '0 10px 30px -18px rgba(24, 27, 23, 0.24)',
        'medium': '0 24px 60px -28px rgba(24, 27, 23, 0.3)',
        'large': '0 40px 100px -42px rgba(24, 27, 23, 0.38)',
        'glow': '0 0 0 6px rgba(37, 99, 235, 0.14)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
