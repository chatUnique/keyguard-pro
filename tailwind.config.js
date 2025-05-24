/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#007AFF',
          purple: '#5856D6',
          pink: '#FF2D92',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          teal: '#5AC8FA',
          indigo: '#5856D6',
          gray: {
            50: '#F2F2F7',
            100: '#E5E5EA',
            200: '#D1D1D6',
            300: '#C7C7CC',
            400: '#AEAEB2',
            500: '#8E8E93',
            600: '#636366',
            700: '#48484A',
            800: '#3A3A3C',
            900: '#1C1C1E',
          }
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#F2F2F7',
          tertiary: '#FFFFFF',
        }
      },
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Icons', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-large': ['80px', { lineHeight: '84px', letterSpacing: '-0.003em', fontWeight: '600' }],
        'display-medium': ['64px', { lineHeight: '68px', letterSpacing: '-0.003em', fontWeight: '600' }],
        'display-small': ['48px', { lineHeight: '52px', letterSpacing: '-0.003em', fontWeight: '600' }],
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0.007em', fontWeight: '600' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0.007em', fontWeight: '600' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0.009em', fontWeight: '600' }],
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0.009em', fontWeight: '400' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.009em', fontWeight: '500' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.007em', fontWeight: '500' }],
        'body-large': ['17px', { lineHeight: '25px', letterSpacing: '-0.022em', fontWeight: '400' }],
        'body-medium': ['15px', { lineHeight: '23px', letterSpacing: '-0.016em', fontWeight: '400' }],
        'body-small': ['13px', { lineHeight: '18px', letterSpacing: '-0.0074em', fontWeight: '400' }],
        'caption-large': ['12px', { lineHeight: '16px', letterSpacing: '0em', fontWeight: '400' }],
        'caption-medium': ['11px', { lineHeight: '13px', letterSpacing: '0.0071em', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
      },
      boxShadow: {
        'apple': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-xl': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'apple-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'apple': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}; 