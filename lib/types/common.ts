/**
 * Common API response wrapper
 *
 * @template T - The type of data returned on success
 */
export interface CommonResponse<T = unknown> {
  /** HTTP status code (0 for success, other number for error) */
  code: number;

  /** Response data (present on success) */
  data?: T;

  /** Error message (present on failure) */
  error?: string;
}
