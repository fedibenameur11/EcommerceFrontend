import type { ReactNode } from 'react';
import { Banknote, ShieldCheck, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Ligne sous le formulaire (ex. « Pas encore de compte ? ») */
  footer?: ReactNode;
  /** Icône affichée dans le bandeau, au-dessus du titre */
  icon?: ReactNode;
  /** Carte plus large pour les formulaires à deux colonnes (inscription) */
  wide?: boolean;
}

const trust = [
  { icon: Truck, text: 'Livraison partout en Tunisie' },
  { icon: Banknote, text: 'Paiement à la livraison' },
  { icon: ShieldCheck, text: 'Données protégées' },
];

/**
 * Mise en page commune des pages de connexion et d'inscription, en une seule colonne :
 * un bandeau bleu en haut (icône, titre, sous-titre) et la carte du formulaire qui le chevauche.
 */
export function AuthShell({ title, subtitle, children, footer, icon, wide = false }: AuthShellProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/40">
      {/* Bandeau */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-indigo-600 px-4 pb-32 pt-12 text-white sm:pt-16">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border-[40px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full border-[40px] border-white/10" />
        <div className="pointer-events-none absolute right-[18%] top-12 h-5 w-5 rounded-full bg-amber-300" />
        <div className="pointer-events-none absolute left-[14%] top-24 h-3 w-3 rounded-full bg-white/60" />

        <div className="relative mx-auto max-w-xl text-center">
          {icon && (
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-lg shadow-black/10">
              {icon}
            </span>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base text-white/80 sm:text-lg">{subtitle}</p>
        </div>
      </div>

      {/* Carte du formulaire, qui chevauche le bandeau */}
      <div className="relative -mt-20 px-4 pb-16">
        <div
          className={cn(
            'mx-auto w-full rounded-3xl border bg-background p-6 shadow-xl shadow-slate-900/10 sm:p-10',
            wide ? 'max-w-xl' : 'max-w-md'
          )}
        >
          {children}

          {footer && <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {trust.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
