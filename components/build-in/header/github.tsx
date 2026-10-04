'use client';

import { GithubIcon } from '@animateicons/react/lucide/github-icon';
import { AnimatedIconButton } from '@/components/ui/animated-icon-button';

export default function GithubButton() {
  return (
    <AnimatedIconButton
      icon={GithubIcon}
      label="GitHub 仓库"
      variant="ghost"
      onClick={() =>
        window.open(
          'https://github.com/yayapao/mynextjs',
          '_blank',
          'noopener,noreferrer'
        )
      }
    />
  );
}
