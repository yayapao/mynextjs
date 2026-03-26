'use client';

import { useConfig } from '@/hooks/use-config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Example component demonstrating API-based configuration
 *
 * This shows how to use the useConfig hook to read and update
 * server-side configuration via API routes.
 *
 * Features demonstrated:
 * - Loading config from API on mount
 * - Updating theme field
 * - Error handling
 * - Loading states
 */
export default function ExampleConfigApi() {
  const [config, updateConfig, isLoading, error] = useConfig();

  const toggleTheme = async () => {
    if (!config) return;
    await updateConfig({
      theme: config.theme === 'dark' ? 'light' : 'dark',
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Loading configuration...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Error: {error}</p>
      </Card>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">API-Based Configuration</h2>

        <div className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Current: {config.theme}
              </p>
            </div>
            <Button onClick={toggleTheme}>Toggle Theme</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-medium mb-2">How it works</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Configuration is stored in <code>data/config.json</code> on the server</li>
          <li>API routes at <code>/api/config</code> provide CRUD operations</li>
          <li><code>useConfig()</code> hook manages state and API calls</li>
          <li>Updates are persisted across page reloads and sessions</li>
          <li>Unlike localStorage, this data is stored server-side</li>
        </ul>
      </Card>
    </div>
  );
}
