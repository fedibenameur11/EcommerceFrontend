import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/admin/AdminShared';
import { selectClassName } from '@/components/admin/adminStyles';
import { OrderDetailView } from '@/components/orders/OrderDetailView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import orderService from '@/services/api/orderService';
import userService from '@/services/api/userService';
import { getErrorMessage } from '@/utils/errorHandler';
import { ORDER_STATUSES, orderStatusLabel } from '@/utils/labels';
import type { Order, OrderStatus } from '@/models/order';
import type { User } from '@/models/user';

export const AdminOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deliveryPeople, setDeliveryPeople] = useState<User[]>([]);
  const [selectedPerson, setSelectedPerson] = useState('');

  useEffect(() => {
    userService
      .getDeliveryPeople()
      .then(setDeliveryPeople)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    orderService
      .getOrderById(Number(id))
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        setSelectedPerson(data.deliveryPersonId ? String(data.deliveryPersonId) : '');
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

  const downloadInvoice = async () => {
    if (!order) return;
    try {
      await orderService.downloadInvoice(order.id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const assignDelivery = async () => {
    if (!order || !selectedPerson) return;
    setUpdating(true);
    try {
      await orderService.assignDelivery(order.id, Number(selectedPerson));
      setError(null);
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(order.id, status);
      // Recharger pour récupérer les dates d'expédition / de livraison
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <Link to="/admin/orders">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux commandes
        </Button>
      </Link>

      <ErrorAlert message={error} />

      {loading ? (
        <p>Chargement...</p>
      ) : order ? (
        <>
        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{order.status === 'Pending' ? 'Demande de commande' : 'Livreur'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === 'Pending' && (
                <p className="text-sm text-muted-foreground">
                  Acceptez la commande en l&apos;affectant à un livreur : il la verra dans son espace et son nom figurera sur le bon
                  de livraison et la facture.
                </p>
              )}
              {deliveryPeople.length === 0 ? (
                <p className="text-sm">
                  Aucun livreur disponible.{' '}
                  <Link to="/admin/users" className="font-medium text-primary hover:underline">
                    Créer un compte livreur
                  </Link>
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    aria-label="Livreur"
                    className={`${selectClassName} h-10 w-64`}
                    value={selectedPerson}
                    disabled={updating || order.status === 'Shipped'}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                  >
                    <option value="">— Choisir un livreur —</option>
                    {deliveryPeople.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={assignDelivery}
                    disabled={
                      updating ||
                      !selectedPerson ||
                      (String(order.deliveryPersonId ?? '') === selectedPerson && order.deliveryAssignment !== 'Refused')
                    }
                  >
                    {order.status === 'Pending' ? 'Accepter et affecter' : order.deliveryPersonId ? 'Changer de livreur' : 'Affecter'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <OrderDetailView
          order={order}
          showCustomer
          actions={
            <>
              <Button variant="outline" size="sm" onClick={downloadInvoice} disabled={order.status === 'Cancelled'}>
                <FileDown className="mr-2 h-4 w-4" />
                Facture
              </Button>
              <select
              aria-label="Statut de la commande"
              className={`${selectClassName} h-9 w-40`}
              value={order.status}
              disabled={updating}
              onChange={(e) => changeStatus(e.target.value as OrderStatus)}
            >
              {ORDER_STATUSES.map((s) => (
                <option
                  key={s}
                  value={s}
                  disabled={order.deliveryAssignment !== 'Accepted' && (s === 'Shipped' || s === 'Delivered')}
                  title={
                    order.deliveryAssignment !== 'Accepted' && (s === 'Shipped' || s === 'Delivered')
                      ? "Affectez un livreur et attendez qu'il accepte"
                      : undefined
                  }
                >
                  {orderStatusLabel(s)}
                </option>
              ))}
              </select>
            </>
          }
        />
        </>
      ) : null}
    </div>
  );
};

export default AdminOrderDetailPage;
