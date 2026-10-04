import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100svh-3rem)] flex-col items-center justify-center gap-4 p-8">
      <div className="text-center space-y-4">
        <h1 className="page-heading">页面不存在</h1>
        <p className="text-sm text-muted-foreground">404</p>
      </div>
      <Button asChild>
        <Link href="/">返回工作台</Link>
      </Button>
    </div>
  );
}
