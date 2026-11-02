/**
 * Coupon Models
 */

export type CouponType = 'Percentage' | 'FixedAmount';

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  categoryId: number | null;
  categoryName: string | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  isExpired: boolean;
  createdAt: string;
}

export interface SaveCoupon {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  expiresAt: string | null;
  /** Catégorie ciblée (null = tout le catalogue) */
  categoryId: number | null;
  isActive: boolean;
}

/** Aperçu de la remise renvoyé par POST /coupons/validate */
export interface CouponValidation {
  code: string;
  type: CouponType;
  value: number;
  /** Remise en TND, déjà plafonnée au sous-total */
  discount: number;
  message: string;
}

/** Code appliqué au panier */
export interface AppliedCoupon {
  code: string;
  type: CouponType;
  value: number;
  discount: number;
}
