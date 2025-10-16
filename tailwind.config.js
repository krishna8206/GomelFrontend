/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        primaryDark: '#2563EB',
        surface: '#E0F2FE',
        background: '#FFFFFF',
        text: '#1E293B',
        muted: '#475569',
      },
    },
  },
  plugins: [],
};
