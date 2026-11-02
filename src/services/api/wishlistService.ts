import api from './axiosInstance';
import type { Product } from '@/models/product';

export const wishlistService = {
  getWishlist: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/wishlist');
    return response.data;
  },

  add: async (productId: number): Promise<void> => {
    await api.post(`/wishlist/${productId}`);
  },

  remove: async (productId: number): Promise<void> => {
    await api.delete(`/wishlist/${productId}`);
  },
};

export default wishlistService;