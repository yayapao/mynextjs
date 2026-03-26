'use client';

export function fetchC(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 60 * 1000
) {
  // Create an AbortController to handle timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    // Provide a reason to avoid "signal is aborted without reason" warning
    controller.abort(new DOMException('Request timeout', 'TimeoutError'));
  }, timeoutMs);

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
}
