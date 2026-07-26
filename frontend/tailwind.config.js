/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sy: {
          bg: '#07111f',
          soft: '#0b1b2e',
          panel: '#102840',
          strong: '#142f4b',
          card: '#132d49',
          paper: '#f6f8fb',
          border: '#234563',
          accent: '#12c7a0',
          blue: '#4f8cff',
          danger: '#ef5b5b',
          warning: '#e7b84b',
          high: '#f28b46',
          success: '#2fc77a',
          critical: '#ef5b5b',
          offline: '#94a3b8',
          muted: '#6b7d90',
          text: '#e8eef5',
          ink: '#102032'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        panel: '0 14px 38px rgba(2, 10, 20, 0.18)',
        critical: '0 0 0 1px rgba(239,91,91,0.3), 0 18px 45px rgba(239,91,91,0.12)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'ticker-in': 'ticker-in 0.45s ease-out'
      },
      keyframes: {
        'pulse-ring': { '0%,100%': { transform: 'scale(1)', opacity: '0.8' }, '50%': { transform: 'scale(1.15)', opacity: '0.4' } },
        'pulse-soft': { '0%,100%': { opacity: '0.72' }, '50%': { opacity: '1' } },
        'slide-up': { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'ticker-in': { from: { transform: 'translateX(-10px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } }
      }
    }
  },
  plugins: []
};
