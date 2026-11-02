export type ReturnStatus = 'Requested' | 'Approved' | 'Rejected' | 'Received' | 'Refunded';

export interface ReturnRequest {
  id: number;
  orderId: number;
  orderNumber: string;
  orderItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
  reason: string;
  details: string;
  status: ReturnStatus;
  adminNote: string;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturn {
  orderItemId: number;
  quantity: number;
  reason: string;
  details: string;
}

export interface ReturnOptions {
  reasons: string[];
  windowDays: number;
}

export interface SellerOrder {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  status: import('@/models/order').OrderStatus;
  customerName: string;
  shippingAddress: string;
  itemCount: number;
  total: number;
}
