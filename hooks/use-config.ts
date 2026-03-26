'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UserConfig, PartialUserConfig, CommonResponse } from '@/lib/types/config';

/**
 * Hook for managing user configuration via API
 *
 * This hook provides a React-friendly interface to the server-side config API.
 * It handles loading, updating, and syncing configuration state with the server.
 *
 * @returns [config, updateConfig, isLoading, error]
 *
 * @example
 * function ThemeToggle() {
 *   const [config, updateConfig, isLoading] = useConfig();
 *
 *   const toggleTheme = async () => {
 *     await updateConfig({ theme: config.theme === 'dark' ? 'light' : 'dark' });
 *   };
 *
 *   if (isLoading) return <Spinner />;
 *   return <button onClick={toggleTheme}>{config.theme}</button>;
 * }
 */
export function useConfig(): [
  UserConfig | null,
  (updates: PartialUserConfig) => Promise<void>,
  boolean,
  string | null
] {
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial config from API
  useEffect(() => {
    let mounted = true;

    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const result: CommonResponse<UserConfig> = await response.json();

        if (!mounted) return;

        if (result.code === 200 && result.data) {
          setConfig(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to load configuration');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      mounted = false;
    };
  }, []);

  // Update config via API
  const updateConfigApi = useCallback(
    async (updates: PartialUserConfig) => {
      if (!config) return;

      try {
        const response = await fetch('/api/config', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        const result: CommonResponse<UserConfig> = await response.json();

        if (result.code === 200 && result.data) {
          setConfig(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to update configuration');
          throw new Error(result.error || 'Update failed');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error';
        setError(message);
        throw err;
      }
    },
    [config]
  );

  return [config, updateConfigApi, isLoading, error];
}
