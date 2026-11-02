import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Field } from '@/components/admin/AdminShared';
import uploadService, { type UploadFolder } from '@/services/api/uploadService';
import { getErrorMessage } from '@/utils/errorHandler';
import { cn } from '@/lib/utils';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface MultiImageUploadFieldProps {
  label: string;
  hint?: string;
  /** URLs des images actuelles, dans l'ordre d'affichage */
  value: string[];
  onChange: (urls: string[]) => void;
  /** Nombre maximal d'images */
  max?: number;
  /** Permet au formulaire de bloquer l'enregistrement pendant l'envoi */
  onUploadingChange?: (uploading: boolean) => void;
  folder?: UploadFolder;
}

/**
 * Galerie d'images pour les formulaires admin : sélection de plusieurs fichiers à la fois,
 * envoi un par un vers l'API, miniatures avec suppression et déplacement vers la gauche/droite.
 */
export function MultiImageUploadField({
  label,
  hint,
  value,
  onChange,
  max = 8,
  onUploadingChange,
  folder = 'products',
}: MultiImageUploadFieldProps) {
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = max - value.length - pending;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // permet de re-choisir les mêmes fichiers
    if (files.length === 0) return;

    const problems: string[] = [];
    const accepted = files.filter((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        problems.push(`« ${file.name} » : format non pris en charge`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        problems.push(`« ${file.name} » : dépasse 5 Mo`);
        return false;
      }
      return true;
    });
    if (accepted.length > remaining) {
      problems.push(`Maximum ${max} images : ${accepted.length - remaining} fichier(s) ignoré(s)`);
    }
    const toUpload = accepted.slice(0, Math.max(remaining, 0));

    setError(problems.length ? problems.join(' · ') : undefined);
    if (toUpload.length === 0) return;

    setPending(toUpload.length);
    onUploadingChange?.(true);
    const uploaded: string[] = [];
    try {
      for (const file of toUpload) {
        uploaded.push(await uploadService.uploadImage(file, folder));
        setPending((n) => n - 1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      // On garde les images déjà envoyées même si une autre a échoué
      if (uploaded.length) onChange([...value, ...uploaded]);
      setPending(0);
      onUploadingChange?.(false);
    }
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const move = (index: number, delta: -1 | 1) => {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Field label={label} error={error}>
      {hint && <p className="mb-2 text-xs text-muted-foreground">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={handleFiles}
      />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {value.map((url, index) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Retirer l'image ${index + 1}`}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive focus-visible:opacity-100 group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent px-1 pb-1 pt-4 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Déplacer vers la gauche"
                className="rounded bg-white/90 px-1.5 text-xs font-bold disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label="Déplacer vers la droite"
                className="rounded bg-white/90 px-1.5 text-xs font-bold disabled:opacity-30"
              >
                →
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: pending }).map((_, i) => (
          <div
            key={`pending-${i}`}
            className="flex aspect-square animate-pulse items-center justify-center rounded-lg border bg-muted"
          >
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending > 0}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs font-medium text-muted-foreground transition-colors',
              'hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <ImagePlus className="h-6 w-6" />
            Ajouter
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {value.length}/{max} images · JPG, PNG, GIF ou WebP · 5 Mo maximum chacune
      </p>
    </Field>
  );
}
