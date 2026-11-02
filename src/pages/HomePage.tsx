import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Truck, Banknote, ShieldCheck, Headphones, Tag, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductToolbar } from '@/components/product/ProductToolbar';
import { Pagination } from '@/components/product/Pagination';
import { ProductCard } from '@/components/product/ProductCard';
import { Countdown } from '@/components/product/FlashSale';
import productService from '@/services/api/productService';
import type { Product } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProducts,
  selectPaginatedProducts,
  selectLoading,
  selectError,
  selectFilters,
  selectSortBy,
  selectCurrentPage,
  selectCategories,
} from '@/store/slices/productSlice';

const perks = [
  { icon: Truck, title: 'Livraison rapide', text: 'Partout en Tunisie' },
  { icon: Banknote, title: 'Paiement à la livraison', text: 'Payez à réception' },
  { icon: ShieldCheck, title: 'Achat sécurisé', text: 'Vos données protégées' },
  { icon: Headphones, title: 'Support réactif', text: 'Une équipe à votre écoute' },
];

/**
 * Home page: hero, trust strip, category tiles, then the product listing with filters and pagination
 */
export function HomePage() {
  // Ventes flash en cours (les 4 plus récentes)
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  // Petits écrans : le panneau de filtres est replié par défaut
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    productService
      .getPage({ onSale: true, pageSize: 4 })
      .then((page) => setFlashProducts(page.items as Product[]))
      .catch(() => setFlashProducts([]));
  }, []);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const paginatedProducts = useAppSelector(selectPaginatedProducts);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const sortBy = useAppSelector(selectSortBy);
  const currentPage = useAppSelector(selectCurrentPage);
  const categories = useAppSelector(selectCategories);

  const activeCategory =
    filters.category !== 'all'
      ? categories.find((category) => String(category.id) === filters.category)
      : undefined;

  const featuredCategories = categories.slice(0, 6);

  // Recherche, filtres, tri et pagination sont exécutés par le serveur : on recharge à chaque changement
  useEffect(() => {
    dispatch(fetchProducts());
  }, [
    dispatch,
    filters.category,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.brand,
    filters.gender,
    filters.size,
    filters.color,
    filters.minRating,
    sortBy,
    currentPage,
  ]);

  // Les liens de navigation pointent vers #produits : on défile une fois la page rendue
  useEffect(() => {
    if (location.hash !== '#produits') return;
    const timer = window.setTimeout(
      () => document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      50
    );
    return () => window.clearTimeout(timer);
  }, [location.hash, location.search]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-primary/80 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium backdrop-blur">
              <Tag className="h-3.5 w-3.5" />
              Nouvelle collection disponible
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Le shopping, <br />
              <span className="bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">
                simplement premium.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Des produits de qualité à des prix imbattables, livrés chez vous avec paiement à la
              livraison.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-white px-8 text-slate-900 hover:bg-slate-100">
                <a href="#produits">
                  Découvrir la boutique <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/30 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/categories">Parcourir les catégories</Link>
              </Button>
            </div>
          </div>

          {/* Mosaïque de catégories : un clic ouvre la boutique filtrée sur la catégorie */}
          {featuredCategories.length > 0 && (
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {featuredCategories.slice(0, 4).map((category, i) => (
                  <Link
                    key={category.id}
                    to={`/?category=${category.id}#produits`}
                    className={`group rounded-2xl border border-white/15 bg-white/95 p-4 shadow-2xl transition-transform duration-300 hover:-translate-y-1 ${i % 2 ? 'translate-y-8' : ''}`}
                  >
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Tag className="h-10 w-10 text-slate-400" />
                      )}
                    </div>
                    <p className="mt-3 truncate text-sm font-semibold text-slate-900">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {category.productCount ?? 0} produit{(category.productCount ?? 0) > 1 ? 's' : ''}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bandeau de réassurance */}
      <section className="border-b bg-background">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-6 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ventes flash */}
      {flashProducts.length > 0 && (
        <section className="container mx-auto px-4 pt-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Zap className="h-6 w-6 fill-red-500 text-red-500" /> Ventes flash
              </h2>
              <p className="text-sm text-muted-foreground">Des prix réduits pour une durée limitée</p>
            </div>
            {flashProducts[0].saleEndsAt && (
              <p className="rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">
                Prochaine fin dans <Countdown endsAt={[...flashProducts].sort((a, b) => new Date(a.saleEndsAt!).getTime() - new Date(b.saleEndsAt!).getTime())[0].saleEndsAt!} className="font-bold" />
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {flashProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Produits */}
      <div id="produits" className="container mx-auto scroll-mt-24 px-4 py-14">

        {/* Active category */}
        {activeCategory && (
          <div className="mb-6 rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Catégorie</p>
                <h3 className="text-xl font-bold">{activeCategory.name}</h3>
                {activeCategory.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{activeCategory.description}</p>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                <Link to="/categories" className="text-primary underline">
                  Toutes les catégories
                </Link>
                <Link to="/" className="text-muted-foreground underline hover:text-primary">
                  Voir tous les produits
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filtres fixes à gauche, produits à droite */}
        <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ProductFilters open={filtersOpen} />

          <div className="min-w-0">
            <ProductToolbar filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen((o) => !o)} />

            {/* Error State */}
            {error && (
              <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
                <p className="text-destructive">{error}</p>
                <button
                  onClick={() => dispatch(fetchProducts())}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid products={paginatedProducts} loading={loading} />

            {/* Pagination */}
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
}

