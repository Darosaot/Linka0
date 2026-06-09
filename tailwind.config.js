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
          // Light palette (main UI) — warm sage green
          bg: '#f0f5e8',        // very light sage, clearly green but airy
          surface: '#f8faf4',   // card surface (near white with green tint)
          border: '#d0ddc0',    // soft green border
          // Text
          ink: '#1c2e1c',       // near-black dark green
          muted: '#627052',     // muted body text
          // Accents
          gold: '#8a6e00',      // gold readable on light bg
          goldlight: '#C8A832', // gold for dark backgrounds
          // Dark surfaces (simulation screen, badges)
          green: '#2a5a2a',
          darkgreen: '#0d2b0d',
          // Status
          red: '#8b1a1a',
          blue: '#1a3a5c',
        }
      },
      fontFamily: {
        zelda: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
}
