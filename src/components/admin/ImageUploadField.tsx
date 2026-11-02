import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/admin/AdminShared';
import uploadService, { type UploadFolder } from '@/services/api/uploadService';
import { getErrorMessage } from '@/utils/errorHandler';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface ImageUploadFieldProps {
  label: string;
  /** URL actuelle de l'image (vide si aucune) */
  value: string;
  onChange: (url: string) => void;
  /** Permet au formulaire de bloquer l'enregistrement pendant l'envoi */
  onUploadingChange?: (uploading: boolean) => void;
  folder?: UploadFolder;
  alt?: string;
}

/**
 * Champ d'image pour les formulaires admin : choix d'un fichier local, aperçu, envoi vers l'API
 * (POST /uploads/images) puis remontée de l'URL publique via onChange.
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  onUploadingChange,
  folder = 'products',
  alt = 'Aperçu',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Libère l'aperçu local (blob) quand il change ou quand le champ est démonté
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const updateUploading = (value: boolean) => {
    setUploading(value);
    onUploadingChange?.(value);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = ''; // permet de re-choisir le même fichier
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Format non pris en charge (JPG, PNG, GIF ou WebP).');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setError(undefined);
    setPreview(URL.createObjectURL(file));
    updateUploading(true);
    try {
      onChange(await uploadService.uploadImage(file, folder));
      setPreview(null);
    } catch (err) {
      setPreview(null);
      setError(getErrorMessage(err));
    } finally {
      updateUploading(false);
    }
  };

  const shown = preview ?? value;

  return (
    <Field label={label} error={error}>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {shown ? (
            <img src={shown} alt={alt} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={handleChange}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'Envoi en cours...' : value ? "Changer l'image" : 'Choisir une image'}
            </Button>
            {value && !uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setError(undefined);
                  onChange('');
                }}
              >
                Retirer
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG, GIF ou WebP - 5 Mo maximum.</p>
        </div>
      </div>
    </Field>
  );
}
