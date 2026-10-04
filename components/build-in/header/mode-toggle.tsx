'use client';

import { MoonIcon } from '@animateicons/react/lucide/moon-icon';
import { SunIcon } from '@animateicons/react/lucide/sun-icon';
import { AnimatedIconButton } from '@/components/ui/animated-icon-button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { patchConfig } from '@/lib/requests/config';
import { useMounted } from '@/hooks';

export default function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const [saving, setSaving] = useState(false);
  const dark = mounted && resolvedTheme === 'dark';

  async function toggleTheme() {
    const previous = dark ? 'dark' : 'light';
    const next = dark ? 'light' : 'dark';
    setTheme(next);
    setSaving(true);
    const result = await patchConfig({ theme: next });
    setSaving(false);
    if (result.code !== 0) {
      setTheme(previous);
      toast.error('主题保存失败');
    }
  }

  return (
    <AnimatedIconButton
      icon={dark ? SunIcon : MoonIcon}
      label={dark ? '切换浅色主题' : '切换深色主题'}
      variant="ghost"
      onClick={toggleTheme}
      disabled={!mounted || saving}
    />
  );
}
