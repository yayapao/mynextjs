'use client';
import { useSyncExternalStore } from 'react';

/**
 * Returns true after component has mounted (client-side only)
 *
 * Useful for preventing hydration mismatches when rendering content
 * that differs between server and client (e.g., client-only features,
 * browser-specific UI, or components that depend on window/document).
 *
 * @returns false during SSR and initial render, true after mount
 *
 * @example
 * function Component() {
 *   const mounted = useMounted();
 *
 *   if (!mounted) {
 *     return <div>Loading...</div>; // SSR-safe placeholder
 *   }
 *
 *   return <ClientOnlyComponent />; // Only renders on client
 * }
 *
 * @example
 * // Conditionally render based on client-side state
 * function ThemeToggle() {
 *   const mounted = useMounted();
 *   const theme = useTheme();
 *
 *   // Prevent hydration mismatch if theme comes from localStorage
 *   if (!mounted) return null;
 *
 *   return <button>{theme}</button>;
 * }
 */
export function useMounted() {
  return useSyncExternalStore(
    // subscribe: 挂载状态不会变化，所以不需要监听
    () => () => {},
    // getSnapshot: 客户端永远返回 true（因为只在挂载后才能调用）
    () => true,
    // getServerSnapshot: 服务端永远返回 false
    () => false
  );
}
