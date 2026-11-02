/**
 * Categories Page
 * Liste des catégories ; un clic ouvre la boutique filtrée sur la catégorie (/?category=ID)
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCategories,
  selectCategories,
  selectError,
  selectLoading,
} from '@/store/slices/productSlice';

export const CategoriesPage = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const retry = () => {
    dispatch(fetchCategories());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Catégories</h1>
        <p className="text-muted-foreground">
          Choisissez une catégorie pour afficher ses produits.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">{error}</p>
          <button onClick={retry} className="mt-2 text-sm underline hover:no-underline">
            Réessayer
          </button>
        </div>
      )}

      {loading && categories.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      ) : categories.length === 0 && !error ? (
        <p className="py-12 text-center text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const count = category.productCount ?? 0;
            return (
              <Link key={category.id} to={`/?category=${category.id}`} className="group block h-full">
                <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Tag className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h2 className="text-lg font-semibold group-hover:text-primary">{category.name}</h2>
                      {category.productCount !== undefined && (
                        <Badge variant="secondary" className="shrink-0">
                          {count} {count > 1 ? 'produits' : 'produit'}
                        </Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
                    )}
                    <Button variant="ghost" size="sm" className="mt-auto w-fit px-0 text-primary">
                      Voir les produits
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
