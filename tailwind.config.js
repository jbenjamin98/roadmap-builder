/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display Variable', 'Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: [
          'Plus Jakarta Sans Variable',
          'Plus Jakarta Sans',
          'Inter Variable',
          'Inter',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
