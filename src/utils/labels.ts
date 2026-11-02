/**
 * Libellés français pour les valeurs renvoyées par l'API (statuts de commande, rôles).
 */

import type { OrderStatus } from '@/models/order';

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'En attente',
  Processing: 'En préparation',
  Shipped: 'Expédiée',
  Delivered: 'Livrée',
  Cancelled: 'Annulée',
};

const ROLE_LABELS: Record<string, string> = {
  Customer: 'Client',
  Admin: 'Administrateur',
  Seller: 'Vendeur',
  Delivery: 'Livreur',
};

export const orderStatusLabel = (status: OrderStatus): string => ORDER_STATUS_LABELS[status] ?? status;

export const roleLabel = (role: string): string => ROLE_LABELS[role] ?? role;
