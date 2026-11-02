import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { selectClassName, tableClasses } from '@/components/admin/adminStyles';
import analyticsService from '@/services/api/analyticsService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice } from '@/lib/utils';
import type { Analytics } from '@/models/analytics';

const PERIODS = [7, 30, 90, 365] as const;

export const AdminAnalyticsPage = () => {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    analyticsService
      .getAnalytics(days)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const maxSold = Math.max(...(data?.topProducts.map((t) => t.quantitySold) ?? [1]), 1);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Statistiques"
        action={
          <select
            className={`${selectClassName} w-auto`}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Période"
          >
            {PERIODS.map((d) => (
              <option key={d} value={d}>
                {d} derniers jours
              </option>
            ))}
          </select>
        }
      />
      <ErrorAlert message={error} />
      {!data && !error && <p>Chargement...</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Chiffre d&apos;affaires</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatPrice(data.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Commandes annulées exclues</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data.totalOrders}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chiffre d&apos;affaires dans le temps (TND)</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart points={data.revenueOverTime} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produits les plus vendus</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune vente sur cette période.</p>
              ) : (
                <ol className="space-y-3">
                  {data.topProducts.map((t, i) => (
                    <li key={t.productId} className="space-y-1">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <Link to={`/product/${t.productId}`} className="truncate font-medium hover:text-primary">
                          {i + 1}. {t.name}
                        </Link>
                        <span className="shrink-0 text-muted-foreground">
                          {t.quantitySold} vendus · {formatPrice(t.revenue)}
                        </span>
                      </div>
                      <div className="h-2 rounded bg-muted">
                        <div
                          className="h-2 rounded bg-primary"
                          style={{ width: `${(t.quantitySold / maxSold) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertes de stock bas (≤ {data.lowStockThreshold})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun produit en stock bas.</p>
              ) : (
                <div className={tableClasses.wrapper}>
                  <table className={tableClasses.table}>
                    <thead>
                      <tr>
                        <th className={tableClasses.th}>Produit</th>
                        <th className={tableClasses.th}>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStock.map((p) => (
                        <tr key={p.productId}>
                          <td className={tableClasses.td}>{p.name}</td>
                          <td className={tableClasses.td}>
                            <Badge variant={p.stockQuantity === 0 ? 'destructive' : 'secondary'}>
                              {p.stockQuantity === 0 ? 'Rupture' : p.stockQuantity}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;