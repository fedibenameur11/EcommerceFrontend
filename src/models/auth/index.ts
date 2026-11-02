/**
 * Authentication Models
 */

import type { User } from '../user';

export type { User };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  /** true = créer un compte vendeur */
  isSeller?: boolean;
  /** true = créer un compte livreur (téléphone obligatoire, incompatible avec isSeller) */
  isDelivery?: boolean;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  resetToken: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

/** Réponse de POST /auth/login : le backend ne renvoie que le JWT. */
export interface AuthResponse {
  token: string;
  expiresAt: string;
}
