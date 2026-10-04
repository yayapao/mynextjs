'use client';

import { GithubIcon } from '@animateicons/react/lucide/github-icon';
import { AnimatedIconButton } from '@/components/ui/animated-icon-button';
import { siteConfig } from '@/lib/metadata';

export default function GithubButton() {
  return (
    <AnimatedIconButton
      icon={GithubIcon}
      label="GitHub 仓库"
      variant="ghost"
      onClick={() =>
        window.open(siteConfig.links.github, '_blank', 'noopener,noreferrer')
      }
    />
  );
}
