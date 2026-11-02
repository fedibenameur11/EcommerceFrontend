import { useEffect, useState } from 'react';
import { Check, MapPin, PackageSearch, Phone, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import deliveryService from '@/services/api/deliveryService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice } from '@/lib/utils';
import { formatDateTime } from '@/utils/formatDate';
import { orderStatusLabel } from '@/utils/labels';
import { sizeNoun } from '@/utils/productOptions';
import type { Order } from '@/models/order';

/** Commandes affectées au livreur : prise en charge et livraison */
export const DeliveryOrdersPage = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () =>
    deliveryService
      .getOrders()
      .then((list) => {
        setOrders(list);
        setError(null);
      })
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    void load();
  }, []);

  const run = async (orderId: number, action: () => Promise<void>) => {
    setBusyId(orderId);
    try {
      await action();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const toAccept = orders?.filter((o) => o.deliveryAssignment === 'Pending' && o.status !== 'Delivered') ?? [];
  const toDeliver =
    orders?.filter(
      (o) => o.deliveryAssignment !== 'Pending' && (o.status === 'Processing' || o.status === 'Shipped')
    ) ?? [];
  const done = orders?.filter((o) => o.status === 'Delivered') ?? [];

  const refuse = (o: Order) => {
    if (window.confirm(`Refuser la livraison ${o.orderNumber} ? L'administrateur devra l'affecter à un autre livreur.`)) {
      void run(o.id, () => deliveryService.respond(o.id, false));
    }
  };

  const renderOrder = (o: Order) => (
    <Card key={o.id}>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold">Commande {o.orderNumber}</p>
            <p className="text-xs text-muted-foreground">Passée le {formatDateTime(o.orderDate)}</p>
          </div>
          <Badge variant={o.status === 'Delivered' ? 'default' : 'secondary'}>
            {o.deliveryAssignment === 'Pending' ? 'À accepter' : orderStatusLabel(o.status)}
          </Badge>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium">{o.customerName}</p>
            {o.customerPhone && o.customerPhone !== '-' && (
              <a href={`tel:${o.customerPhone}`} className="mt-1 flex items-center gap-2 text-primary hover:underline">
                <Phone className="h-4 w-4" />
                {o.customerPhone}
              </a>
            )}
          </div>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{o.shippingAddress}</span>
          </p>
        </div>

        <ul className="divide-y rounded-lg border text-sm">
          {o.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="min-w-0 truncate">
                {item.productName}
                {item.size && (
                  <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                    {sizeNoun(item.size)} {item.size}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-muted-foreground">× {item.quantity}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            {o.status === 'Delivered' ? 'Total encaissé : ' : 'À encaisser (espèces) : '}
            <span className="text-lg font-bold">{formatPrice(o.total)}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {o.deliveryAssignment === 'Pending' && (
              <>
                <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => refuse(o)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Refuser
                </Button>
                <Button size="sm" disabled={busyId === o.id} onClick={() => run(o.id, () => deliveryService.respond(o.id, true))}>
                  <Check className="mr-2 h-4 w-4" />
                  Accepter
                </Button>
              </>
            )}
            {o.deliveryAssignment !== 'Pending' && o.status === 'Processing' && (
              <Button size="sm" disabled={busyId === o.id} onClick={() => run(o.id, () => deliveryService.updateStatus(o.id, 'Shipped'))}>
                <Truck className="mr-2 h-4 w-4" />
                Prendre en charge
              </Button>
            )}
            {o.deliveryAssignment !== 'Pending' && o.status === 'Shipped' && (
              <Button size="sm" disabled={busyId === o.id} onClick={() => run(o.id, () => deliveryService.updateStatus(o.id, 'Delivered'))}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marquer comme livrée
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Mes livraisons" />
      <ErrorAlert message={error} />

      {orders === null && !error ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : orders && orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <PackageSearch className="h-10 w-10" />
          <p className="font-medium text-foreground">Aucune livraison pour le moment</p>
          <p className="text-sm">Les commandes que l&apos;administrateur vous affecte apparaîtront ici.</p>
        </div>
      ) : (
        <>
          {toAccept.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Nouvelles affectations à accepter ({toAccept.length})</h2>
              {toAccept.map(renderOrder)}
            </section>
          )}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">À livrer ({toDeliver.length})</h2>
            {toDeliver.length === 0 ? (
              <p className="text-sm text-muted-foreground">Rien à livrer pour le moment.</p>
            ) : (
              toDeliver.map(renderOrder)
            )}
          </section>
          {done.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Livrées ({done.length})</h2>
              {done.map(renderOrder)}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryOrdersPage;
