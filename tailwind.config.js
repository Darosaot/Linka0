/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zelda: {
          gold: '#C8A832',
          green: '#1a4a1a',
          darkgreen: '#0d2b0d',
          brown: '#5c3a1e',
          blue: '#1a3a5c',
          red: '#8b1a1a',
        }
      },
      fontFamily: {
        zelda: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
}
