'use client';

import DarkModeToggleButton from '@/components/build-in/button/dark-mode-toggle-button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLocalStorage } from '@/hooks';
import { useEffect } from 'react';

/**
 * Theme toggle component with proper hydration handling
 *
 * Uses useMounted to prevent hydration mismatches when the theme
 * is loaded from browser storage and may differ between server/client.
 */
export default function ModeToggle() {
  const [localTheme, setLocalTheme] = useLocalStorage('theme', 'light');
  const { theme, setTheme } = useTheme();

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setLocalTheme(newTheme);
  };

  useEffect(() => {
    if (localTheme) {
      setTheme(localTheme);
    }
  }, [localTheme, setTheme]);

  return (
    <DarkModeToggleButton
      darkIcon={<Moon className="size-6" />}
      lightIcon={<Sun className="size-6" />}
      onClick={toggleTheme}
      theme={theme}
    />
  );
}
