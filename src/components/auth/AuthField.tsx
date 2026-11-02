import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Icône affichée à gauche du champ */
  icon: ReactNode;
  /** Élément affiché à droite du libellé (ex. lien « Mot de passe oublié ? ») */
  labelAside?: ReactNode;
}

/**
 * Champ des formulaires d'authentification : libellé, icône, et bouton afficher/masquer
 * automatiquement ajouté aux champs de type password.
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, icon, labelAside, type = 'text', className, id, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="group relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
        <input
          ref={ref}
          id={id}
          type={isPassword && visible ? 'text' : type}
          className={cn(
            'h-12 w-full rounded-xl border bg-background pl-10 text-sm outline-none transition-all',
            'placeholder:text-muted-foreground/70 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10',
            'disabled:cursor-not-allowed disabled:opacity-60',
            isPassword ? 'pr-11' : 'pr-4',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
});
