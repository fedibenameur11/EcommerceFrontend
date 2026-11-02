import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  /** Note courante (0 à 5, décimales acceptées en lecture seule) */
  value: number;
  /** Si fourni, les étoiles sont cliquables pour choisir une note de 1 à 5 */
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' } as const;

/**
 * Affiche (ou permet de saisir) une note sur 5 étoiles
 */
export function StarRating({ value, onChange, size = 'md', className }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  const shown = interactive && hover > 0 ? hover : value;

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Note : ${value.toFixed(1)} sur 5`}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        // Remplissage partiel (en %) pour les notes moyennes comme 3,5
        const fill = Math.max(0, Math.min(1, shown - (star - 1))) * 100;
        const starIcon = (
          <span className="relative inline-block">
            <Star className={cn(sizes[size], 'text-muted-foreground/40')} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <Star className={cn(sizes[size], 'fill-yellow-400 text-yellow-400')} />
            </span>
          </span>
        );
        return interactive ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={Math.round(value) === star}
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
            className="cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(star)}
          >
            {starIcon}
          </button>
        ) : (
          <span key={star}>{starIcon}</span>
        );
      })}
    </div>
  );
}

export default StarRating;