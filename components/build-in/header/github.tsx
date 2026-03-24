'use client';

import { CatIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GithubButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() =>
        window.open('https://github.com/yayapao/mynextjs', '_blank')
      }
    >
      <CatIcon />
    </Button>
  );
}
