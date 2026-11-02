import api from './axiosInstance';
import type { Order, CreateOrder, OrderStatus } from '@/models/order';
import type { PaginatedResponse } from '@/models/product';
import { downloadFile } from '@/lib/download';

/**
 * Order Service
 * Handles all order-related API calls
 */
export const orderService = {
  /** Commandes de l'utilisateur connecté (tableau simple, non paginé) */
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/mine');
    return response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: CreateOrder): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  cancelOrder: async (id: number): Promise<void> => {
    await api.post(`/orders/${id}/cancel`);
  },

  /** Télécharge la facture PDF (client propriétaire ou admin) */
  downloadInvoice: (id: number) => downloadFile(`/orders/${id}/invoice`, `facture-${id}.pdf`),

  /** Admin: toutes les commandes, paginées */
  getAllOrders: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>('/orders', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /** Admin : affecte la commande à un livreur (accepte la commande si elle était en attente) ; null = retirer */
  assignDelivery: async (id: number, deliveryPersonId: number | null): Promise<void> => {
    await api.put(`/orders/${id}/delivery`, { deliveryPersonId });
  },

  /** Admin */
  updateOrderStatus: async (id: number, status: OrderStatus): Promise<void> => {
    await api.put(`/orders/${id}/status`, { status });
  },
};

export default orderService;
