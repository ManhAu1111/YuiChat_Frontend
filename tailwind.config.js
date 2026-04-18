/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple Design System — DESIGN.md
        apple: {
          black:       '#000000',
          'bg-light':  '#f5f5f7',
          'text-dark': '#1d1d1f',
          blue:        '#0071e3',
          'blue-link': '#0066cc',
          'blue-dark': '#2997ff',
          // Dark surfaces
          s1: '#272729',
          s2: '#262628',
          s3: '#28282a',
          s4: '#2a2a2d',
          s5: '#242426',
        },
      },
      fontFamily: {
        // SF Pro stack with Inter as web fallback
        sans: [
          '-apple-system', 'BlinkMacSystemFont',
          'SF Pro Text', 'SF Pro Icons',
          'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif',
        ],
        display: [
          '-apple-system', 'BlinkMacSystemFont',
          'SF Pro Display', 'SF Pro Icons',
          'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif',
        ],
      },
      letterSpacing: {
        'apple-hero':    '-0.28px',
        'apple-body':    '-0.374px',
        'apple-caption': '-0.224px',
        'apple-micro':   '-0.12px',
        'apple-tile':    '0.196px',
      },
      lineHeight: {
        'apple-hero':    '1.07',
        'apple-heading': '1.10',
        'apple-tile':    '1.14',
        'apple-card':    '1.19',
        'apple-body':    '1.47',
      },
      boxShadow: {
        'apple-card': 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0px',
        'apple-sm':   'rgba(0, 0, 0, 0.12) 0px 2px 12px 0px',
      },
      borderRadius: {
        'apple-btn':  '8px',
        'apple-pill': '980px',
        'apple-card': '12px',
      },
    },
  },
  plugins: [],
}
