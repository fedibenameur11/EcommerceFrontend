import api from './axiosInstance';
import type { Order } from '@/models/order';
import type { DeliveryStats } from '@/models/delivery';

/**
 * Delivery Service
 * Espace livreur : commandes affectées par l'admin
 */
export const deliveryService = {
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/delivery/orders');
    return response.data;
  },

  /** Accepter ou refuser une affectation en attente */
  respond: async (id: number, accept: boolean): Promise<void> => {
    await api.put(`/delivery/orders/${id}/response`, { accept });
  },

  /** Processing -> Shipped (en route) puis Shipped -> Delivered (après acceptation) */
  updateStatus: async (id: number, status: 'Shipped' | 'Delivered'): Promise<void> => {
    await api.put(`/delivery/orders/${id}/status`, { status });
  },

  /** Livraisons effectuées et gains sur les N derniers jours */
  getStats: async (days: number): Promise<DeliveryStats> => {
    const response = await api.get<DeliveryStats>('/delivery/stats', { params: { days } });
    return response.data;
  },
};

export default deliveryService;
