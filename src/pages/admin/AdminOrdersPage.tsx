import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminPagination, ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import { selectClassName, tableClasses } from '@/components/admin/adminStyles';
import orderService from '@/services/api/orderService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDateTime } from '@/utils/formatDate';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUSES, orderStatusLabel } from '@/utils/labels';
import type { Order, OrderStatus } from '@/models/order';

const PAGE_SIZE = 10;

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    orderService.getAllOrders(page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setOrders(res.items);
        setTotalPages(res.totalPages);
        setTotalCount(res.totalCount);
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
  }, [page]);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      await orderService.updateOrderStatus(order.id, status);
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Commandes" />
      <ErrorAlert message={error} />

      <div className={tableClasses.wrapper}>
        <table className={tableClasses.table}>
          <thead>
            <tr>
              <th className={tableClasses.th}>N°</th>
              <th className={tableClasses.th}>Client</th>
              <th className={tableClasses.th}>Date</th>
              <th className={tableClasses.th}>Total</th>
              <th className={tableClasses.th}>Livreur</th>
              <th className={tableClasses.th}>Statut</th>
              <th className={tableClasses.th}></th>
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={7}>
                  Chargement...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={7}>
                  Aucune commande.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className={tableClasses.td}>{o.orderNumber}</td>
                  <td className={tableClasses.td}>
                    <div className="font-medium">{o.customerName || `Utilisateur #${o.userId}`}</div>
                    {o.customerEmail && <div className="text-xs text-muted-foreground">{o.customerEmail}</div>}
                  </td>
                  <td className={tableClasses.td}>{formatDateTime(o.orderDate)}</td>
                  <td className={tableClasses.td}>
                    {formatPrice(o.total)}
                  </td>
                  <td className={tableClasses.td}>
                    {o.deliveryPersonName ?? <span className="text-muted-foreground">Non affecté</span>}
                  </td>
                  <td className={tableClasses.td}>
                    <select
                      aria-label={`Statut de la commande ${o.orderNumber}`}
                      className={`${selectClassName} h-9 w-36`}
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option
                          key={s}
                          value={s}
                          disabled={!o.deliveryPersonId && (s === 'Shipped' || s === 'Delivered')}
                        >
                          {orderStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={`${tableClasses.td} text-right`}>
                    <Link to={`/admin/orders/${o.id}`}>
                      <Button size="sm" variant="outline">
                        Voir le détail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={setPage} />
    </div>
  );
};

export default AdminOrdersPage;
