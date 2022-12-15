/** @type {import('tailwindcss').Config} */
module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                white: '#f4f6fa',
                black: '#1d1b26',
                primary: '#114388',
                secondary: '#5c8fd6',
            },
            fontFamily: {
                sans: ['Inter'],
                inter: ['Inter'],
                poppins: ['Poppins'],
                lato: ['Lato'],
            },
        },
    },
    darkMode: 'class',
    plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')],
};
