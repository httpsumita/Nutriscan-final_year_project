module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Sage Green (Primary)
        sage: {
          50: '#F5F8F7',
          100: '#E8F0EE',
          200: '#D4EBE5',
          300: '#A8D4CB',
          400: '#7BAE9F',
          500: '#6BA391',
          600: '#5A9884',
          700: '#4A7C6F',
          800: '#3A6458',
          900: '#2A4C41',
        },
        // Dusty Rose (Accent)
        rose: {
          100: '#F5DADA',
          200: '#ECC4C4',
          300: '#E0AEAE',
          400: '#D98C8C',
          500: '#D07A7A',
          600: '#C76868',
          700: '#B85656',
          800: '#A94444',
          900: '#9A3232',
        },
        // Neutral
        neutral: {
          0: '#FAFAF8',
          100: '#F0EFEC',
          200: '#E2E0DB',
          300: '#D4D2CB',
          400: '#7A7A78',
          500: '#5A5A58',
          600: '#2C2C2C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
        sm: '8px',
        DEFAULT: '12px',
        lg: '14px',
        xl: '16px',
      },
    },
  },
  plugins: []
}
