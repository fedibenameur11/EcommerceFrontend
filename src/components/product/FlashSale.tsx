import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

/** Temps restant avant `endsAt` (en millisecondes), mis à jour chaque seconde */
function useRemaining(endsAt: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);
  return endsAt ? Math.max(new Date(endsAt).getTime() - now, 0) : 0;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Compte à rebours « 2j 03:12:45 » vers la fin d'une vente flash */
export function Countdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const remaining = useRemaining(endsAt);
  if (remaining <= 0) return <span className={className}>Terminée</span>;
  const total = Math.floor(remaining / 1000);
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return (
    <span className={cn('tabular-nums', className)} aria-label="Temps restant">
      {days > 0 && `${days}j `}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

/** Pourcentage de réduction d'un produit en vente flash (0 sinon) */
export const discountPercent = (product: Pick<Product, 'price' | 'originalPrice' | 'onSale'>) =>
  product.onSale && product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

/** Pastille « -25 % » à placer sur la photo d'un produit en vente flash */
export function SaleBadge({ product, className }: { product: Product; className?: string }) {
  const percent = discountPercent(product);
  if (!percent) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow',
        className
      )}
    >
      <Zap className="h-3 w-3 fill-current" />-{percent}%
    </span>
  );
}

/** Prix actuel, avec le prix normal barré pendant une vente flash */
export function PriceTag({ product, className, oldClassName }: { product: Product; className?: string; oldClassName?: string }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={cn(product.onSale && 'text-red-600', className)}>{formatPrice(product.price)}</span>
      {product.onSale && product.originalPrice != null && (
        <span className={cn('text-sm font-medium text-muted-foreground line-through', oldClassName)}>
          {formatPrice(product.originalPrice)}
        </span>
      )}
    </span>
  );
}

/** Bandeau avec compte à rebours (page produit) */
export function FlashSaleBanner({ product }: { product: Product }) {
  if (!product.onSale || !product.saleEndsAt) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5 text-white">
      <span className="flex items-center gap-2 font-bold">
        <Zap className="h-4 w-4 fill-current" /> Vente flash -{discountPercent(product)}%
      </span>
      <span className="text-sm">
        Se termine dans <Countdown endsAt={product.saleEndsAt} className="font-bold" />
      </span>
    </div>
  );
}
