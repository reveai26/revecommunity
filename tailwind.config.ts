import type { Config } from 'tailwindcss'

const config: Config = {
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
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
        DEFAULT: '0 4px 6px rgba(0, 0, 0, 0.5)',
        md: '0 4px 6px rgba(0, 0, 0, 0.5)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
