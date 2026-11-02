import api from './axiosInstance';
import type { User, UpdateUserProfile, UserPage, NewDeliveryPerson } from '@/models/user';

/**
 * User Service
 * Handles all user-related API calls
 */
export const userService = {
  /** Profil de l'utilisateur connecté */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  /** Met à jour le profil de l'utilisateur connecté (204 No Content) */
  updateProfile: async (data: UpdateUserProfile): Promise<void> => {
    await api.put('/users/me', data);
  },

  /** Admin: liste paginée des utilisateurs */
  getAllUsers: async (page: number = 1, pageSize: number = 10): Promise<UserPage> => {
    const response = await api.get<UserPage>('/users', { params: { page, pageSize } });
    return response.data;
  },

  /** Admin : livreurs actifs */
  getDeliveryPeople: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/delivery');
    return response.data;
  },

  /** Admin : crée un compte livreur */
  createDeliveryPerson: async (data: NewDeliveryPerson): Promise<User> => {
    const response = await api.post<User>('/users/delivery', data);
    return response.data;
  },

  /** Admin */
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  /** Admin */
  updateUser: async (id: number, data: UpdateUserProfile): Promise<void> => {
    await api.put(`/users/${id}`, data);
  },

  /** Admin */
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default userService;
