import { promises as fs } from 'fs';
import path from 'path';
import type { UserConfig, PartialUserConfig } from './types/config';

/**
 * File system utilities for managing user configuration
 *
 * These functions provide safe read/write operations for the config.json file.
 * All operations are async and include error handling.
 */

/** Path to the configuration file */
const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

/** Default configuration - used when file doesn't exist or is invalid */
const DEFAULT_CONFIG: UserConfig = {
  theme: 'light',
};

/**
 * Read user configuration from JSON file
 *
 * If the file doesn't exist or contains invalid JSON, returns default config.
 * This ensures the function never throws and always returns valid config.
 *
 * @returns Promise resolving to user configuration object
 */
export async function readConfig(): Promise<UserConfig> {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(data);

    // Merge with defaults to ensure all required fields exist
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    // File doesn't exist or invalid JSON - return defaults
    console.warn('Failed to read config, using defaults:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Write user configuration to JSON file
 *
 * Creates the data directory if it doesn't exist. Writes formatted JSON
 * with 2-space indentation for better readability.
 *
 * @param config - Complete configuration object to write
 * @returns Promise resolving when write completes
 * @throws Error if write operation fails (disk full, permission denied, etc.)
 */
export async function writeConfig(config: UserConfig): Promise<void> {
  try {
    // Ensure data directory exists
    const dir = path.dirname(CONFIG_PATH);
    await fs.mkdir(dir, { recursive: true });

    // Write formatted JSON
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write config:', error);
    throw new Error('Failed to save configuration');
  }
}

/**
 * Update user configuration (partial update)
 *
 * Reads current config, merges with updates, then writes back.
 * Only the provided fields are updated - others remain unchanged.
 *
 * @param updates - Partial config with fields to update
 * @returns Promise resolving to the updated complete configuration
 *
 * @example
 * // Update only theme, other fields remain unchanged
 * await updateConfig({ theme: 'dark' });
 */
export async function updateConfig(
  updates: PartialUserConfig
): Promise<UserConfig> {
  const currentConfig = await readConfig();
  const newConfig = { ...currentConfig, ...updates };
  await writeConfig(newConfig);
  return newConfig;
}

/**
 * Delete configuration file and reset to defaults
 *
 * Removes the config.json file. The next read will return default values.
 * Useful for testing or user data reset functionality.
 *
 * @returns Promise resolving when deletion completes
 */
export async function deleteConfig(): Promise<void> {
  try {
    await fs.unlink(CONFIG_PATH);
  } catch (error) {
    // File might not exist - not an error
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to delete config:', error);
      throw new Error('Failed to delete configuration');
    }
  }
}
