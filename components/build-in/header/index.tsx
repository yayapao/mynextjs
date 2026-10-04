import ModeToggle from '@/components/build-in/header/mode-toggle';
import Logo from './logo';
import GithubButton from './github';

const Header = () => {
  return (
    <header className="app-toolbar sticky top-0 z-40 flex h-12 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="text-sm font-semibold">mynextjs</span>
      </div>
      <div className="app-toolbar__interactive flex items-center gap-1">
        <GithubButton />
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
