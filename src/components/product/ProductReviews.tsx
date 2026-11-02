import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/product/StarRating';
import { useAppSelector } from '@/store/hooks';
import reviewService from '@/services/api/reviewService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDateTime } from '@/utils/formatDate';
import type { Review } from '@/models/review';

interface ProductReviewsProps {
  productId: number;
  /** Appelé après un nouvel avis pour rafraîchir la note moyenne affichée */
  onChanged?: () => void;
}

/**
 * Liste des avis d'un produit + formulaire de notation (1 à 5 étoiles) pour les clients connectés
 */
export function ProductReviews({ productId, onChanged }: ProductReviewsProps) {
  const user = useAppSelector((state) => state.auth.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Brouillon saisi par l'utilisateur ; null = on affiche son avis existant
  const [draftRating, setDraftRating] = useState<number | null>(null);
  const [draftComment, setDraftComment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    reviewService
      .getProductReviews(productId)
      .then((res) => {
        if (cancelled) return;
        setReviews(res);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, reloadKey]);

  const mine = user ? reviews.find((r) => r.userId === user.id) : undefined;
  const rating = draftRating ?? mine?.rating ?? 0;
  const comment = draftComment ?? mine?.comment ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Choisissez une note de 1 à 5 étoiles.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await reviewService.saveReview(productId, { rating, comment: comment.trim() });
      setDraftRating(null);
      setDraftComment(null);
      setReloadKey((k) => k + 1);
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  const canReview = user && (user.role === 'Customer' || user.role === 'Seller' || user.role === 'Admin');

  return (
    <section className="mt-12 space-y-6">
      <h2 className="text-2xl font-bold">Avis des clients ({reviews.length})</h2>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {canReview ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{mine ? 'Modifier mon avis' : 'Donner mon avis'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <StarRating value={rating} onChange={setDraftRating} size="lg" />
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Votre commentaire (facultatif)"
                maxLength={1000}
                value={comment}
                onChange={(e) => setDraftComment(e.target.value)}
              />
              <Button type="submit" disabled={saving}>
                {saving ? 'Envoi...' : mine ? 'Mettre à jour' : 'Publier mon avis'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : !user ? (
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="text-primary underline">
            Connectez-vous
          </Link>{' '}
          pour noter ce produit.
        </p>
      ) : null}

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">Aucun avis pour le moment.</p>
      ) : (
        <ul className="divide-y">
          {reviews.map((r) => (
            <li key={r.id} className="space-y-1 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <StarRating value={r.rating} size="sm" />
                <span className="text-sm font-medium">{r.userName || 'Client'}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</span>
              </div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ProductReviews;