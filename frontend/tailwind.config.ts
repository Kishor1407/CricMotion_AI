import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFFC00', // Snapchat Vibrant Yellow
          black: '#0A0A0A',  // Neutral 950 Dark
          pureBlack: '#000000',
          white: '#FFFFFF',
          green: '#4ADE80',
          orange: '#FB923C',
          red: '#F87171',
        },
      },
      boxShadow: {
        brutal: '6px 6px 0px rgba(0,0,0,1)',
        'brutal-lg': '8px 8px 0px rgba(0,0,0,1)',
        'brutal-sm': '3px 3px 0px rgba(0,0,0,1)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Clash Display', 'sans-serif'],
        sans: ['Inter', 'Bricolage Grotesque', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
