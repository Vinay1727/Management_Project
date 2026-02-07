/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#6366f1",
                secondary: "#a855f7",
                accent: "#06b6d4",
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'], // Set Outfit as the primary sans font
                inter: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
