/**
 * Validators Utility
 * Common validation functions
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidPhone = (phone: string): boolean => {
  // Numéro tunisien : exactement 8 chiffres
  return /^\d{8}$/.test(phone);
};

export const isValidPostalCode = (postalCode: string): boolean => {
  // This is a simple validation - adjust based on your country
  return !!(postalCode && postalCode.trim().length >= 3);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidPostalCode,
  isValidUrl,
};
