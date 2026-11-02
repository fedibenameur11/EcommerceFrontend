import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReturnStatusBadge } from '@/components/returns/ReturnShared';
import returnService from '@/services/api/returnService';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/models/order';
import type { ReturnOptions, ReturnRequest } from '@/models/returns';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * Retours d'une commande livrée : demandes déjà faites + formulaire pour en créer une.
 * Le serveur vérifie le délai et les quantités ; le formulaire n'est qu'une aide.
 */
export function ReturnSection({ order }: { order: Order }) {
  const [options, setOptions] = useState<ReturnOptions | null>(null);
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    returnService
      .getMine()
      .then((all) => setRequests(all.filter((r) => r.orderId === order.id)))
      .catch(() => undefined);

  useEffect(() => {
    returnService.getOptions().then(setOptions).catch(() => undefined);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const windowDays = options?.windowDays ?? 14;
  const deadline = order.deliveredDate ? new Date(order.deliveredDate).getTime() + windowDays * 86400000 : 0;
  const open = order.status === 'Delivered' && deadline > Date.now();
  const daysLeft = Math.max(Math.ceil((deadline - Date.now()) / 86400000), 0);

  // Quantité encore retournable par ligne (les demandes refusées ne comptent pas)
  const returnable = useMemo(
    () =>
      order.items
        .map((item) => {
          const used = requests
            .filter((r) => r.orderItemId === item.id && r.status !== 'Rejected')
            .reduce((sum, r) => sum + r.quantity, 0);
          return { item, left: item.quantity - used };
        })
        .filter((x) => x.left > 0),
    [order.items, requests]
  );

  if (order.status !== 'Delivered' && requests.length === 0) return null;

  const selected = returnable.find((x) => String(x.item.id) === itemId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return setError('Choisissez un article.');
    if (!reason) return setError('Choisissez un motif.');
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > selected.left) return setError(`Quantité entre 1 et ${selected.left}.`);
    setSaving(true);
    setError(null);
    try {
      await returnService.create({ orderItemId: selected.item.id, quantity: qty, reason, details });
      setShowForm(false);
      setItemId('');
      setQuantity('1');
      setReason('');
      setDetails('');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const productName = (r: ReturnRequest) => r.productName;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle>Retours et remboursements</CardTitle>
        {open && returnable.length > 0 && !showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Undo2 className="mr-2 h-4 w-4" />
            Demander un retour
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {order.status === 'Delivered' && (
          <p className="text-sm text-muted-foreground">
            {open
              ? `Vous pouvez demander un retour pendant encore ${daysLeft} jour(s) (${windowDays} jours après la livraison).`
              : `Le délai de retour de ${windowDays} jours est dépassé.`}
          </p>
        )}

        {showForm && (
          <form onSubmit={submit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Article</label>
              <select
                className={selectClass}
                value={itemId}
                onChange={(e) => {
                  setItemId(e.target.value);
                  setQuantity('1');
                }}
              >
                <option value="">— Choisir —</option>
                {returnable.map(({ item, left }) => (
                  <option key={item.id} value={item.id}>
                    {item.productName} ({left} retournable{left > 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Quantité</label>
              <input
                type="number"
                min={1}
                max={selected?.left ?? 1}
                className={selectClass}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Motif</label>
              <select className={selectClass} value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">— Choisir —</option>
                {options?.reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Détails (facultatif)</label>
              <textarea
                className={`${selectClass} h-24`}
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Décrivez le problème..."
              />
            </div>
            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Envoi...' : 'Envoyer la demande'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {requests.length > 0 && (
          <ul className="divide-y">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {productName(r)} × {r.quantity}
                  </p>
                  <p className="text-muted-foreground">{r.reason}</p>
                  {r.adminNote && <p className="text-muted-foreground">Message : {r.adminNote}</p>}
                  {r.status === 'Refunded' && (
                    <p className="font-medium text-emerald-700">Remboursé : {formatPrice(r.refundAmount)}</p>
                  )}
                </div>
                <ReturnStatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
        {requests.length > 0 && (
          <Link to="/returns" className="text-sm font-medium text-primary hover:underline">
            Voir tous mes retours →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
