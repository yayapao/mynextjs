import Logo from './logo';
import GithubButton from './github';

const Header = () => {
  return (
    <header
      className="h-14 sticky top-0 left-0 right-0 flex items-center justify-between px-4 bg-zinc-950 shadow-[0_2px_8px_rgba(0,0,0,0.3)] border-b border-zinc-800"
      style={{ zIndex: 12 }}
    >
      <div className="flex items-center gap-2">
        <Logo />
      </div>
      <div className="flex items-center gap-6">
        <GithubButton />
      </div>
    </header>
  );
};

export default Header;
