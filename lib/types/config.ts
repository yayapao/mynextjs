/**
 * User configuration types
 *
 * These types define the shape of user preferences stored in the server-side
 * config.json file and accessed via API routes.
 */

/**
 * Global user configuration
 */
export interface UserConfig {
  /** UI theme preference - 'light' or 'dark' */
  theme: 'light' | 'dark';

  /** Preferred language code (e.g., 'en', 'zh', 'es') */
  language: string;

  /** Whether to show system notifications */
  notifications: boolean;

  /** Sidebar display state */
  sidebar: 'expanded' | 'collapsed';
}

/**
 * Partial config for updates - all fields optional
 */
export type PartialUserConfig = Partial<UserConfig>;

/**
 * API response wrapper for config operations
 */
export interface ConfigResponse {
  success: boolean;
  data?: UserConfig;
  error?: string;
}
