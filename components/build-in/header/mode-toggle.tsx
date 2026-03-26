'use client';

import DarkModeToggleButton from '@/components/build-in/button/dark-mode-toggle-button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { patchConfig } from '@/lib/requests/config';

/**
 * Theme toggle component with API-based persistence
 *
 * Updates theme preference via API route to persist on server-side.
 */
export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // Toggle between light and dark theme
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    // Update local theme immediately for instant feedback
    setTheme(newTheme);

    // Persist to server via API
    patchConfig({ theme: newTheme });
  };

  return (
    <DarkModeToggleButton
      darkIcon={<Moon className="size-6" />}
      lightIcon={<Sun className="size-6" />}
      onClick={toggleTheme}
      theme={theme}
    />
  );
}
