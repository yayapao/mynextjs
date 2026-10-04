'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useMounted } from '@/hooks';
import { siteConfig } from '@/lib/metadata';

export default function Logo() {
  const { theme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <Image
      src={theme === 'dark' ? '/dark-logo.png' : '/logo.png'}
      alt={siteConfig.name}
      width={28}
      height={28}
    />
  );
}
