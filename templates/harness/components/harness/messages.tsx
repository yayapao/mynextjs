'use client';

import { useEffect, useRef } from 'react';
import type { HarnessMessage } from '@/harness/core';

export function HarnessMessages({
  messages,
  busy,
}: {
  messages: HarnessMessage[];
  busy: boolean;
}) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages, busy]);
  return (
    <div
      role="log"
      aria-live="polite"
      aria-busy={busy}
      aria-label="对话消息"
      className="min-h-0 flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">新对话</p>
        )}
        {messages.map((message) => (
          <article key={message.id} className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={
                  message.role === 'user' ? 'text-info' : 'text-success'
                }
              >
                {message.role === 'user' ? '你' : '助手'}
              </span>
              <time
                className="tabular-nums"
                dateTime={new Date(message.timestamp).toISOString()}
              >
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
            <div className="whitespace-pre-wrap break-words text-sm leading-6">
              {message.content || (busy ? '处理中…' : '已停止')}
            </div>
          </article>
        ))}
        <div ref={end} />
      </div>
    </div>
  );
}
