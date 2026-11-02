import { cn } from '@/lib/utils';
import { sizeKindOf } from '@/utils/productOptions';

interface SizeSelectorProps {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
  /** Affiche l'invite en rouge quand le client a tenté d'ajouter sans choisir */
  invalid?: boolean;
}

/** Choix de la pointure / taille sur la page produit */
export function SizeSelector({ sizes, value, onChange, invalid = false }: SizeSelectorProps) {
  const label = sizeKindOf(sizes) === 'shoes' ? 'Pointure' : 'Taille';

  return (
    <div role="radiogroup" aria-label={label} aria-invalid={invalid}>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">
          {label}
          {value && <span className="ml-2 font-normal text-muted-foreground">{value}</span>}
        </h2>
        {invalid && !value && (
          <span role="alert" className="text-xs font-medium text-destructive">
            Choisissez une {label.toLowerCase()}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const selected = size === value;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(size)}
              className={cn(
                'h-11 min-w-[3rem] rounded-xl border px-3 text-sm font-semibold transition-all active:scale-95',
                selected
                  ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'bg-background hover:border-primary/50 hover:bg-accent',
                invalid && !value && 'border-destructive/60'
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SizeSelector;
