/**
 * Local Storage Utility
 * Helper functions for localStorage operations
 */

export const getFromLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue ?? null;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue ?? null;
  }
};

export const saveToLocalStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
};

export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export default {
  getFromLocalStorage,
  saveToLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage,
};
