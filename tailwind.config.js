/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Required so the Settings screen can switch light/dark manually via
  // NativeWind's `setColorScheme` (otherwise dark mode follows the OS only).
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Player palette (kept in sync with src/constants/colors.ts)
        player: {
          red: '#EF4444',
          green: '#22C55E',
          yellow: '#F59E0B',
          blue: '#3B82F6',
        },
        // Semantic surfaces (dark-mode aware via the `dark:` variant)
        surface: {
          light: '#F8FAFC',
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
          'dark-elevated': '#1E293B',
        },
        brand: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
        },
      },
      fontFamily: {},
    },
  },
  plugins: [],
};
