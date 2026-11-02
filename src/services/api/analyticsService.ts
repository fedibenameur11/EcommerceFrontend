import api from './axiosInstance';
import type { Analytics } from '@/models/analytics';

export const analyticsService = {
  /** Admin : chiffre d'affaires dans le temps, meilleurs produits et alertes de stock bas */
  getAnalytics: async (days = 30, top = 5, lowStockThreshold = 5): Promise<Analytics> => {
    const response = await api.get<Analytics>('/admin/analytics', {
      params: { days, top, lowStockThreshold },
    });
    return response.data;
  },
};

export default analyticsService;