/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Mode (Default)
        background: {
          DEFAULT: '#0A0A0A',
          secondary: '#111111',
        },
        surface: {
          DEFAULT: '#141414',
          hover: '#1F1F1F',
          active: '#262626',
        },
        border: {
          DEFAULT: '#2A2A2A',
          light: '#333333',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1A1',
          muted: '#6B6B6B',
          disabled: '#4A4A4A',
        },
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          active: '#6D28D9',
          light: '#A78BFA',
          bg: 'rgba(139, 92, 246, 0.1)',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif',
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#A1A1A1',
            a: {
              color: '#8B5CF6',
              '&:hover': {
                color: '#A78BFA',
              },
            },
            h1: { color: '#FFFFFF' },
            h2: { color: '#FFFFFF' },
            h3: { color: '#FFFFFF' },
            h4: { color: '#FFFFFF' },
            strong: { color: '#FFFFFF' },
            code: { color: '#A78BFA' },
            blockquote: {
              borderLeftColor: '#8B5CF6',
              color: '#A1A1A1',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
