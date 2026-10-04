import ModeToggle from '@/components/build-in/header/mode-toggle';
import { siteConfig } from '@/lib/metadata';
import Logo from './logo';
import GithubButton from './github';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import nextpier from '@/nextpier.config.json';

const Header = () => {
  return (
    <header className="app-toolbar sticky top-0 z-40 flex h-12 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="text-sm font-semibold">{siteConfig.name}</span>
      </div>
      <div className="app-toolbar__interactive flex items-center gap-1">
        {nextpier.features.harness && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon">
                <Link href="/harness" aria-label="AI 对话">
                  <MessageCircle aria-hidden />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI 对话</TooltipContent>
          </Tooltip>
        )}
        <GithubButton />
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
