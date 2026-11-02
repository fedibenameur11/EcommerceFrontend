import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToWishlist, removeFromWishlist, selectWishlistItems } from '@/store/slices/wishlistSlice';
import { useNotification } from '@/context/NotificationContext';
import type { Product } from '@/models/product';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

// Directions (en px) des petits cœurs qui jaillissent quand on aime un produit
const PARTICLES = [
  [0, -26], [22, -16], [26, 6], [14, 24], [-14, 24], [-26, 6], [-22, -16], [0, 28],
] as const;

/**
 * Cœur : un clic ajoute le produit à la liste de souhaits (ou le retire s'il y est déjà).
 * Réservé aux clients ; les autres visiteurs sont renvoyés vers la connexion.
 * Quand on aime un produit, le cœur « bat » et des petits cœurs jaillissent.
 */
export function WishlistButton({ product, className }: WishlistButtonProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const user = useAppSelector((state) => state.auth.user);
  const liked = useAppSelector(selectWishlistItems).some((p) => p.id === product.id);
  // Compteur d'animations : change à chaque « j'aime » pour rejouer l'effet
  const [burst, setBurst] = useState(0);

  // Admins et vendeurs n'ont pas de liste de souhaits
  if (user && user.role !== 'Customer' && user.role !== 'Seller') return null;

  const handleClick = (e: React.MouseEvent) => {
    // Le bouton est souvent placé dans un lien (carte produit)
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (liked) {
      dispatch(removeFromWishlist(product.id));
      showNotification('Retiré de votre liste de souhaits', 'info');
    } else {
      dispatch(addToWishlist(product));
      setBurst((n) => n + 1);
      showNotification('Ajouté à votre liste de souhaits ❤', 'success');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
      title={liked ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow transition-all hover:scale-110 hover:bg-background active:scale-90',
        className
      )}
    >
      {burst > 0 && (
        <span key={burst} aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="absolute h-9 w-9 animate-ring rounded-full border-2 border-red-400" />
          {PARTICLES.map(([x, y], i) => (
            <Heart
              key={i}
              className="absolute h-2.5 w-2.5 animate-burst fill-red-500 text-red-500"
              style={{ '--tx': `${x}px`, '--ty': `${y}px` } as React.CSSProperties}
            />
          ))}
        </span>
      )}
      <Heart
        key={liked ? `liked-${burst}` : 'idle'}
        className={cn(
          'h-5 w-5 transition-colors',
          liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
          liked && burst > 0 && 'animate-heart-beat'
        )}
      />
    </button>
  );
}

export default WishlistButton;
