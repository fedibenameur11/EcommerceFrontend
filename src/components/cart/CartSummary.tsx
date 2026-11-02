import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Loader2, Lock, ShieldCheck, Tag, TicketPercent, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  applyCoupon,
  refreshCoupon,
  removeCoupon,
  selectCartDiscount,
  selectCartItemCount,
  selectCartTotal,
  selectCoupon,
  selectCouponError,
  selectCouponLoading,
} from '@/store/slices/cartSlice';
import { useNotification } from '@/context/NotificationContext';
import { cn, formatPrice, calculateOrderSummary, PAYMENT_METHOD_LABEL } from '@/lib/utils';

interface CartSummaryProps {
  /** Masqué sur la page de paiement, où le bouton de validation se trouve dans le formulaire */
  showCheckoutButton?: boolean;
}

/**
 * Récapitulatif du panier : sous-total, code promo, livraison, total et accès au paiement
 */
export function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const subtotal = useAppSelector(selectCartTotal);
  const itemCount = useAppSelector(selectCartItemCount);
  const discount = useAppSelector(selectCartDiscount);
  const coupon = useAppSelector(selectCoupon);
  const couponError = useAppSelector(selectCouponError);
  const couponLoading = useAppSelector(selectCouponLoading);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [code, setCode] = useState('');
  const { shipping, total } = calculateOrderSummary(subtotal, discount);

  // Le contenu du panier change : le serveur recalcule la remise (ou retire le code s'il n'est plus valable)
  const couponCode = coupon?.code;
  useEffect(() => {
    if (couponCode) dispatch(refreshCoupon());
  }, [subtotal, couponCode, dispatch]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || couponLoading) return;
    const result = await dispatch(applyCoupon(code));
    if (applyCoupon.fulfilled.match(result)) {
      showNotification(`Code ${result.payload.code} appliqué : -${formatPrice(result.payload.discount)}`, 'success');
      setCode('');
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="border-b bg-gradient-to-r from-primary/10 to-transparent px-6 py-4">
        <h2 className="text-lg font-bold">Récapitulatif</h2>
        <p className="text-sm text-muted-foreground">
          {itemCount} article{itemCount > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4 p-6">
        {/* Code promo */}
        {coupon ? (
          <div className="flex animate-fade-in items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            <div className="flex items-center gap-2.5">
              <TicketPercent className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold tracking-wide">{coupon.code}</p>
                <p className="text-xs">
                  {coupon.type === 'Percentage' ? `-${coupon.value} %` : `-${formatPrice(coupon.value)}`} sur vos articles
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch(removeCoupon())}
              aria-label="Retirer le code promo"
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-emerald-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : isAuthenticated ? (
          <form onSubmit={handleApply} noValidate>
            <label htmlFor="coupon-code" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <Tag className="h-3.5 w-3.5 text-primary" />
              Code promo
            </label>
            <div className="flex gap-2">
              <input
                id="coupon-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex : BIENVENUE10"
                maxLength={32}
                autoComplete="off"
                className={cn(
                  'h-11 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm font-medium uppercase tracking-wide outline-none transition-all placeholder:normal-case placeholder:tracking-normal focus:border-primary focus:ring-2 focus:ring-primary/20',
                  couponError && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                )}
              />
              <Button type="submit" variant="outline" className="h-11 rounded-xl" disabled={!code.trim() || couponLoading}>
                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Appliquer'}
              </Button>
            </div>
            {couponError && <p className="mt-1.5 animate-fade-in text-sm text-destructive">{couponError}</p>}
          </form>
        ) : (
          <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
            <Link to="/login" state={{ from: '/cart' }} className="font-medium text-primary hover:underline">
              Connectez-vous
            </Link>{' '}
            pour utiliser un code promo.
          </p>
        )}

        {/* Totaux */}
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Sous-total</dt>
            <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex animate-fade-in justify-between text-emerald-600">
              <dt>Remise ({coupon?.code})</dt>
              <dd className="font-medium tabular-nums">-{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Livraison</dt>
            <dd className="font-medium tabular-nums">{formatPrice(shipping)}</dd>
          </div>
        </dl>

        <div className="flex items-end justify-between border-t pt-4">
          <span className="font-semibold">Total</span>
          <span key={total} className="animate-pop text-3xl font-extrabold tracking-tight text-primary tabular-nums">
            {formatPrice(total)}
          </span>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 p-3 text-sm">
          <Banknote className="h-4 w-4 shrink-0 text-primary" />
          <span>{PAYMENT_METHOD_LABEL}</span>
        </div>

        {showCheckoutButton && (
          <Button asChild size="lg" className="h-12 w-full rounded-xl text-base shadow-lg shadow-primary/25" disabled={itemCount === 0}>
            <Link to="/checkout">
              <Lock className="mr-2 h-4 w-4" />
              Passer la commande
            </Link>
          </Button>
        )}

        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5" /> Livraison partout en Tunisie
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" /> Vous ne payez qu&apos;à la réception
          </li>
        </ul>
      </div>
    </div>
  );
}
