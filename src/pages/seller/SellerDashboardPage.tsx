import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Banknote, Boxes, ClipboardList, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { selectClassName, tableClasses } from '@/components/admin/adminStyles';
import sellerService from '@/services/api/sellerService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice } from '@/lib/utils';
import type { Analytics } from '@/models/analytics';

const PERIODS = [7, 30, 90, 365] as const;

function Kpi({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: typeof Banknote }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

/** Tableau de bord vendeur : ventes, revenus par période, meilleurs produits et stock bas (ses produits uniquement) */
export const SellerDashboardPage = () => {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    sellerService
      .getAnalytics(days)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [days]);

  const maxSold = Math.max(...(data?.topProducts.map((t) => t.quantitySold) ?? [1]), 1);
  const averageBasket = data && data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau de bord"
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Revenus" value={formatPrice(data.totalRevenue)} hint="Commandes annulées exclues" icon={Banknote} />
            <Kpi label="Commandes" value={String(data.totalOrders)} hint={`Panier moyen : ${formatPrice(averageBasket)}`} icon={ClipboardList} />
            <Kpi label="Articles vendus" value={String(data.itemsSold ?? 0)} icon={ShoppingBag} />
            <Kpi
              label="Stock bas"
              value={String(data.lowStock.length)}
              hint={`Seuil : ${data.lowStockThreshold} unités`}
              icon={Boxes}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenus dans le temps (TND)</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart points={data.revenueOverTime} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mes produits les plus vendus</CardTitle>
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
                        <div className="h-2 rounded bg-primary" style={{ width: `${(t.quantitySold / maxSold) * 100}%` }} />
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
                <p className="text-sm text-muted-foreground">Tous vos produits ont un stock suffisant.</p>
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

export default SellerDashboardPage;
