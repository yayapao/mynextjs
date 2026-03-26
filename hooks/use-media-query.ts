import { useSyncExternalStore } from 'react';

/**
 * Tracks a CSS media query match status
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 *
 * Uses useSyncExternalStore to properly sync with the browser's media query API
 * Returns false during SSR to prevent hydration mismatches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    // subscribe
    (callback) => {
      if (typeof window === 'undefined') return () => {};

      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    // getSnapshot
    () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia(query).matches;
    },
    // getServerSnapshot
    () => false
  );
}
