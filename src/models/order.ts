/**
 * Order Models
 */

import type { PaginatedResponse } from './product';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

/** None = pas de livreur ; Pending = en attente de sa réponse ; Refused = à réaffecter par l'admin */
export type DeliveryAssignment = 'None' | 'Pending' | 'Accepted' | 'Refused';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  /** Pointure / taille choisie (null = produit sans taille) */
  size?: string | null;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  /** Livreur affecté par l'admin (null = pas encore affectée) */
  deliveryPersonId?: number | null;
  deliveryPersonName?: string | null;
  deliveryPersonPhone?: string | null;
  /** Réponse du livreur à l'affectation */
  deliveryAssignment?: DeliveryAssignment;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: string;
  currency: string;
  subtotal: number;
  deliveryFee: number;
  /** Code promo utilisé et remise appliquée en TND */
  couponCode?: string | null;
  discountAmount: number;
  total: number;
  items: OrderItem[];
  orderDate: string;
  shippedDate?: string | null;
  deliveredDate?: string | null;
}

export interface CreateOrder {
  shippingAddress: string;
  couponCode?: string;
  items: { productId: number; quantity: number; size?: string }[];
}

export type OrderPageDto = PaginatedResponse<Order>;
