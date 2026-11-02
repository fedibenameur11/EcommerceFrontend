/**
 * Date Formatter Utility
 * Formats dates in various ways
 */

export const formatDate = (date: string | Date, locale: string = 'fr-FR'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
};

export const formatDateTime = (date: string | Date, locale: string = 'fr-FR'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale);
};

export const formatTimeAgo = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;

  return formatDate(d);
};

export default formatDate;
