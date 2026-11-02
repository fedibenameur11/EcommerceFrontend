import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import { selectClassName, tableClasses } from '@/components/admin/adminStyles';
import { RETURN_STATUS_LABELS, ReturnStatusBadge } from '@/components/returns/ReturnShared';
import returnService from '@/services/api/returnService';
import { useNotification } from '@/context/NotificationContext';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatPrice } from '@/lib/utils';
import { formatDateTime } from '@/utils/formatDate';
import type { ReturnRequest, ReturnStatus } from '@/models/returns';

/** Étapes possibles depuis chaque statut (flux : demande → acceptée → reçue → remboursée) */
const NEXT: Record<ReturnStatus, { status: ReturnStatus; label: string; destructive?: boolean }[]> = {
  Requested: [
    { status: 'Approved', label: 'Accepter' },
    { status: 'Rejected', label: 'Refuser', destructive: true },
  ],
  Approved: [{ status: 'Received', label: 'Article reçu' }],
  Received: [{ status: 'Refunded', label: 'Rembourser' }],
  Rejected: [],
  Refunded: [],
};

const FILTERS: (ReturnStatus | '')[] = ['', 'Requested', 'Approved', 'Received', 'Refunded', 'Rejected'];

export const AdminReturnsPage = () => {
  const { showNotification } = useNotification();
  const [returns, setReturns] = useState<ReturnRequest[] | null>(null);
  const [filter, setFilter] = useState<ReturnStatus | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    returnService
      .getAll(filter || undefined)
      .then((list) => {
        if (cancelled) return;
        setReturns(list);
        setError(null);
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [filter, reloadKey]);

  const apply = async (r: ReturnRequest, status: ReturnStatus) => {
    setBusyId(r.id);
    try {
      await returnService.updateStatus(r.id, status, notes[r.id] ?? '');
      showNotification(`Retour #${r.id} : ${RETURN_STATUS_LABELS[status].toLowerCase()}`, 'success');
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Retours et remboursements"
        action={
          <select
            className={`${selectClassName} w-auto`}
            value={filter}
            onChange={(e) => setFilter(e.target.value as ReturnStatus | '')}
            aria-label="Filtrer par statut"
          >
            {FILTERS.map((f) => (
              <option key={f} value={f}>
                {f ? RETURN_STATUS_LABELS[f] : 'Tous les statuts'}
              </option>
            ))}
          </select>
        }
      />
      <ErrorAlert message={error} />
      <div className={tableClasses.wrapper}>
        <table className={tableClasses.table}>
          <thead>
            <tr>
              <th className={tableClasses.th}>Demande</th>
              <th className={tableClasses.th}>Client</th>
              <th className={tableClasses.th}>Article</th>
              <th className={tableClasses.th}>Motif</th>
              <th className={tableClasses.th}>Statut</th>
              <th className={tableClasses.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {returns === null && !error ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td className={tableClasses.td} colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : returns && returns.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                    <Undo2 className="h-10 w-10" />
                    <p className="font-medium text-foreground">Aucune demande de retour</p>
                  </div>
                </td>
              </tr>
            ) : (
              returns?.map((r) => (
                <tr key={r.id}>
                  <td className={tableClasses.td}>
                    <div className="font-medium">#{r.id}</div>
                    <Link to={`/admin/orders/${r.orderId}`} className="text-xs text-primary hover:underline">
                      {r.orderNumber}
                    </Link>
                    <div className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</div>
                  </td>
                  <td className={tableClasses.td}>
                    <div>{r.customerName}</div>
                    <div className="text-xs text-muted-foreground">{r.customerEmail}</div>
                  </td>
                  <td className={tableClasses.td}>
                    {r.productName} × {r.quantity}
                  </td>
                  <td className={`${tableClasses.td} max-w-[16rem]`}>
                    <div>{r.reason}</div>
                    {r.details && <div className="text-xs text-muted-foreground">{r.details}</div>}
                    {r.adminNote && <div className="mt-1 text-xs italic">Note : {r.adminNote}</div>}
                  </td>
                  <td className={tableClasses.td}>
                    <ReturnStatusBadge status={r.status} />
                    {r.status === 'Refunded' && (
                      <div className="mt-1 text-xs font-medium text-emerald-700">{formatPrice(r.refundAmount)}</div>
                    )}
                  </td>
                  <td className={tableClasses.td}>
                    {NEXT[r.status].length > 0 ? (
                      <div className="space-y-2">
                        <input
                          className="h-8 w-44 rounded-md border bg-background px-2 text-xs"
                          placeholder="Message au client (facultatif)"
                          value={notes[r.id] ?? ''}
                          onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          {NEXT[r.status].map((step) => (
                            <Button
                              key={step.status}
                              size="sm"
                              variant={step.destructive ? 'destructive' : 'default'}
                              disabled={busyId === r.id}
                              onClick={() => apply(r, step.status)}
                            >
                              {step.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Terminé</span>
                    )}
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

export default AdminReturnsPage;
