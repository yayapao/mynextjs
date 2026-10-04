'use client';

import './globals.css';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <h1 className="page-heading">应用加载失败</h1>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              错误编号：{error.digest}
            </p>
          )}
          <Button onClick={unstable_retry}>重试</Button>
        </div>
      </body>
    </html>
  );
}
