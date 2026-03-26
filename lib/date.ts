import { format, formatDistance, formatRelative, isValid } from 'date-fns';

/**
 * Format date to localized string
 * @param date - Date object or ISO string
 * @param formatStr - date-fns format pattern (default: 'PPP')
 */
export function formatDate(date: Date | string, formatStr = 'PPP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, formatStr);
}

/**
 * Get relative time from now (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format date relative to base date with time context
 */
export function formatRelativeDate(
  date: Date | string,
  baseDate: Date = new Date()
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatRelative(dateObj, baseDate);
}
