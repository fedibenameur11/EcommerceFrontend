import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useAppDispatch } from '@/store/hooks';
import { resetFilters } from '@/store/slices/productSlice';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
}

/**
 * Grid layout for product cards
 */
export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 12,
}: ProductGridProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(skeletonCount)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        variant="search"
        title="Aucun produit trouvé"
        description="Aucun produit ne correspond à votre recherche ou à vos filtres. Essayez d'élargir votre budget ou de changer de catégorie."
      >
        <Button
          onClick={() => {
            dispatch(resetFilters());
            navigate('/#produits');
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Réinitialiser les filtres
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
