/**
 * Error Handler Utility
 * Centralized error handling
 */

import axios from 'axios';

export interface AppError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Parse error from various sources into consistent format
 */
export const parseError = (error: unknown): AppError => {
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'ERROR',
    };
  }

  // Erreur Axios : lire le corps renvoyé par l'API (avant le cas Error générique)
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null
  ) {
    const response = error.response as { status?: number; data?: unknown };
    const data = response.data;
    let message: string | undefined;
    let details: Record<string, unknown> | undefined;

    if (typeof data === 'string' && data.trim()) {
      message = data;
    } else if (data && typeof data === 'object') {
      const body = data as { message?: string; title?: string; errors?: Record<string, string[]> };
      details = body.errors;
      const firstValidation = body.errors ? Object.values(body.errors).flat()[0] : undefined;
      message = body.message ?? firstValidation ?? body.title;
    }

    return {
      message: message || 'Une erreur est survenue',
      status: response.status,
      details,
    };
  }

  // Erreur réseau ou délai dépassé (le serveur n'a pas répondu)
  if (axios.isAxiosError(error)) {
    return {
      message:
        error.code === 'ECONNABORTED'
          ? 'Le serveur met trop de temps à répondre. Veuillez réessayer.'
          : 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'ERROR',
    };
  }

  return {
    message: 'Une erreur inattendue est survenue',
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  const parsed = parseError(error);
  return parsed.message;
};

/**
 * Log error to console (or send to logging service)
 */
export const logError = (error: unknown, context?: string): void => {
  const parsed = parseError(error);
  const timestamp = new Date().toISOString();

  console.error(
    `[${timestamp}]${context ? ` [${context}]` : ''} Error:`,
    parsed
  );

  // TODO: Send to logging service (Sentry, LogRocket, etc.)
};

export default {
  parseError,
  getErrorMessage,
  logError,
};
