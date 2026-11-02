import api from './axiosInstance';
import type { Analytics } from '@/models/analytics';
import type { SellerOrder } from '@/models/returns';

export const sellerService = {
  /** Vendeur : ventes, produits les plus vendus et stock bas pour ses propres produits */
  getAnalytics: async (days = 30, top = 5, lowStockThreshold = 5): Promise<Analytics> =>
    (await api.get<Analytics>('/seller/analytics', { params: { days, top, lowStockThreshold } })).data,

  /** Vendeur : commandes contenant ses produits */
  getOrders: async (): Promise<SellerOrder[]> => (await api.get<SellerOrder[]>('/seller/orders')).data,
};

export default sellerService;
