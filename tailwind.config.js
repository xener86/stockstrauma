// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7f7',
          100: '#d1e7e5',
          200: '#a3d0cc',
          300: '#75b9b3',
          400: '#47a29b',
          500: '#358c84',
          600: '#426D6A', // Bleu pétrole principal
          700: '#345856',
          800: '#264341',
          900: '#182d2b',
        },
        positive: {
          50: '#ecfdf8',
          100: '#cff7eb',
          200: '#a1eeda',
          300: '#67e2c3',
          400: '#23C6A0', // Vert positif
          500: '#13ac88',
          600: '#118c73',
          700: '#126f5b',
          800: '#14584a',
          900: '#124a3f',
        },
        warning: {
          50: '#fdf9e8',
          100: '#f9efc5',
          200: '#f3e08d',
          300: '#ecc94b',
          400: '#D4A72C', // Jaune warning
          500: '#c6950a',
          600: '#a77906',
          700: '#85600a',
          800: '#6d4b0f',
          900: '#5c3f11',
        },
        danger: {
          50: '#fef2f2',
          100: '#fde3e3',
          200: '#fdcbcb',
          300: '#faa7a7',
          400: '#f37575',
          500: '#e54141',
          600: '#D32F2F', // Rouge danger/critical
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};