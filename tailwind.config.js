// tailwind.config.js
const plugin = require('tailwindcss/plugin')

module.exports = {
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
      extend: {
        animation: {
            fade: 'fadeIn .5s ease-in-out',
        },

        keyframes: {
            fadeIn: {
                from: { opacity: 0 },
                to: { opacity: 1 },
            },
        }
      },
    },
    variants: {},
    plugins: [
        plugin(function ({ matchUtilities, theme }) {
            matchUtilities(
              {
                'animate-delay': (value) => ({
                  animationDelay: value,
                }),
              },
              { values: theme('transitionDelay') }
            )
          }),
    ],
  }