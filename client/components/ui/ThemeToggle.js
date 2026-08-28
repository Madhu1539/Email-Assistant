import { Sun, Moon } from 'lucide-react';
import useThemeStore from '@/store/themeStore';

/**
 * ThemeToggle — a compact animated button that switches between dark and light modes.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      id="theme-toggle-btn"
      className={`
        relative w-9 h-9 flex items-center justify-center rounded-lg
        border transition-all duration-200
        ${isDark
          ? 'bg-[#22222e] border-[#2a2a38] text-[#9898b0] hover:text-[#f0f0f8] hover:border-[#3a3a50] hover:bg-[#2a2a38]'
          : 'bg-white border-[#e2e2ee] text-[#52526e] hover:text-[#18181f] hover:border-[#c0c0d8] hover:bg-[#f0f0f8]'}
        ${className}
      `}
    >
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
        }}
      >
        <Moon className="w-4 h-4" aria-hidden="true" />
      </span>
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
        }}
      >
        <Sun className="w-4 h-4" aria-hidden="true" />
      </span>
    </button>
  );
}
