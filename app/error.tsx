'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100svh-3rem)] flex-col items-center justify-center gap-4 p-8">
      <div className="text-center space-y-4">
        <h1 className="page-heading">页面加载失败</h1>
        {error.digest && (
          <p className="text-sm text-muted-foreground">
            错误编号：<code className="font-mono">{error.digest}</code>
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={unstable_retry}>重试</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          返回工作台
        </Button>
      </div>
    </div>
  );
}
