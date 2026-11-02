/**
 * Order Detail Page (client)
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderDetailView } from '@/components/orders/OrderDetailView';
import { ReturnSection } from '@/components/returns/ReturnSection';
import orderService from '@/services/api/orderService';
import { getErrorMessage } from '@/utils/errorHandler';
import type { Order } from '@/models/order';

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    orderService
      .getOrderById(Number(id))
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
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
  }, [id, reloadKey]);

  const handleInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      await orderService.downloadInvoice(order.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !window.confirm('Annuler cette commande ?')) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.id);
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/orders">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Mes commandes
        </Button>
      </Link>

      {error && (
        <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : order ? (
        <div className="space-y-6">
          <OrderDetailView
            order={order}
            actions={
              <>
                {order.status !== 'Cancelled' && (
                  <Button variant="outline" size="sm" disabled={downloading} onClick={handleInvoice}>
                    <FileDown className="mr-2 h-4 w-4" />
                    {downloading ? 'Génération...' : 'Facture PDF'}
                  </Button>
                )}
                {order.status === 'Pending' && (
                  <Button variant="outline" size="sm" disabled={cancelling} onClick={handleCancel}>
                    {cancelling ? 'Annulation...' : 'Annuler la commande'}
                  </Button>
                )}
              </>
            }
          />
          <ReturnSection order={order} />
        </div>
      ) : null}
    </div>
  );
};

export default OrderDetailPage;
