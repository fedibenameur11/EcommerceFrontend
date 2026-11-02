import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProductById,
  selectSelectedProduct,
  selectLoading,
  selectError,
  clearSelectedProduct,
} from '@/store/slices/productSlice';
import { addManyToCart } from '@/store/slices/cartSlice';
import { cn, formatPrice } from '@/lib/utils';
import { flyToCart } from '@/lib/flyToCart';
import { useCategoryName } from '@/hooks/useCategoryName';
import { useNotification } from '@/context/NotificationContext';
import { StarRating } from '@/components/product/StarRating';
import { WishlistButton } from '@/components/product/WishlistButton';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductGallery } from '@/components/product/ProductGallery';
import productService from '@/services/api/productService';
import { FlashSaleBanner, PriceTag } from '@/components/product/FlashSale';
import { SizeSelector } from '@/components/product/SizeSelector';
import { sizeNoun } from '@/utils/productOptions';

/** Squelette affiché pendant le chargement : même mise en page que la page finale */
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8" aria-busy="true" aria-label="Chargement du produit">
      <Skeleton className="mb-8 h-4 w-72" />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Product detail page
 */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const product = useAppSelector(selectSelectedProduct);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const categoryName = useCategoryName(product?.categoryId ?? 0);
  // Note moyenne rafraîchie après un nouvel avis (sans recharger toute la page)
  const [freshRating, setFreshRating] = useState<{ average: number; count: number } | null>(null);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  // Un autre produit s'affiche : on repart d'une quantité de 1 (réinitialisation pendant le rendu, sans effet)
  const [quantityFor, setQuantityFor] = useState(id);
  // Pointure / taille choisie ; « missingSize » déclenche l'invite si on ajoute sans avoir choisi
  const [size, setSize] = useState<string | null>(null);
  const [missingSize, setMissingSize] = useState(false);
  if (quantityFor !== id) {
    setQuantityFor(id);
    setQuantity(1);
    setSize(null);
    setMissingSize(false);
  }

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(parseInt(id)));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  // L'image de couverture vient en premier, puis les images supplémentaires
  const galleryImages = useMemo(
    () => (product ? [product.imageUrl, ...(product.images ?? [])].filter(Boolean) : []),
    [product]
  );

  const refreshRating = () => {
    if (!id) return;
    productService
      .getProductById(parseInt(id))
      .then((p) => setFreshRating({ average: p.averageRating ?? 0, count: p.reviewCount ?? 0 }))
      .catch(() => {});
  };

  // Loading State
  if (loading && !product) {
    return <ProductDetailSkeleton />;
  }

  // Error / Not found State
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          variant="search"
          title="Produit introuvable"
          description={error ?? "Ce produit n'existe plus ou n'est plus disponible."}
        >
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la boutique
            </Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;
  const maxQuantity = Math.max(product.stockQuantity, 1);
  const rating = freshRating?.average ?? product.averageRating ?? 0;
  const reviewCount = freshRating?.count ?? product.reviewCount ?? 0;

  const sizes = product.sizes ?? [];

  const handleAddToCart = () => {
    if (sizes.length > 0 && !size) {
      setMissingSize(true);
      document.getElementById('choix-taille')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    dispatch(addManyToCart({ product, quantity, size: size ?? undefined }));
    flyToCart(document.querySelector<HTMLImageElement>('[data-product-image]'));
    showNotification(
      `${quantity > 1 ? `${quantity} × ` : ''}« ${product.name} »${size ? ` (${sizeNoun(size).toLowerCase()} ${size})` : ''} ajouté au panier`,
      'success'
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="transition-colors hover:text-primary">
              Accueil
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <li>
            <Link
              to={`/?category=${product.categoryId}#produits`}
              className="capitalize transition-colors hover:text-primary"
            >
              {categoryName}
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <li className="max-w-[16rem] truncate font-medium text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Galerie : reste visible pendant le défilement de la fiche */}
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ProductGallery images={galleryImages} alt={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {categoryName}
                </Badge>
                {product.gender && <Badge variant="outline">{product.gender}</Badge>}
                {product.color && <Badge variant="outline">{product.color}</Badge>}
                {product.brand && <Badge variant="outline">{product.brand}</Badge>}
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                {product.name}
              </h1>
            </div>
            <WishlistButton product={product} className="h-11 w-11 shrink-0 border" />
          </div>

          {/* Rating */}
          <a href="#avis" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
            <StarRating value={rating} />
            <span className="text-sm text-muted-foreground">
              {rating.toFixed(1)} / 5 · {reviewCount} avis
            </span>
          </a>

          <FlashSaleBanner product={product} />

          {/* Price + stock */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="text-4xl font-extrabold tracking-tight text-primary">
                <PriceTag product={product} oldClassName="text-xl" />
              </p>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                  outOfStock
                    ? 'bg-red-50 text-red-700'
                    : lowStock
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    outOfStock ? 'bg-red-500' : lowStock ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                />
                {outOfStock
                  ? 'Rupture de stock'
                  : lowStock
                    ? `Plus que ${product.stockQuantity} en stock`
                    : 'En stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {/* Pointure / taille */}
          {sizes.length > 0 && !outOfStock && (
            <div id="choix-taille" className="scroll-mt-40">
              <SizeSelector
                sizes={sizes}
                value={size}
                invalid={missingSize}
                onChange={(s) => {
                  setSize(s);
                  setMissingSize(false);
                }}
              />
            </div>
          )}

          {/* Quantité + ajout au panier */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div
              className="flex h-12 items-center justify-between rounded-xl border bg-background sm:w-40"
              role="group"
              aria-label="Quantité"
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || outOfStock}
                aria-label="Diminuer la quantité"
                className="flex h-full w-12 items-center justify-center rounded-l-xl transition-colors hover:bg-accent disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span key={quantity} className="animate-pop text-lg font-semibold tabular-nums" aria-live="polite">
                {outOfStock ? 0 : quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity || outOfStock}
                aria-label="Augmenter la quantité"
                className="flex h-full w-12 items-center justify-center rounded-r-xl transition-colors hover:bg-accent disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              size="lg"
              disabled={outOfStock}
              className={cn(
                'h-12 flex-1 rounded-xl text-base shadow-lg shadow-primary/25 transition-all duration-300 active:scale-95',
                added && 'bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-600'
              )}
            >
              {added ? (
                <Check className="mr-2 h-5 w-5 animate-pop" />
              ) : (
                <ShoppingCart className="mr-2 h-5 w-5" />
              )}
              {outOfStock ? 'Indisponible' : added ? 'Ajouté au panier !' : 'Ajouter au panier'}
            </Button>
          </div>

          {!outOfStock && quantity > 1 && (
            <p className="text-sm text-muted-foreground">
              Total pour {quantity} articles :{' '}
              <span className="font-semibold text-foreground">{formatPrice(product.price * quantity)}</span>
            </p>
          )}

          {/* Features */}
          <ul className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3">
            {[
              { icon: Truck, title: 'Livraison : 10 TND', text: 'Frais fixes par commande' },
              { icon: Banknote, title: 'Paiement à la livraison', text: 'En espèces, au livreur' },
              { icon: RotateCcw, title: 'Retours faciles', text: 'Sous 30 jours' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3 bg-card p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="avis" className="scroll-mt-40">
        <ProductReviews productId={product.id} onChanged={refreshRating} />
      </div>
    </div>
  );
}
