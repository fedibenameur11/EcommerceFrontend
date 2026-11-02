import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Undo2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ReturnStatusBadge, ReturnTimeline } from '@/components/returns/ReturnShared';
import returnService from '@/services/api/returnService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice } from '@/lib/utils';
import { formatDateTime } from '@/utils/formatDate';
import type { ReturnRequest } from '@/models/returns';

/** Suivi des demandes de retour du client */
export const MyReturnsPage = () => {
  const [returns, setReturns] = useState<ReturnRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    returnService
      .getMine()
      .then(setReturns)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Mes retours</h1>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {returns === null && !error && <p>Chargement...</p>}
      {returns && returns.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border py-14 text-center text-muted-foreground">
          <Undo2 className="h-10 w-10" />
          <p className="font-medium text-foreground">Aucune demande de retour</p>
          <p className="text-sm">
            Vous pouvez demander un retour depuis le détail d&apos;une commande livrée.{' '}
            <Link to="/orders" className="text-primary hover:underline">
              Mes commandes
            </Link>
          </p>
        </div>
      )}
      <div className="space-y-4">
        {returns?.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {r.productName} × {r.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Commande{' '}
                    <Link to={`/orders/${r.orderId}`} className="text-primary hover:underline">
                      {r.orderNumber}
                    </Link>{' '}
                    · demandé le {formatDateTime(r.createdAt)}
                  </p>
                </div>
                <ReturnStatusBadge status={r.status} />
              </div>
              <ReturnTimeline status={r.status} />
              <p className="text-sm">
                <span className="text-muted-foreground">Motif :</span> {r.reason}
                {r.details && <span className="text-muted-foreground"> — {r.details}</span>}
              </p>
              {r.adminNote && (
                <p className="rounded-md bg-muted p-3 text-sm">
                  <span className="font-medium">Message du support :</span> {r.adminNote}
                </p>
              )}
              {r.status === 'Refunded' && (
                <p className="text-sm font-semibold text-emerald-700">Montant remboursé : {formatPrice(r.refundAmount)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyReturnsPage;
