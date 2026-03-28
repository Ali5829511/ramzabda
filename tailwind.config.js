/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#C9A44A', // الذهبي الأساسي
          dark: '#1a1a2e', // الأسود الداكن
          cream: '#F8F5EE', // الكريمي
          beige: '#F2EDE4',
          muted: '#6B6B6B',
          section: '#EDE8DF',
        },
        accent: {
          green: '#16a34a',
          red: '#dc2626',
          blue: '#3B82F6',
          yellow: '#F5A623',
        },
      },
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
        base: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
