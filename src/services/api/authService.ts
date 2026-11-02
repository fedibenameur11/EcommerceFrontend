import api from './axiosInstance';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
  ResetPasswordRequest,
} from '@/models/auth';

/**
 * Authentication Service
 * POST /auth/register et POST /auth/login (le profil se récupère via userService.getCurrentUser)
 * + réinitialisation du mot de passe : forgot-password -> verify-reset-code -> reset-password
 */
export const authService = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /** Envoie un code de vérification à 6 chiffres par e-mail. */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  /** Vérifie le code reçu par e-mail et renvoie un jeton pour définir le nouveau mot de passe. */
  verifyResetCode: async (data: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> => {
    const response = await api.post<VerifyResetCodeResponse>('/auth/verify-reset-code', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },
};

export default authService;
