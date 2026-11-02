/**
 * Numéro de téléphone : exactement 8 chiffres (format tunisien, sans indicatif), partout dans l'application.
 */
export const PHONE_LENGTH = 8;
export const PHONE_ERROR = 'Le numéro de téléphone doit contenir exactement 8 chiffres.';

/** Pendant la saisie : retire tout ce qui n'est pas un chiffre (lettres, espaces, +) et limite à 8 chiffres */
export const sanitizePhone = (value: string): string => value.replace(/\D/g, '').slice(0, PHONE_LENGTH);

export const isValidPhoneNumber = (value: string): boolean => new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(value);

/**
 * Numéro déjà enregistré -> valeur à 8 chiffres pour pré-remplir un champ.
 * Accepte l'ancien format « +216 12 345 678 » ; renvoie '' si le numéro n'est pas exploitable.
 */
export const toLocalPhone = (stored?: string | null): string => {
  const digits = (stored ?? '').replace(/\D/g, '');
  const local = digits.length === PHONE_LENGTH + 3 && digits.startsWith('216') ? digits.slice(3) : digits;
  return isValidPhoneNumber(local) ? local : '';
};
