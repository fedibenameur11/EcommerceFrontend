import api from './axiosInstance';
import type { Coupon, CouponValidation, SaveCoupon } from '@/models/coupon';

/**
 * Coupon Service
 * Aperçu d'un code promo (client connecté) et gestion des coupons (administrateur)
 */
export const couponService = {
  /** Calcule la remise d'un code pour un sous-total ; erreur 400 avec un message clair si le code est refusé */
  validate: async (
    code: string,
    subtotal: number,
    items?: { productId: number; quantity: number }[]
  ): Promise<CouponValidation> => {
    const response = await api.post<CouponValidation>('/coupons/validate', { code, subtotal, items });
    return response.data;
  },

  getAll: async (): Promise<Coupon[]> => {
    const response = await api.get<Coupon[]>('/coupons');
    return response.data;
  },

  create: async (data: SaveCoupon): Promise<Coupon> => {
    const response = await api.post<Coupon>('/coupons', data);
    return response.data;
  },

  update: async (id: number, data: SaveCoupon): Promise<void> => {
    await api.put(`/coupons/${id}`, data);
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/coupons/${id}`);
  },
};

export default couponService;
