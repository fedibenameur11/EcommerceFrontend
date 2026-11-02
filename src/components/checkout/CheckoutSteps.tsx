import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Panier', 'Livraison', 'Confirmation'] as const;

/**
 * Indicateur d'étapes du parcours d'achat.
 * current : 1 = panier, 2 = livraison, 3 = confirmation (les étapes précédentes sont cochées).
 */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-8 flex items-center" aria-label="Étapes de la commande">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className={cn('flex items-center', i < STEPS.length - 1 && 'flex-1')}>
            <div className="flex items-center gap-2.5" aria-current={active ? 'step' : undefined}>
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/20',
                  !done && !active && 'border-border text-muted-foreground'
                )}
              >
                {done ? <Check className="h-4 w-4 animate-pop" /> : step}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border sm:mx-4">
                <span
                  className={cn(
                    'block h-full origin-left bg-primary transition-transform duration-500',
                    done ? 'scale-x-100' : 'scale-x-0'
                  )}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
