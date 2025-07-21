/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Nova Universe Brand Colors
        primary: {
          50: '#f0f2ff',
          100: '#e7eaff',
          200: '#d4d9ff',
          300: '#b8c0ff',
          400: '#9ba3ff',
          500: '#4E55FF', // Nova Primary
          600: '#3b41e6',
          700: '#2d33cc',
          800: '#1f26a3',
          900: '#12193A', // Nova Secondary
        },
        secondary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b8c8ff',
          400: '#91a6ff',
          500: '#636eff',
          600: '#4853f5',
          700: '#3b44e0',
          800: '#2f36b6',
          900: '#12193A', // Nova Secondary
        },
        accent: {
          50: '#f4fdff',
          100: '#e9fbff',
          200: '#c8f6ff',
          300: '#A4E3FA', // Nova Accent Glow
          400: '#7dd3f7',
          500: '#56c4f4',
          600: '#3aaceb',
          700: '#2e8fd7',
          800: '#2a73af',
          900: '#285d8a',
        },
        success: {
          50: '#f0fff4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#32D28B', // Nova Success
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFC107', // Nova Warning
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#FF4C4C', // Nova Danger
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        background: {
          50: '#F5F8FF', // Nova Background
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#17A2B8', // Nova Info
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
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
        glow: {
          '0%': { boxShadow: '0 0 5px #A4E3FA' },
          '100%': { boxShadow: '0 0 20px #A4E3FA, 0 0 30px #A4E3FA' },
        },
      },
    },
  },
  plugins: [],
}
