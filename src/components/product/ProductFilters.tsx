import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Search, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  MAX_PRICE_FILTER as MAX_PRICE,
  setFilters,
  setSortBy,
  selectFilters,
  selectSortBy,
  selectCategories,
  selectBrands,
  fetchCategories,
  fetchBrands,
} from '@/store/slices/productSlice';
import { useProductFilterActions } from '@/hooks/useProductFilterActions';
import { cn, debounce } from '@/lib/utils';
import { CLOTHING_SIZES, COLORS, GENDERS, SHOE_SIZES } from '@/utils/productOptions';

const PRICE_STEP = 5;
/** Hauteur de l'en-tête fixe (4 rem) + marge : sous ce seuil, la colonne reste collée en haut de l'écran */
const STICKY_OFFSET_PX = 112;

interface ProductFiltersProps {
  /** Petits écrans : le panneau n'est affiché que lorsqu'il est ouvert (toujours visible à partir de lg) */
  open?: boolean;
}

/**
 * Colonne de filtres fixe à gauche de la liste : tous les paramètres sont affichés, sans clic.
 * Elle reste collée en haut de l'écran pendant le défilement dès qu'elle tient dans la fenêtre ;
 * sinon elle défile avec la page (jamais de barre de défilement interne).
 */
export function ProductFilters({ open = true }: ProductFiltersProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const sortBy = useAppSelector(selectSortBy);
  const categories = useAppSelector(selectCategories);
  const brands = useAppSelector(selectBrands);
  const [searchParams] = useSearchParams();
  const { selectCategory, resetAll } = useProductFilterActions();
  const [brandQuery, setBrandQuery] = useState('');
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice.toString());
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice.toString());
  const asideRef = useRef<HTMLElement>(null);
  const [sticky, setSticky] = useState(true);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Sync URL params with filters
  useEffect(() => {
    dispatch(setFilters({ category: searchParams.get('category') ?? 'all' }));
    // Liens de navigation (ex. « Meilleurs prix ») : /?sort=price-asc
    const sort = searchParams.get('sort');
    if (sort === 'price-asc' || sort === 'price-desc' || sort === 'name') {
      dispatch(setSortBy(sort));
    }
  }, [searchParams, dispatch]);

  // Les champs de prix suivent le store quand il change ailleurs (réinitialisation, pastille retirée) ;
  // taper dans un champ ne le réécrit pas tant que la valeur correspond au store
  const [storePrice, setStorePrice] = useState({ min: filters.minPrice, max: filters.maxPrice });
  if (storePrice.min !== filters.minPrice || storePrice.max !== filters.maxPrice) {
    setStorePrice({ min: filters.minPrice, max: filters.maxPrice });
    if ((parseFloat(localMinPrice) || 0) !== filters.minPrice) setLocalMinPrice(String(filters.minPrice));
    if ((parseFloat(localMaxPrice) || MAX_PRICE) !== filters.maxPrice) setLocalMaxPrice(String(filters.maxPrice));
  }

  // Collée en haut seulement si elle tient dans la fenêtre
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    const check = () => setSticky(el.offsetHeight <= window.innerHeight - STICKY_OFFSET_PX);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    window.addEventListener('resize', check);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', check);
    };
  }, []);

  // Debounced price filter update (memoized so the timer is stable across renders)
  const debouncedPriceUpdate = useMemo(
    () =>
      debounce((minPrice: number, maxPrice: number) => {
        dispatch(setFilters({ minPrice, maxPrice }));
      }, 500),
    [dispatch]
  );

  const updatePrice = (min: string, max: string) => {
    setLocalMinPrice(min);
    setLocalMaxPrice(max);
    debouncedPriceUpdate(parseFloat(min) || 0, parseFloat(max) || MAX_PRICE);
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.minPrice > 0 ||
    filters.maxPrice < MAX_PRICE ||
    filters.search !== '' ||
    filters.brand !== 'all' ||
    filters.gender !== 'all' ||
    filters.size !== 'all' ||
    filters.color !== 'all' ||
    filters.minRating > 0 ||
    sortBy !== 'default';

  const visibleBrands = brands.filter((b) => b.toLowerCase().includes(brandQuery.trim().toLowerCase()));

  return (
    <aside
      ref={asideRef}
      aria-label="Filtres"
      className={cn('lg:self-start', sticky && 'lg:sticky lg:top-24', open ? 'block animate-fade-in' : 'hidden lg:block')}
    >
      <div className="divide-y rounded-2xl border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-bold">Filtres</h2>
          {hasActiveFilters && (
            <button type="button" onClick={resetAll} className="text-xs font-medium text-primary hover:underline">
              Réinitialiser
            </button>
          )}
        </div>

        <Section title="Catégorie">
          <div className="flex flex-wrap gap-1.5">
            <Chip label="Toutes" active={filters.category === 'all'} onClick={() => selectCategory('all')} />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                count={category.productCount}
                active={filters.category === String(category.id)}
                onClick={() => selectCategory(String(category.id))}
              />
            ))}
          </div>
        </Section>

        {brands.length > 0 && (
          <Section title="Marque">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Rechercher une marque..."
                aria-label="Rechercher une marque"
                className="h-8 w-full rounded-lg bg-muted/60 pl-8 pr-2 text-xs outline-none transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex max-h-[4.75rem] flex-wrap gap-1.5 overflow-y-auto">
              {visibleBrands.length === 0 ? (
                <span className="text-xs text-muted-foreground">Aucune marque trouvée</span>
              ) : (
                visibleBrands.map((brand) => (
                  <Chip
                    key={brand}
                    label={brand}
                    active={filters.brand === brand}
                    onClick={() => dispatch(setFilters({ brand: filters.brand === brand ? 'all' : brand }))}
                  />
                ))
              )}
            </div>
          </Section>
        )}

        <Section title="Genre">
          <div className="flex flex-wrap gap-1.5">
            {(['all', ...GENDERS] as const).map((g) => (
              <Chip
                key={g}
                label={g === 'all' ? 'Tous' : g}
                active={filters.gender === g}
                onClick={() => dispatch(setFilters({ gender: g }))}
              />
            ))}
          </div>
        </Section>

        <Section title="Prix">
          <PriceSlider min={localMinPrice} max={localMaxPrice} onChange={updatePrice} />
          <div className="mt-3 flex items-center gap-2">
            <PriceInput
              id="minPrice"
              label="Prix min"
              value={localMinPrice}
              placeholder="0"
              onChange={(v) => updatePrice(v, localMaxPrice)}
            />
            <span className="h-0.5 w-2.5 shrink-0 rounded bg-border" aria-hidden />
            <PriceInput
              id="maxPrice"
              label="Prix max"
              value={localMaxPrice}
              placeholder={String(MAX_PRICE)}
              onChange={(v) => updatePrice(localMinPrice, v)}
            />
          </div>
        </Section>

        <Section title="Taille">
          <div className="flex flex-wrap gap-1.5" aria-label="Tailles de vêtements">
            {CLOTHING_SIZES.map((s) => (
              <Chip
                key={s}
                label={s}
                compact
                active={filters.size === s}
                onClick={() => dispatch(setFilters({ size: filters.size === s ? 'all' : s }))}
              />
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Pointures">
            {SHOE_SIZES.map((s) => (
              <Chip
                key={s}
                label={s}
                compact
                active={filters.size === s}
                onClick={() => dispatch(setFilters({ size: filters.size === s ? 'all' : s }))}
              />
            ))}
          </div>
        </Section>

        <Section title={filters.color !== 'all' ? `Couleur · ${filters.color}` : 'Couleur'}>
          <div className="flex flex-wrap gap-2 px-0.5">
            {COLORS.map((c) => {
              const active = filters.color === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={active}
                  onClick={() => dispatch(setFilters({ color: active ? 'all' : c.name }))}
                  style={{ backgroundColor: c.hex }}
                  className={cn(
                    'h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110',
                    active && 'ring-2 ring-primary ring-offset-1'
                  )}
                />
              );
            })}
          </div>
        </Section>

        <Section title="Note">
          <ul>
            <li>
              <OptionRow active={filters.minRating === 0} onClick={() => dispatch(setFilters({ minRating: 0 }))}>
                Toutes les notes
              </OptionRow>
            </li>
            {[4, 3, 2, 1].map((n) => (
              <li key={n}>
                <OptionRow
                  active={filters.minRating === n}
                  onClick={() => dispatch(setFilters({ minRating: filters.minRating === n ? 0 : n }))}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="flex" aria-hidden>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn('h-3 w-3', i <= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
                        />
                      ))}
                    </span>
                    et plus
                  </span>
                </OptionRow>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="px-4 py-3">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

/** Pastille cliquable (catégorie, marque, genre, taille) */
function Chip({
  label,
  active,
  count,
  compact,
  onClick,
}: {
  label: string;
  active: boolean;
  count?: number;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md border px-2 py-0.5 text-xs transition-colors',
        compact && 'min-w-[2rem] text-center',
        active ? 'border-primary bg-primary/10 font-medium text-primary' : 'hover:border-primary/40'
      )}
    >
      {label}
      {count !== undefined && <span className={cn('ml-1', active ? 'text-primary/70' : 'text-muted-foreground')}>{count}</span>}
    </button>
  );
}

function OptionRow({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-[13px] transition-colors hover:bg-muted',
        active && 'bg-primary/10 font-medium text-primary hover:bg-primary/10'
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
    </button>
  );
}

/** Curseur de prix à deux poignées (deux <input type="range"> superposés) */
function PriceSlider({
  min,
  max,
  onChange,
}: {
  min: string;
  max: string;
  onChange: (min: string, max: string) => void;
}) {
  const lo = Math.min(Math.max(parseFloat(min) || 0, 0), MAX_PRICE);
  const hi = Math.min(Math.max(parseFloat(max) || MAX_PRICE, 0), MAX_PRICE);
  const left = (Math.min(lo, hi) / MAX_PRICE) * 100;
  const right = 100 - (Math.max(lo, hi) / MAX_PRICE) * 100;

  return (
    <div className="px-2">
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          type="range"
          className="dual-range"
          min={0}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={lo}
          aria-label="Prix minimum"
          onChange={(e) => onChange(String(Math.min(Number(e.target.value), hi)), max)}
        />
        <input
          type="range"
          className="dual-range"
          min={0}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={hi}
          aria-label="Prix maximum"
          onChange={(e) => onChange(min, String(Math.max(Number(e.target.value), lo)))}
        />
      </div>
    </div>
  );
}

interface PriceInputProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function PriceInput({ id, label, value, placeholder, onChange }: PriceInputProps) {
  return (
    <label htmlFor={id} className="relative block min-w-0 flex-1">
      <span className="absolute -top-1.5 left-2 z-10 bg-card px-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
        {label.replace('Prix ', '')}
      </span>
      <input
        id={id}
        type="number"
        min="0"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border bg-background pl-2.5 pr-9 text-xs font-medium outline-none transition-all [appearance:textfield] hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground">
        TND
      </span>
    </label>
  );
}
