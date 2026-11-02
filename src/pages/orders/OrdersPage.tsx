/**
 * Orders Page
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { formatDateTime } from '@/utils/formatDate';
import { orderStatusLabel } from '@/utils/labels';

export const OrdersPage = () => {
  const { orders, loading, error, fetchUserOrders, cancelOrder } = useOrders();

  useEffect(() => {
    fetchUserOrders().catch(() => {
      // L'erreur est exposée par le hook (error)
    });
  }, [fetchUserOrders]);

  const handleCancel = (id: number) => {
    if (window.confirm('Annuler cette commande ?')) {
      cancelOrder(id).catch(() => {});
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Mes commandes</h1>
      {error && (
        <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="space-y-4" aria-busy="true" aria-label="Chargement des commandes">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border p-6">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-9 w-32" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          variant="orders"
          title="Aucune commande pour le moment"
          description="Dès que vous passerez commande, vous pourrez la suivre ici."
        >
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/#produits">Découvrir la boutique</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const total = order.total ?? order.items.reduce((sum, item) => sum + item.totalPrice, 0);
            // Le backend n'autorise l'annulation que tant que la commande est en attente
            const cancellable = order.status === 'Pending';
            return (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    <Link to={`/orders/${order.id}`} className="hover:text-primary">
                      Commande {order.orderNumber}
                    </Link>
                  </CardTitle>
                  <Badge variant={order.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                    {orderStatusLabel(order.status)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Date : {formatDateTime(order.orderDate)}</p>
                  <p>Adresse : {order.shippingAddress}</p>
                  <p>Articles : {order.items.reduce((n, i) => n + i.quantity, 0)}</p>
                  {order.couponCode && order.discountAmount > 0 && (
                    <p className="text-emerald-600">
                      Code {order.couponCode} : -{formatPrice(order.discountAmount)}
                    </p>
                  )}
                  <p className="font-semibold">Total : {formatPrice(total)}</p>
                  <div className="flex gap-2 pt-2">
                    <Link to={`/orders/${order.id}`}>
                      <Button size="sm">Voir le détail</Button>
                    </Link>
                    {cancellable && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => handleCancel(order.id)}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
