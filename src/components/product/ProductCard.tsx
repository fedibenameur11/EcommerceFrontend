import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotification } from '@/context/NotificationContext';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { cn, truncateText } from '@/lib/utils';
import { flyToCart } from '@/lib/flyToCart';
import { useCategoryName } from '@/hooks/useCategoryName';
import { sizesSummary } from '@/utils/productOptions';
import { StarRating } from '@/components/product/StarRating';
import { WishlistButton } from '@/components/product/WishlistButton';
import { Countdown, PriceTag, SaleBadge } from '@/components/product/FlashSale';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

/**
 * Product card component for displaying product in grid
 */
export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const categoryName = useCategoryName(product.categoryId);
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;
  const reviewCount = product.reviewCount ?? 0;
  const [added, setAdded] = useState(false);

  // Le bouton repasse à « Ajouter au panier » après une courte confirmation
  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  const hasSizes = (product.sizes?.length ?? 0) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    // Produit avec tailles : on laisse le lien ouvrir la fiche pour choisir la pointure / taille
    if (hasSizes) return;
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    flyToCart(e.currentTarget.closest('article')?.querySelector('img'));
    setAdded(true);
    showNotification(`« ${truncateText(product.name, 40)} » ajouté au panier`, 'success');
  };

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-white p-5">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 max-w-[60%] truncate bg-background/90 capitalize backdrop-blur"
          >
            {categoryName}
          </Badge>
          <SaleBadge product={product} className="absolute left-3 top-11" />
          <WishlistButton product={product} className="absolute right-3 top-3" />
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 py-1.5 text-center text-xs font-semibold text-white">
              Rupture de stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
            {truncateText(product.name, 60)}
          </h3>

          {(product.gender || hasSizes) && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {product.gender && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {product.gender}
                </span>
              )}
              {hasSizes && (
                <span className="truncate text-[11px] text-muted-foreground">{sizesSummary(product.sizes)}</span>
              )}
            </div>
          )}

          <div className="mb-3 flex h-5 items-center gap-2">
            {reviewCount > 0 ? (
              <>
                <StarRating value={product.averageRating ?? 0} size="sm" />
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Aucun avis</span>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-2">
            <p className="text-xl font-extrabold tracking-tight text-foreground">
              <PriceTag product={product} />
            </p>
            {lowStock && (
              <span className="text-xs font-medium text-amber-600">
                Plus que {product.stockQuantity}
              </span>
            )}
          </div>

          {product.onSale && product.saleEndsAt && (
            <p className="mt-2 text-xs font-medium text-red-600">
              ⚡ Se termine dans <Countdown endsAt={product.saleEndsAt} />
            </p>
          )}

          <Button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={cn(
              'mt-4 w-full rounded-xl transition-all duration-300 active:scale-95',
              added && 'bg-emerald-600 hover:bg-emerald-600'
            )}
            size="sm"
          >
            {added && !hasSizes ? (
              <Check className="mr-2 h-4 w-4 animate-pop" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            {outOfStock ? 'Indisponible' : hasSizes ? 'Choisir la taille' : added ? 'Ajouté !' : 'Ajouter au panier'}
          </Button>
        </div>
      </article>
    </Link>
  );
}
