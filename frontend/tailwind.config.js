/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jl: {
          dark: '#0a0a0f',
          darker: '#050508',
          card: '#111118',
          'card-border': '#1e1e2e',
          purple: '#8b5cf6',
          'purple-dark': '#6d28d9',
          pink: '#ec4899',
          'pink-dark': '#db2777',
          magenta: '#d946ef',
          accent: '#f472b6',
          muted: '#9ca3af',
          'muted-light': '#d1d5db',
        }
      },
      fontFamily: {
        display: ['"Permanent Marker"', 'cursive'],
        heading: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
