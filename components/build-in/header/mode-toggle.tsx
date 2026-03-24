'use client';

import DarkModeToggleButton from '@/components/build-in/button/dark-mode-toggle-button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [themeState, setThemeState] = useState<string>();

  // toggle theme
  const togleTheme = () => {
    const th = theme === 'dark' ? 'light' : 'dark';
    setTheme(th);
  };

  useEffect(() => {
    setThemeState(theme);
  }, [theme]);

  return (
    <DarkModeToggleButton
      darkIcon={<Moon className="size-6" />}
      lightIcon={<Sun className="size-6" />}
      onClick={togleTheme}
      theme={themeState}
    />
  );
}
