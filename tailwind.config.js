/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6A00',
          50: '#FFF3EA',
          100: '#FFD599',
          200: '#FFA472',
          300: '#FF8347',
          400: '#FF6A00',
          500: '#E85F00',
        },
        secondary: {
          DEFAULT: '#2B6BFF',
          50: '#DDE6FF',
          100: '#8C7FFF',
          200: '#5F8FFF',
          300: '#2B6BFF',
          400: '#18397A',
        },
        ink: {
          900: '#0B1324',
          700: '#475569',
          200: '#E2E8F0',
          100: '#F5F6F8',
        },
      },
      fontFamily: {
        heading: ['Anton', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(90deg, #FF6A00, #FFB347)',
        'gradient-blue': 'linear-gradient(90deg, #2B6BFF, #6FA9FF)',
      },
    },
  },
  plugins: [],
};
