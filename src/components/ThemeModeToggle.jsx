import { Sun, Moon } from 'lucide-react';

export default function ThemeModeToggle({ themeMode, onChangeThemeMode }) {
  const isDark = themeMode === 'dark';

  return (
    <div
      className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800"
      role="group"
      aria-label="Appearance Mode"
      data-testid="theme-mode-toggle"
    >
      <button
        type="button"
        onClick={() => onChangeThemeMode('light')}
        data-testid="theme-mode-light-btn"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          !isDark
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => onChangeThemeMode('dark')}
        data-testid="theme-mode-dark-btn"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          isDark
            ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5 text-indigo-400" />
        <span>Dark</span>
      </button>
    </div>
  );
}
