import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface scale
        'surface-container-lowest': '#0E0E11',
        'surface-container-low': '#1B1B1E',
        'surface-container': '#1F1F22',
        'surface-container-high': '#2A2A2D',
        'surface-container-highest': '#353438',
        'surface-dim': '#131316',
        'surface-bright': '#39393C',
        'surface-variant': '#353438',
        'surface-tint': '#C4C0FF',
        surface: '#131316',
        background: '#131316',

        // Primary (electric indigo / lavender)
        primary: '#C4C0FF',
        'primary-container': '#8781FF',
        'primary-fixed': '#E3DFFF',
        'primary-fixed-dim': '#C4C0FF',
        'inverse-primary': '#4F44E2',
        'on-primary': '#2000A4',
        'on-primary-container': '#1B0091',
        'on-primary-fixed': '#100069',
        'on-primary-fixed-variant': '#3622CA',

        // Secondary
        secondary: '#C4C0FF',
        'secondary-container': '#444183',
        'secondary-fixed': '#E3DFFF',
        'secondary-fixed-dim': '#C4C0FF',
        'on-secondary': '#2B2769',
        'on-secondary-container': '#B4B1FC',
        'on-secondary-fixed': '#150F54',
        'on-secondary-fixed-variant': '#413F81',

        // Tertiary (warm orange)
        tertiary: '#FFB785',
        'tertiary-container': '#DB761F',
        'tertiary-fixed': '#FFDCC6',
        'tertiary-fixed-dim': '#FFB785',
        'on-tertiary': '#502500',
        'on-tertiary-container': '#461F00',
        'on-tertiary-fixed': '#301400',
        'on-tertiary-fixed-variant': '#713700',

        // Text / On surfaces
        'on-surface': '#E5E1E6',
        'on-surface-variant': '#C7C4D8',
        'on-background': '#E5E1E6',
        'inverse-surface': '#E5E1E6',
        'inverse-on-surface': '#303033',

        // Outline
        outline: '#918FA1',
        'outline-variant': '#464555',

        // Error
        error: '#FFB4AB',
        'error-container': '#93000A',
        'on-error': '#690005',
        'on-error-container': '#FFDAD6',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #C4C0FF 0%, #8781FF 100%)',
        'gradient-surface': 'linear-gradient(180deg, transparent 0%, #0E0E11 100%)',
      },
      boxShadow: {
        primary: '0 10px 20px -10px rgba(108,99,255,0.4)',
        'primary-lg': '0 20px 40px -20px rgba(108,99,255,0.5)',
        glow: '0 0 40px rgba(196,192,255,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        typing: 'typing 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
