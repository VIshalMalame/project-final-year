/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary-light': '#E0F2FE', // Light Sky Blue
        'primary': '#7DD3FC',      // Sky Blue
        'primary-dark': '#0EA5E9',    // Darker Sky Blue
        'secondary-light': '#D1FAE5', // Light Emerald Green
        'secondary': '#6EE7B7',      // Emerald Green
        'secondary-dark': '#10B981',   // Darker Emerald Green
        'accent-light': '#FEF3C7',   // Light Amber Yellow
        'accent': '#FCD34D',         // Amber Yellow
        'accent-dark': '#F59E0B',      // Darker Amber Yellow
        'neutral-light': '#F9FAFB', // Very Light Gray
        'neutral': '#F3F4F6',      // Light Gray
        'neutral-medium': '#D1D5DB',// Medium Gray
        'neutral-dark': '#4B5563',  // Dark Gray
      },
      borderRadius: {
        'xl': '1rem', // Larger default rounded corners
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans], // Add Inter font
      },
    },
  },
  plugins: [],
};
