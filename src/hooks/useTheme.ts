import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
/** What the visitor picked. 'system' means: keep following the operating system. */
export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const readStoredPreference = (): ThemePreference => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    // Private mode or blocked storage: behave as if nothing was ever chosen.
    return 'system';
  }
};

const getSystemTheme = (): Theme =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

/**
 * Three-way theme state: light, dark, or follow the system.
 *
 * Only an explicit light/dark choice is stored and written to data-theme on
 * <html>; 'system' clears both, which is what lets the CSS media query take
 * over again. index.html applies a stored choice before first paint, so this
 * hook only keeps React in sync with what is already on the document.
 */
export const useTheme = () => {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  // Track the system setting even while an explicit choice is active, so
  // switching back to 'system' resolves correctly without a reload.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);

    if (next === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', next);
    }

    try {
      if (next === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // The choice simply does not survive the session.
    }
  }, []);

  const resolvedTheme: Theme = preference === 'system' ? systemTheme : preference;

  return { preference, resolvedTheme, setPreference };
};
