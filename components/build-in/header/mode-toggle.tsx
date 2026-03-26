'use client';

import DarkModeToggleButton from '@/components/build-in/button/dark-mode-toggle-button';
import { useMounted } from '@/hooks/use-mounted';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

/**
 * Theme toggle component with proper hydration handling
 *
 * Uses useMounted to prevent hydration mismatches when the theme
 * is loaded from browser storage and may differ between server/client.
 */
export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Don't render until mounted to avoid hydration mismatch
  // The theme value from next-themes may differ between SSR and client
  if (!mounted) {
    return null;
  }

  return (
    <DarkModeToggleButton
      darkIcon={<Moon className="size-6" />}
      lightIcon={<Sun className="size-6" />}
      onClick={toggleTheme}
      theme={theme}
    />
  );
}
