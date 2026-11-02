import api from './axiosInstance';
import type { Cart } from '@/models/cart';

/**
 * Cart Service (panier côté serveur, par utilisateur)
 * Le panier de l'interface reste local (Redux + sessionStorage) jusqu'à la commande ;
 * ces appels permettent de le synchroniser avec l'API si besoin.
 */
export const cartService = {
  getCart: async (userId: number): Promise<Cart> => {
    const response = await api.get<Cart>(`/carts/${userId}`);
    return response.data;
  },

  addItem: async (userId: number, productId: number, quantity: number): Promise<Cart> => {
    const response = await api.post<Cart>(`/carts/${userId}/items`, { productId, quantity });
    return response.data;
  },

  /** Le corps de la requête est l'entier brut `quantity` */
  updateItemQuantity: async (userId: number, productId: number, quantity: number): Promise<Cart> => {
    const response = await api.put<Cart>(`/carts/${userId}/items/${productId}`, quantity);
    return response.data;
  },

  removeItem: async (userId: number, productId: number): Promise<void> => {
    await api.delete(`/carts/${userId}/items/${productId}`);
  },
};

export default cartService;
