import api from './axiosInstance';
import type { Review, SaveReview } from '@/models/review';

export const reviewService = {
  getProductReviews: async (productId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/products/${productId}/reviews`);
    return response.data;
  },

  /** Crée ou met à jour l'avis de l'utilisateur connecté (un avis par produit) */
  saveReview: async (productId: number, data: SaveReview): Promise<Review> => {
    const response = await api.post<Review>(`/products/${productId}/reviews`, data);
    return response.data;
  },
};

export default reviewService;