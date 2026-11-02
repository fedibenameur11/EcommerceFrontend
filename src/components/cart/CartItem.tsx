import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import {
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
} from '@/store/slices/cartSlice';
import { cn, formatPrice, truncateText } from '@/lib/utils';
import { useCategoryName } from '@/hooks/useCategoryName';
import { sizeNoun } from '@/utils/productOptions';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

/**
 * Individual cart item component with quantity controls
 */
export function CartItem({ item }: CartItemProps) {
  const dispatch = useAppDispatch();
  const { product, quantity, size } = item;
  const key = { productId: product.id, size };
  const categoryName = useCategoryName(product.categoryId);
  const [removing, setRemoving] = useState(false);

  // Le panier garde une copie du produit : le stock affiché est celui de l'ajout, le serveur revérifie à la commande
  const atStockLimit = product.stockQuantity > 0 && quantity >= product.stockQuantity;
  const itemTotal = product.price * quantity;

  const handleRemove = () => {
    // On laisse l'animation de sortie se jouer avant de retirer la ligne
    setRemoving(true);
    window.setTimeout(() => dispatch(removeFromCart(key)), 250);
  };

  return (
    <div
      className={cn(
        'flex gap-4 py-5 transition-all duration-300 first:pt-0 last:pb-0 [&:not(:last-child)]:border-b',
        removing && 'translate-x-6 opacity-0'
      )}
    >
      {/* Product Image */}
      <Link
        to={`/product/${product.id}`}
        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md sm:h-28 sm:w-28"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-contain p-2"
        />
      </Link>

      {/* Product Details */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/product/${product.id}`}
              className="line-clamp-2 font-semibold leading-snug transition-colors hover:text-primary"
            >
              {truncateText(product.name, 70)}
            </Link>
            <p className="mt-1 text-sm capitalize text-muted-foreground">{categoryName}</p>
            {size && (
              <p className="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                {sizeNoun(size)} : {size}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Retirer ${product.name} du panier`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          {/* Quantity Controls */}
          <div>
            <div className="inline-flex items-center rounded-xl border bg-background" role="group" aria-label="Quantité">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-l-xl transition-colors hover:bg-accent"
                onClick={() => dispatch(decrementQuantity(key))}
                aria-label={quantity <= 1 ? 'Retirer du panier' : 'Diminuer la quantité'}
              >
                {quantity <= 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              </button>
              <span key={quantity} className="w-10 animate-pop text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-r-xl transition-colors hover:bg-accent disabled:opacity-40"
                onClick={() => dispatch(incrementQuantity(key))}
                disabled={atStockLimit}
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {atStockLimit && (
              <p className="mt-1 text-xs text-amber-600">Stock maximum atteint</p>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            <p key={itemTotal} className="animate-pop text-lg font-bold tabular-nums">
              {formatPrice(itemTotal)}
            </p>
            {quantity > 1 && (
              <p className="text-xs text-muted-foreground">{formatPrice(product.price)} / unité</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
