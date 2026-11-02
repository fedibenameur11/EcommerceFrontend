/**
 * Local Storage Token Service
 * Handles JWT token storage and retrieval
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Store token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieve token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Store user data in localStorage
 */
export const setUser = (user: unknown): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Retrieve user data from localStorage
 */
export const getUser = (): Record<string, unknown> | null => {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

/**
 * Remove user data from localStorage
 */
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Clear all auth data
 */
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

/**
 * Lit la date d'expiration (claim `exp`, en secondes) du JWT
 */
const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated (token présent et non expiré)
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  const expiry = getTokenExpiry(token);
  return expiry === null || expiry > Date.now();
};
