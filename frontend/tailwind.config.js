/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sy: {
          bg:       '#0a1628',
          panel:    '#0f2040',
          card:     '#162a4a',
          border:   '#1e3a5f',
          accent:   '#00d4aa',
          blue:     '#3b82f6',
          danger:   '#ef4444',
          warning:  '#f59e0b',
          success:  '#10b981',
          critical: '#dc2626',
          muted:    '#64748b',
          text:     '#e2e8f0',
        }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':   'slide-up 0.3s ease-out',
        'fade-in':    'fade-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%,100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%':     { transform: 'scale(1.15)', opacity: '0.4' }
        },
        'slide-up': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
