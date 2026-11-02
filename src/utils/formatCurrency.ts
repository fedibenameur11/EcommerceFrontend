/**
 * Currency Formatter Utility
 * Formats numbers as currency
 */

export const formatCurrency = (
  amount: number,
  currency: string = 'TND',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'TND',
  }).format(price);
};

export default formatCurrency;
