/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        action: 'var(--action)',
        'action-hover': 'var(--action-hover)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
      },
    },
  },
  plugins: [],
}