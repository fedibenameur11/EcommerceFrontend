import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWishlist, selectWishlistItems, selectWishlistLoading } from '@/store/slices/wishlistSlice';

/**
 * Wishlist page: products the customer marked with the heart
 */
export const WishlistPage = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);
  const loading = useAppSelector(selectWishlistLoading);
  const error = useAppSelector((state) => state.wishlist.error);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold">
        <Heart className="h-7 w-7 fill-red-500 text-red-500" />
        Ma liste de souhaits
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          variant="wishlist"
          title="Votre liste de souhaits est vide"
          description="Cliquez sur le cœur d'un produit pour le retrouver facilement ici."
        >
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/#produits">Découvrir les produits</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;