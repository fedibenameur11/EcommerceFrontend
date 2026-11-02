import { useEffect, useState } from 'react';
import { Banknote, CheckCircle2, Clock, Hourglass, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { selectClassName } from '@/components/admin/adminStyles';
import deliveryService from '@/services/api/deliveryService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice } from '@/lib/utils';
import type { DeliveryStats } from '@/models/delivery';

const PERIODS = [
  { days: 7, label: '7 derniers jours' },
  { days: 30, label: '30 derniers jours (mois)' },
] as const;

/** Statistiques du livreur : livraisons effectuées et gains sur 7 ou 30 jours */
export const DeliveryStatsPage = () => {
  const [days, setDays] = useState<number>(7);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    deliveryService
      .getStats(days)
      .then((res) => {
        if (cancelled) return;
        setStats(res);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const cards = stats
    ? [
        { icon: CheckCircle2, label: 'Livraisons effectuées', value: String(stats.deliveredCount) },
        { icon: Wallet, label: 'Mes gains', value: formatPrice(stats.earnings, stats.currency), hint: 'Frais de livraison des commandes livrées' },
        { icon: Banknote, label: 'Espèces encaissées', value: formatPrice(stats.cashCollected, stats.currency), hint: 'À reverser à la boutique' },
        { icon: Hourglass, label: 'À accepter', value: String(stats.pendingAssignments) },
        { icon: Clock, label: 'En cours', value: String(stats.inProgress) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes statistiques"
        action={
          <select
            className={`${selectClassName} w-auto`}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Période"
          >
            {PERIODS.map((p) => (
              <option key={p.days} value={p.days}>
                {p.label}
              </option>
            ))}
          </select>
        }
      />
      <ErrorAlert message={error} />

      {!stats && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ icon: Icon, label, value, hint }) => (
              <Card key={label}>
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gains par jour</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.deliveredCount === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune livraison terminée sur cette période.</p>
              ) : (
                <RevenueChart
                  points={stats.daily.map((d) => ({ date: d.date, revenue: d.earnings, orders: d.deliveries }))}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DeliveryStatsPage;
