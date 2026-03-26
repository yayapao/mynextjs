'use client';
import { useCallback, useEffect, useState } from 'react';
import localforage from 'localforage';

/**
 * Sync state with browser storage using localforage
 *
 * localforage automatically picks the best storage driver:
 * 1. IndexedDB (best for large data)
 * 2. WebSQL (fallback)
 * 3. localStorage (final fallback)
 *
 * Benefits over localStorage:
 * - Asynchronous API (non-blocking)
 * - Stores any data type (not just strings)
 * - Larger storage capacity (IndexedDB can store MBs)
 * - Better performance for complex data
 *
 * @param key - Storage key
 * @param initialValue - Fallback value if key doesn't exist
 * @returns [storedValue, setValue, removeValue, setItem] tuple
 *
 * @example
 * // Basic usage (like useState)
 * const [user, setUser, removeUser] = useLocalStorage('user', null);
 * setUser({ name: 'John', age: 30 });
 * removeUser();
 *
 * @example
 * // With explicit key (store to different keys)
 * const [user, setUser, removeUser, setItem] = useLocalStorage('currentUser', null);
 * await setItem('user:123', { name: 'John' });
 * await setItem('user:456', { name: 'Jane' });
 *
 * @see https://github.com/localforage/localforage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [
  T,
  (value: T | ((val: T) => T)) => Promise<void>,
  (customKey?: string) => Promise<void>,
  (customKey: string, value: T) => Promise<void>
] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial value from localforage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    localforage
      .getItem<T>(key)
      .then((value) => {
        if (value !== null) {
          setStoredValue(value);
        }
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error(`Error reading storage key "${key}":`, error);
        setIsInitialized(true);
      });
  }, [key]);

  // Set value for the default key
  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Update local state immediately for better UX
        setStoredValue(valueToStore);

        // Save to storage asynchronously
        if (typeof window !== 'undefined') {
          await localforage.setItem(key, valueToStore);
        }
      } catch (error) {
        console.error(`Error setting storage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from storage (optionally for a custom key)
  const removeValue = useCallback(
    async (customKey?: string) => {
      try {
        const targetKey = customKey || key;

        // Only update state if removing the default key
        if (!customKey || customKey === key) {
          setStoredValue(initialValue);
        }

        if (typeof window !== 'undefined') {
          await localforage.removeItem(targetKey);
        }
      } catch (error) {
        console.error(`Error removing storage key "${customKey || key}":`, error);
      }
    },
    [key, initialValue]
  );

  // Set item with explicit key (doesn't update state)
  const setItem = useCallback(async (customKey: string, value: T) => {
    try {
      if (typeof window !== 'undefined') {
        await localforage.setItem(customKey, value);

        // If setting the default key, update state
        if (customKey === key) {
          setStoredValue(value);
        }
      }
    } catch (error) {
      console.error(`Error setting storage key "${customKey}":`, error);
    }
  }, [key]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // If not JSON, use as-is
          setStoredValue(e.newValue as T);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, isInitialized]);

  return [storedValue, setValue, removeValue, setItem];
}
