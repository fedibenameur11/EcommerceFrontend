import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  /** Image de couverture suivie des images supplémentaires */
  images: string[];
  alt: string;
  className?: string;
}

const ZOOM = 2.2;

/**
 * Galerie de la page produit : image principale avec zoom au survol (la loupe suit la souris),
 * miniatures cliquables, flèches et navigation clavier, et affichage plein écran.
 */
export function ProductGallery({ images, alt, className }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const thumbsRef = useRef<HTMLDivElement>(null);

  const gallery = images.filter((url) => url && !failed.has(url));
  const count = gallery.length;
  // Si la liste change (autre produit, image cassée), on reste dans les bornes
  const current = Math.min(index, Math.max(count - 1, 0));
  const currentUrl = gallery[current];

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setIndex((i) => (Math.min(i, count - 1) + delta + count) % count);
      setZoomOrigin(null);
    },
    [count]
  );

  // Navigation clavier : uniquement en plein écran (flèches, Échap)
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox, go]);

  // Garde la miniature active visible dans la bande défilante
  useEffect(() => {
    const active = thumbsRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [current]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const markFailed = (url: string) => setFailed((prev) => new Set(prev).add(url));

  if (count === 0) {
    return (
      <div
        className={cn(
          'flex aspect-square items-center justify-center rounded-3xl border bg-muted/40 text-muted-foreground',
          className
        )}
      >
        <div className="text-center">
          <ImageOff className="mx-auto mb-2 h-12 w-12" />
          <p className="text-sm">Aucune image disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Image principale */}
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border bg-white shadow-sm"
        onMouseMove={handleMove}
        onMouseLeave={() => setZoomOrigin(null)}
        onClick={() => setLightbox(true)}
      >
        <img
          key={currentUrl}
          src={currentUrl}
          alt={alt}
          data-product-image
          onError={() => markFailed(currentUrl)}
          draggable={false}
          className="h-full w-full animate-fade-in object-contain p-6 transition-transform duration-200 ease-out will-change-transform"
          style={
            zoomOrigin
              ? { transform: `scale(${ZOOM})`, transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }
              : undefined
          }
        />

        <span
          className={cn(
            'pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow backdrop-blur transition-opacity',
            zoomOrigin ? 'opacity-0' : 'opacity-100'
          )}
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Survolez pour zoomer
        </span>

        <button
          type="button"
          aria-label="Afficher en plein écran"
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(true);
          }}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow backdrop-blur transition-transform hover:scale-110"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {count > 1 && (
          <>
            <ArrowButton side="left" onClick={() => go(-1)} />
            <ArrowButton side="right" onClick={() => go(1)} />
            <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {current + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Miniatures */}
      {count > 1 && (
        <div
          ref={thumbsRef}
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]"
          role="tablist"
          aria-label="Images du produit"
        >
          {gallery.map((url, i) => (
            <button
              key={url}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-current={i === current}
              aria-label={`Image ${i + 1}`}
              onClick={() => {
                setIndex(i);
                setZoomOrigin(null);
              }}
              className={cn(
                'h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition-all duration-200',
                i === current
                  ? 'border-primary shadow-md shadow-primary/20'
                  : 'border-transparent opacity-70 ring-1 ring-border hover:opacity-100'
              )}
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                onError={() => markFailed(url)}
                className="h-full w-full rounded-lg object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Plein écran */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {count > 1 && (
            <>
              <ArrowButton side="left" large onClick={() => go(-1)} />
              <ArrowButton side="right" large onClick={() => go(1)} />
            </>
          )}
          <img
            key={currentUrl}
            src={currentUrl}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full animate-fade-in rounded-2xl bg-white object-contain p-4 shadow-2xl"
          />
          {count > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
              {current + 1} / {count}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  side,
  onClick,
  large,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  large?: boolean;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === 'left' ? 'Image précédente' : 'Image suivante'}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full shadow-lg backdrop-blur transition-all hover:scale-110',
        large
          ? 'h-12 w-12 bg-white/10 text-white hover:bg-white/25'
          : 'h-10 w-10 bg-background/90 opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
        side === 'left' ? 'left-4' : 'right-4'
      )}
    >
      <Icon className={large ? 'h-6 w-6' : 'h-5 w-5'} />
    </button>
  );
}
