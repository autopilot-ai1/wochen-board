/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'landerer': {
          50: '#FDF6E3',
          100: '#FCF0D4',
          200: '#F5DCA3',
          300: '#E8C56B',
          400: '#D4A84A',
          500: '#B8860B',
          600: '#9A7009',
          700: '#7C5A07',
          800: '#5E4405',
          900: '#402E03',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
        'modal': '0 10px 40px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      }
    },
  },
  plugins: [],
}
