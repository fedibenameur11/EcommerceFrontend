import { useEffect, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import { tableClasses } from '@/components/admin/adminStyles';
import sellerService from '@/services/api/sellerService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice } from '@/lib/utils';
import { formatDateTime } from '@/utils/formatDate';
import { orderStatusLabel } from '@/utils/labels';
import type { SellerOrder } from '@/models/returns';

/** Commandes contenant les produits du vendeur, à préparer */
export const SellerOrdersPage = () => {
  const [orders, setOrders] = useState<SellerOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sellerService
      .getOrders()
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <PageHeader title="Commandes à préparer" />
      <ErrorAlert message={error} />
      <div className={tableClasses.wrapper}>
        <table className={tableClasses.table}>
          <thead>
            <tr>
              <th className={tableClasses.th}>Commande</th>
              <th className={tableClasses.th}>Date</th>
              <th className={tableClasses.th}>Client</th>
              <th className={tableClasses.th}>Articles</th>
              <th className={tableClasses.th}>Montant</th>
              <th className={tableClasses.th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders === null && !error ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td className={tableClasses.td} colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : orders && orders.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                    <PackageSearch className="h-10 w-10" />
                    <p className="font-medium text-foreground">Aucune commande pour le moment</p>
                    <p className="text-sm">Les commandes contenant vos produits apparaîtront ici.</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders?.map((o) => (
                <tr key={o.orderId}>
                  <td className={`${tableClasses.td} font-medium`}>{o.orderNumber}</td>
                  <td className={tableClasses.td}>{formatDateTime(o.orderDate)}</td>
                  <td className={tableClasses.td}>
                    <div>{o.customerName}</div>
                    <div className="max-w-[16rem] truncate text-xs text-muted-foreground" title={o.shippingAddress}>
                      {o.shippingAddress}
                    </div>
                  </td>
                  <td className={tableClasses.td}>{o.itemCount}</td>
                  <td className={tableClasses.td}>{formatPrice(o.total)}</td>
                  <td className={tableClasses.td}>
                    <Badge variant={o.status === 'Cancelled' ? 'destructive' : 'secondary'}>{orderStatusLabel(o.status)}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerOrdersPage;
