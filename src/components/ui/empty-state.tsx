import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  EmptyCartArt,
  EmptyOrdersArt,
  EmptyWishlistArt,
  NoResultsArt,
} from '@/components/ui/illustrations';

const ART = {
  cart: EmptyCartArt,
  search: NoResultsArt,
  orders: EmptyOrdersArt,
  wishlist: EmptyWishlistArt,
} as const;

interface EmptyStateProps {
  variant: keyof typeof ART;
  title: string;
  description?: ReactNode;
  /** Boutons ou liens affichés sous le texte */
  children?: ReactNode;
  className?: string;
}

/**
 * État vide illustré : panier vide, aucun résultat, aucune commande, aucun favori.
 */
export function EmptyState({ variant, title, description, children, className }: EmptyStateProps) {
  const Art = ART[variant];
  return (
    <div className={cn('flex flex-col items-center justify-center px-4 py-12 text-center animate-fade-up', className)}>
      <Art className="mb-6 h-48 w-60 max-w-full sm:h-56 sm:w-72" />
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      {description && <p className="mt-2 max-w-md text-muted-foreground">{description}</p>}
      {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}
