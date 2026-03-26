'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useMounted } from '@/hooks';

export default function Logo() {
  const { theme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <Image
      src={theme === 'dark' ? '/dark-logo.png' : '/logo.png'}
      alt="logo"
      width={42}
      height={42}
    />
  );
}
