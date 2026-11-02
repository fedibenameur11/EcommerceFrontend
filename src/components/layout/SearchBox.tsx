import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ImageOff, Loader2, Search, SearchX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { setFilters } from '@/store/slices/productSlice';
import productService, { type ProductSuggestion } from '@/services/api/productService';
import { cn, formatPrice } from '@/lib/utils';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

/** Met en gras la partie du texte qui correspond à la saisie. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  const at = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded bg-primary/15 px-0.5 font-bold text-primary">{text.slice(at, at + needle.length)}</mark>
      {text.slice(at + needle.length)}
    </>
  );
}

/**
 * Barre de recherche avec suggestions en cours de frappe : miniature, nom, catégorie et prix.
 * Navigation au clavier (↑ ↓ Entrée Échap) ; Entrée sans sélection lance la recherche complète.
 */
export function SearchBox({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const trimmed = query.trim();
  const searchable = trimmed.length >= MIN_CHARS;

  // Requête différée ; la précédente est annulée dès que la saisie change
  useEffect(() => {
    if (!searchable) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const items = await productService.getSuggestions(trimmed, controller.signal);
        setResults(items);
        setActive(-1);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, searchable]);

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const visibleResults = searchable ? results : [];
  const showPanel = open && searchable;
  // Une ligne de plus que les résultats : « Voir tous les résultats »
  const optionCount = visibleResults.length + 1;

  const runFullSearch = () => {
    dispatch(setFilters({ search: trimmed }));
    setOpen(false);
    if (location.pathname !== '/') navigate('/#produits');
    else document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openProduct = (id: number) => {
    setOpen(false);
    navigate(`/product/${id}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && active < visibleResults.length) openProduct(visibleResults[active].id);
    else runFullSearch();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!showPanel) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % optionCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? optionCount - 1 : i - 1));
    }
  };

  const activeId = active >= 0 ? `${listId}-${active}` : undefined;

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <form onSubmit={submit} role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Rechercher un produit"
            autoComplete="off"
            placeholder="Rechercher un produit, une marque…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (e.target.value.trim().length < MIN_CHARS) {
                setResults([]);
                setLoading(false);
              }
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-11 w-full rounded-full border border-transparent bg-muted pl-10 pr-28 text-sm outline-none transition-all [&::-webkit-search-cancel-button]:hidden focus:border-primary/40 focus:bg-background focus:ring-4 focus:ring-primary/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                dispatch(setFilters({ search: '' }));
              }}
              aria-label="Effacer la recherche"
              className="absolute right-[5.75rem] top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full px-4"
          >
            Chercher
          </Button>
        </div>
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 animate-fade-in overflow-hidden rounded-2xl border bg-popover shadow-2xl"
        >
          {loading && visibleResults.length === 0 ? (
            <div className="space-y-1 p-2" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-2">
                  <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleResults.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <SearchX className="h-6 w-6" />
              </span>
              <p className="font-semibold">Aucun produit pour « {trimmed} »</p>
              <p className="text-sm text-muted-foreground">Vérifiez l&apos;orthographe ou essayez un mot plus court.</p>
            </div>
          ) : (
            <ul className={cn('max-h-[26rem] overflow-y-auto p-2 transition-opacity', loading && 'opacity-60')}>
              {visibleResults.map((product, i) => (
                <Fragment key={product.id}>
                  <li
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={active === i}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => openProduct(product.id)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors',
                      active === i && 'bg-accent'
                    )}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
                      ) : (
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        <Highlight text={product.name} query={trimmed} />
                      </span>
                      <span className="block truncate text-xs capitalize text-muted-foreground">
                        {product.categoryName}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-primary tabular-nums">
                      {formatPrice(product.price)}
                    </span>
                  </li>
                </Fragment>
              ))}
            </ul>
          )}

          <button
            type="button"
            id={`${listId}-${visibleResults.length}`}
            role="option"
            aria-selected={active === visibleResults.length}
            onMouseEnter={() => setActive(visibleResults.length)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={runFullSearch}
            className={cn(
              'flex w-full items-center justify-between border-t px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-accent',
              active === visibleResults.length && 'bg-accent'
            )}
          >
            <span className="flex items-center gap-2">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Voir tous les résultats pour « {trimmed} »
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
