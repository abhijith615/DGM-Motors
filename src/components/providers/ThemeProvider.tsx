'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'dgm-theme';

/**
 * Blocking script injected into <head> so the correct theme is applied before
 * first paint. Without it the page flashes dark then snaps to light.
 */
export const themeInitScript = `
(function(){try{
  var s=localStorage.getItem('${STORAGE_KEY}');
  document.documentElement.setAttribute('data-theme',s==='light'?'light':'dark');
}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Matches the server-rendered default; corrected in the effect below from
  // whatever themeInitScript already stamped on <html>.
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const applied = document.documentElement.getAttribute('data-theme');
    if (applied === 'light' || applied === 'dark') setTheme(applied);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode — the theme still applies for this session */
      }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
