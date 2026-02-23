/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        card: '#12121a',
        hover: '#1a1a25',
        border: '#27272a',
        accent: '#6366f1',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        muted: '#64748b',
      },
    },
  },
  plugins: [],
};
