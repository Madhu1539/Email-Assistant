import { create } from 'zustand';

/**
 * Theme Store
 * Persists the user's theme preference to localStorage.
 * Theme is applied via data-theme="dark" | "light" on <html>.
 */
const useThemeStore = create((set) => ({
  theme: 'dark', // default

  initTheme: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', preferred);
    set({ theme: preferred });
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      }
      return { theme: next };
    }),
}));

export default useThemeStore;
