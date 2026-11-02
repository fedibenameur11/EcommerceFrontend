import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  MAX_PRICE_FILTER,
  setFilters,
  setSortBy,
  selectFilters,
  selectSortBy,
  selectCategories,
  selectLoading,
  selectTotalCount,
} from '@/store/slices/productSlice';
import { useProductFilterActions } from '@/hooks/useProductFilterActions';
import { SHOE_SIZES } from '@/utils/productOptions';
import type { SortOption } from '@/types';

interface ProductToolbarProps {
  /** Petits écrans : état du panneau de filtres (replié par défaut) */
  filtersOpen: boolean;
  onToggleFilters: () => void;
}

/**
 * Barre au-dessus de la grille : nombre de résultats, tri, et pastilles des filtres actifs
 * (un clic sur une pastille retire ce filtre). Sur petit écran, elle porte le bouton « Filtres ».
 */
export function ProductToolbar({ filtersOpen, onToggleFilters }: ProductToolbarProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const sortBy = useAppSelector(selectSortBy);
  const categories = useAppSelector(selectCategories);
  const loading = useAppSelector(selectLoading);
  const totalCount = useAppSelector(selectTotalCount);
  const { selectCategory, resetAll } = useProductFilterActions();

  const categoryName = categories.find((c) => String(c.id) === filters.category)?.name;
  const sizeLabel = SHOE_SIZES.includes(filters.size) ? `Pointure ${filters.size}` : `Taille ${filters.size}`;

  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (filters.search) {
    activeFilters.push({ key: 'search', label: `Recherche : ${filters.search}`, clear: () => dispatch(setFilters({ search: '' })) });
  }
  if (filters.category !== 'all') {
    activeFilters.push({ key: 'category', label: categoryName ?? 'Catégorie', clear: () => selectCategory('all') });
  }
  if (filters.brand !== 'all') {
    activeFilters.push({ key: 'brand', label: filters.brand, clear: () => dispatch(setFilters({ brand: 'all' })) });
  }
  if (filters.gender !== 'all') {
    activeFilters.push({ key: 'gender', label: filters.gender, clear: () => dispatch(setFilters({ gender: 'all' })) });
  }
  if (filters.size !== 'all') {
    activeFilters.push({ key: 'size', label: sizeLabel, clear: () => dispatch(setFilters({ size: 'all' })) });
  }
  if (filters.color !== 'all') {
    activeFilters.push({ key: 'color', label: `Couleur : ${filters.color}`, clear: () => dispatch(setFilters({ color: 'all' })) });
  }
  if (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE_FILTER) {
    activeFilters.push({
      key: 'price',
      label: `${filters.minPrice}–${filters.maxPrice} TND`,
      clear: () => dispatch(setFilters({ minPrice: 0, maxPrice: MAX_PRICE_FILTER })),
    });
  }
  if (filters.minRating > 0) {
    activeFilters.push({ key: 'rating', label: `${filters.minRating} étoiles et plus`, clear: () => dispatch(setFilters({ minRating: 0 })) });
  }
  const filterCount = activeFilters.filter((f) => f.key !== 'search').length;

  return (
    <div className="mb-5 space-y-3 border-b pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            className="h-10 gap-2 rounded-xl lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filtres
            {filterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                {filterCount}
              </span>
            )}
          </Button>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {loading ? (
              'Chargement...'
            ) : (
              <>
                <span className="font-semibold text-foreground">{totalCount}</span> résultat{totalCount > 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:block">Trier par</span>
          <Select value={sortBy} onValueChange={(value) => dispatch(setSortBy(value as SortOption))}>
            <SelectTrigger
              aria-label="Trier par"
              className="h-10 w-[190px] rounded-xl border-transparent bg-muted/60 font-medium hover:bg-muted focus:ring-2 focus:ring-primary/20 focus:ring-offset-0"
            >
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Par défaut</SelectItem>
              <SelectItem value="price-asc">Prix : croissant</SelectItem>
              <SelectItem value="price-desc">Prix : décroissant</SelectItem>
              <SelectItem value="name">Nom : A à Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={f.clear}
              aria-label={`Retirer le filtre ${f.label}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {f.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={resetAll}
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
}
