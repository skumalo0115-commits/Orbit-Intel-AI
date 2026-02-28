/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      backdropBlur: {
        xl: '20px',
      },
      boxShadow: {
        neon: '0 0 10px rgba(0,217,255,0.5), 0 0 20px rgba(0,217,255,0.3), 0 0 40px rgba(0,217,255,0.2)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.55 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
