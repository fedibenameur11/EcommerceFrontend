export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: number;
  name: string;
  imageUrl: string;
  quantitySold: number;
  revenue: number;
}

export interface LowStockProduct {
  productId: number;
  name: string;
  imageUrl: string;
  stockQuantity: number;
}

export interface Analytics {
  currency: string;
  days: number;
  totalRevenue: number;
  totalOrders: number;
  /** Nombre d'articles vendus sur la période */
  itemsSold?: number;
  revenueOverTime: RevenuePoint[];
  topProducts: TopProduct[];
  lowStock: LowStockProduct[];
  lowStockThreshold: number;
}