import { Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPagination, ErrorAlert, PageHeader } from '@/components/admin/AdminShared';
import { selectClassName, tableClasses } from '@/components/admin/adminStyles';
import auditService, { type AuditLog, type AuditLogPage } from '@/services/api/auditService';
import { getErrorMessage } from '@/utils/errorHandler';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

const ACTIONS = [
  { value: 'Create', label: 'Création', badge: 'bg-emerald-100 text-emerald-700' },
  { value: 'Update', label: 'Modification', badge: 'bg-sky-100 text-sky-700' },
  { value: 'Delete', label: 'Suppression', badge: 'bg-red-100 text-red-700' },
];

const ENTITY_LABELS: Record<string, string> = {
  Product: 'Produit',
  Category: 'Catégorie',
  Order: 'Commande',
  Coupon: 'Coupon',
  User: 'Utilisateur',
  Review: 'Avis',
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/** Lit le JSON des changements : { champ: { old, new } } pour une modification, { champ: valeur } sinon. */
function parseChanges(raw: string): { field: string; before?: unknown; after?: unknown; single?: unknown }[] {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(data).map(([field, value]) => {
      if (value && typeof value === 'object' && 'old' in value && 'new' in value) {
        const change = value as { old: unknown; new: unknown };
        return { field, before: change.old, after: change.new };
      }
      return { field, single: value };
    });
  } catch {
    return [];
  }
}

function ChangeDetails({ log }: { log: AuditLog }) {
  const changes = parseChanges(log.changes);
  if (changes.length === 0) return <p className="text-sm text-muted-foreground">Aucun détail enregistré.</p>;
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      {changes.map(({ field, before, after, single }) => (
        <div key={field} className="min-w-0 rounded-lg border bg-background p-3">
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field}</dt>
          <dd className="break-words">
            {single !== undefined ? (
              <span>{formatValue(single)}</span>
            ) : (
              <span className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through">{formatValue(before)}</span>
                <span aria-hidden>→</span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
                  {formatValue(after)}
                </span>
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export const AdminAuditPage = () => {
  const [data, setData] = useState<AuditLogPage | null>(null);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [user, setUser] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    auditService
      .getLogs({
        page,
        pageSize: PAGE_SIZE,
        entity: entity || undefined,
        action: action || undefined,
        user: userQuery || undefined,
        from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      })
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, entity, action, userQuery, from, to]);

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
    setExpanded(null);
    setLoading(true);
  };

  const actionMeta = (value: string) =>
    ACTIONS.find((a) => a.value === value) ?? { label: value, badge: 'bg-muted text-foreground' };

  return (
    <div>
      <PageHeader title="Journal d'audit" />
      <p className="-mt-4 mb-6 text-sm text-muted-foreground">
        Qui a modifié quoi, et quand. Les mots de passe ne sont jamais enregistrés dans le journal.
      </p>
      <ErrorAlert message={error} />

      <form
        className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          changeFilter(setUserQuery)(user.trim());
        }}
      >
        <select className={selectClassName} value={entity} onChange={(e) => changeFilter(setEntity)(e.target.value)}>
          <option value="">Toutes les entités</option>
          {(data?.entities ?? []).map((name) => (
            <option key={name} value={name}>
              {ENTITY_LABELS[name] ?? name}
            </option>
          ))}
        </select>
        <select className={selectClassName} value={action} onChange={(e) => changeFilter(setAction)(e.target.value)}>
          <option value="">Toutes les actions</option>
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <Input
          placeholder="Utilisateur (e-mail)…"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          aria-label="Filtrer par utilisateur"
        />
        <Input type="date" value={from} onChange={(e) => changeFilter(setFrom)(e.target.value)} aria-label="Du" />
        <Input type="date" value={to} onChange={(e) => changeFilter(setTo)(e.target.value)} aria-label="Au" />
      </form>

      <div className={tableClasses.wrapper}>
        <table className={tableClasses.table}>
          <thead>
            <tr>
              <th className={tableClasses.th} />
              <th className={tableClasses.th}>Date</th>
              <th className={tableClasses.th}>Utilisateur</th>
              <th className={tableClasses.th}>Action</th>
              <th className={tableClasses.th}>Élément</th>
              <th className={tableClasses.th}>Adresse IP</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td className={tableClasses.td} colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                    <ScrollText className="h-10 w-10" />
                    <p className="font-medium text-foreground">Aucune entrée dans le journal</p>
                    <p className="text-sm">Les modifications apparaîtront ici dès qu&apos;elles auront lieu.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.items.map((log) => {
                const meta = actionMeta(log.action);
                const open = expanded === log.id;
                return (
                  <Fragment key={log.id}>
                    <tr
                      className={cn('cursor-pointer transition-colors hover:bg-muted/50', open && 'bg-muted/50')}
                      onClick={() => setExpanded(open ? null : log.id)}
                    >
                      <td className={cn(tableClasses.td, 'w-8')}>
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className={cn(tableClasses.td, 'whitespace-nowrap')}>
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className={tableClasses.td}>{log.userEmail || '—'}</td>
                      <td className={tableClasses.td}>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', meta.badge)}>
                          {meta.label}
                        </span>
                      </td>
                      <td className={tableClasses.td}>
                        {ENTITY_LABELS[log.entityName] ?? log.entityName}{' '}
                        <span className="text-muted-foreground">#{log.entityId}</span>
                      </td>
                      <td className={cn(tableClasses.td, 'text-muted-foreground')}>{log.ipAddress || '—'}</td>
                    </tr>
                    {open && (
                      <tr>
                        <td className={cn(tableClasses.td, 'bg-muted/30')} colSpan={6}>
                          <ChangeDetails log={log} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <AdminPagination
          page={page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          onPageChange={(p) => {
            setPage(p);
            setExpanded(null);
          }}
        />
      )}
      {data && data.totalPages > 1 && (
        <p className="mt-2 text-right text-xs text-muted-foreground">
          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setPage(1)}>
            Retour aux entrées les plus récentes
          </Button>
        </p>
      )}
    </div>
  );
};

export default AdminAuditPage;
