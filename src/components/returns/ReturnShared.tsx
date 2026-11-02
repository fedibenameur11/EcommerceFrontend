import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReturnStatus } from '@/models/returns';

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  Requested: 'Demande envoyée',
  Approved: 'Retour accepté',
  Rejected: 'Refusé',
  Received: 'Article reçu',
  Refunded: 'Remboursé',
};

const STYLES: Record<ReturnStatus, string> = {
  Requested: 'bg-amber-100 text-amber-700',
  Approved: 'bg-sky-100 text-sky-700',
  Rejected: 'bg-red-100 text-red-700',
  Received: 'bg-indigo-100 text-indigo-700',
  Refunded: 'bg-emerald-100 text-emerald-700',
};

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', STYLES[status])}>
      {RETURN_STATUS_LABELS[status]}
    </span>
  );
}

const STEPS: ReturnStatus[] = ['Requested', 'Approved', 'Received', 'Refunded'];

/** Suivi d'une demande de retour : envoyée → acceptée → reçue → remboursée */
export function ReturnTimeline({ status }: { status: ReturnStatus }) {
  if (status === 'Rejected') {
    return <p className="text-sm font-medium text-red-600">Demande refusée</p>;
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className="flex items-center gap-1 text-xs">
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step} className="flex items-center gap-1">
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold',
                done ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <span className={cn('hidden sm:inline', done ? 'font-medium' : 'text-muted-foreground')}>
              {RETURN_STATUS_LABELS[step]}
            </span>
            {index < STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
