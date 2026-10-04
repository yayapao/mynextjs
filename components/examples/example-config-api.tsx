'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { patchConfig } from '@/lib/requests/config';
import type { UserConfig } from '@/types';

export default function ExampleConfigApi({
  initialConfig,
}: {
  initialConfig: UserConfig;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { setTheme } = useTheme();

  async function toggleTheme() {
    setSaving(true);
    setError('');
    const theme = config.theme === 'dark' ? 'light' : 'dark';
    const response = await patchConfig({ theme });
    setSaving(false);
    if (response.code !== 0 || !('data' in response) || !response.data) {
      setError('主题保存失败');
      return;
    }
    setConfig(response.data);
    setTheme(response.data.theme);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">主题</h2>
        <Button onClick={toggleTheme} disabled={saving}>
          {config.theme === 'dark' ? '切换浅色' : '切换深色'}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
