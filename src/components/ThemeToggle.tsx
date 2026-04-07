import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm'} inline-flex items-center gap-2 rounded-2xl border font-semibold transition-all duration-200 hover:-translate-y-0.5`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
