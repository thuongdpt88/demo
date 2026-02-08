module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // A vibrant purple
        secondary: '#FBBF24', // A bright yellow
        accent: '#3B82F6', // A lively blue
        background: '#F9FAFB', // A soft background color
        text: '#1F2937', // A dark text color
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}