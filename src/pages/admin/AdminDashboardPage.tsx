import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import { tableClasses } from '@/components/admin/adminStyles';
import productService from '@/services/api/productService';
import categoryService from '@/services/api/categoryService';
import orderService from '@/services/api/orderService';
import userService from '@/services/api/userService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDateTime } from '@/utils/formatDate';
import { formatPrice } from '@/lib/utils';
import { orderStatusLabel } from '@/utils/labels';
import type { Order } from '@/models/order';

interface Stats {
  products: number;
  categories: number;
  orders: number;
  users: number;
}

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      productService.getAllProducts(1, 1),
      categoryService.getAllCategories(),
      orderService.getAllOrders(1, 5),
      userService.getAllUsers(1, 1),
    ])
      .then(([products, categories, orders, users]) => {
        setStats({
          products: products.totalCount,
          categories: categories.length,
          orders: orders.totalCount,
          users: users.totalCount,
        });
        setRecentOrders(orders.items);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const cards = stats
    ? [
        { label: 'Produits', value: stats.products, to: '/admin/products' },
        { label: 'Catégories', value: stats.categories, to: '/admin/categories' },
        { label: 'Commandes', value: stats.orders, to: '/admin/orders' },
        { label: 'Utilisateurs', value: stats.users, to: '/admin/users' },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Tableau de bord" />
      <ErrorAlert message={error} />
      {!stats && !error && <p>Chargement...</p>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <>
          <h2 className="mb-3 text-xl font-semibold">Dernières commandes</h2>
          <div className={tableClasses.wrapper}>
            <table className={tableClasses.table}>
              <thead>
                <tr>
                  <th className={tableClasses.th}>N°</th>
                  <th className={tableClasses.th}>Client</th>
                  <th className={tableClasses.th}>Date</th>
                  <th className={tableClasses.th}>Statut</th>
                  <th className={tableClasses.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className={tableClasses.td}>
                      <Link to={`/admin/orders/${o.id}`} className="text-primary hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className={tableClasses.td}>{o.customerName || `Utilisateur #${o.userId}`}</td>
                    <td className={tableClasses.td}>{formatDateTime(o.orderDate)}</td>
                    <td className={tableClasses.td}>
                      <Badge variant="secondary">{orderStatusLabel(o.status)}</Badge>
                    </td>
                    <td className={tableClasses.td}>
                      {formatPrice(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
