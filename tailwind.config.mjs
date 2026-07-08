/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F1',
        panel: '#F1EBDF',
        ink: '#14110A',
        'ink-elev': '#2B261B',
        gold: {
          200: '#DDC49A',
          400: '#C2A06C',
          500: '#AE8C64',
          600: '#93704A',
        },
      },
      fontFamily: {
        sans: ['General Sans', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Bodoni Moda', 'serif'],
      },
    },
  },
  plugins: [],
};
