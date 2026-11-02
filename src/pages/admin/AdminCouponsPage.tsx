import { useEffect, useState } from 'react';
import { Dices, TicketPercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorAlert, Field, PageHeader } from '@/components/admin/AdminShared';
import { selectClassName, tableClasses } from '@/components/admin/adminStyles';
import couponService from '@/services/api/couponService';
import categoryService from '@/services/api/categoryService';
import { useNotification } from '@/context/NotificationContext';
import { getErrorMessage } from '@/utils/errorHandler';
import { cn, formatPrice } from '@/lib/utils';
import type { Coupon, CouponType, SaveCoupon } from '@/models/coupon';
import type { Category } from '@/models/category';

type FormState = {
  code: string;
  type: CouponType;
  value: string;
  minOrderAmount: string;
  maxUses: string;
  /** Catégorie ciblée ('' = tout le catalogue) */
  categoryId: string;
  /** Date au format AAAA-MM-JJ (vide = sans expiration) */
  expiresAt: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  code: '',
  type: 'Percentage',
  value: '',
  minOrderAmount: '0',
  maxUses: '',
  categoryId: '',
  expiresAt: '',
  isActive: true,
};

const toForm = (c: Coupon): FormState => ({
  code: c.code,
  type: c.type,
  value: String(c.value),
  minOrderAmount: String(c.minOrderAmount),
  maxUses: c.maxUses === null ? '' : String(c.maxUses),
  categoryId: c.categoryId === null ? '' : String(c.categoryId),
  expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
  isActive: c.isActive,
});

const validate = (f: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (!/^[A-Za-z0-9_-]{3,32}$/.test(f.code.trim())) errors.code = '3 à 32 caractères : lettres, chiffres, « - » ou « _ »';
  const value = Number(f.value);
  if (f.value === '' || Number.isNaN(value) || value <= 0) errors.value = 'Valeur invalide';
  else if (f.type === 'Percentage' && value > 100) errors.value = 'Maximum 100 %';
  if (f.minOrderAmount === '' || Number(f.minOrderAmount) < 0) errors.minOrderAmount = 'Montant invalide';
  if (f.maxUses !== '' && (!Number.isInteger(Number(f.maxUses)) || Number(f.maxUses) < 1)) errors.maxUses = 'Nombre entier ≥ 1';
  return errors;
};

const randomCode = () =>
  `PROMO${Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('')}`;

const describeValue = (c: Coupon) => (c.type === 'Percentage' ? `-${c.value} %` : `-${formatPrice(c.value)}`);

function StatusBadge({ coupon }: { coupon: Coupon }) {
  const exhausted = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
  const [label, style] = !coupon.isActive
    ? ['Désactivé', 'bg-muted text-muted-foreground']
    : coupon.isExpired
      ? ['Expiré', 'bg-red-100 text-red-700']
      : exhausted
        ? ['Épuisé', 'bg-amber-100 text-amber-700']
        : ['Actif', 'bg-emerald-100 text-emerald-700'];
  return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', style)}>{label}</span>;
}

export const AdminCouponsPage = () => {
  const { showNotification } = useNotification();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    couponService
      .getAll()
      .then((list) => {
        if (cancelled) return;
        setCoupons(list);
        setError(null);
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, code: randomCode() });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm(toForm(c));
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: SaveCoupon = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount),
      maxUses: form.maxUses === '' ? null : Number(form.maxUses),
      categoryId: form.categoryId === '' ? null : Number(form.categoryId),
      // Le coupon reste valable jusqu'à la fin du jour choisi
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editing) await couponService.update(editing.id, payload);
      else await couponService.create(payload);
      showNotification(editing ? 'Coupon modifié' : `Coupon ${payload.code} créé`, 'success');
      closeForm();
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await couponService.update(c.id, {
        code: c.code,
        type: c.type,
        value: c.value,
        minOrderAmount: c.minOrderAmount,
        maxUses: c.maxUses,
        categoryId: c.categoryId,
        expiresAt: c.expiresAt,
        isActive: !c.isActive,
      });
      showNotification(c.isActive ? `${c.code} désactivé` : `${c.code} réactivé`, 'info');
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (c: Coupon) => {
    if (!window.confirm(`Supprimer le coupon « ${c.code} » ?`)) return;
    try {
      await couponService.remove(c.id);
      showNotification(`Coupon ${c.code} supprimé`, 'info');
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <PageHeader title="Codes promo" action={!showForm && <Button onClick={openCreate}>Nouveau coupon</Button>} />
      <ErrorAlert message={error} />

      {showForm && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle>{editing ? `Modifier « ${editing.code} »` : 'Nouveau coupon'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
              <Field label="Code" error={formErrors.code}>
                <div className="flex gap-2">
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="uppercase tracking-wide"
                    maxLength={32}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Générer un code"
                    title="Générer un code"
                    onClick={() => setForm((f) => ({ ...f, code: randomCode() }))}
                  >
                    <Dices className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
              <Field label="Type de remise">
                <select className={selectClassName} value={form.type} onChange={set('type')}>
                  <option value="Percentage">Pourcentage (%)</option>
                  <option value="FixedAmount">Montant fixe (TND)</option>
                </select>
              </Field>
              <Field label={form.type === 'Percentage' ? 'Remise (%)' : 'Remise (TND)'} error={formErrors.value}>
                <Input type="number" min="0" step="0.01" value={form.value} onChange={set('value')} />
              </Field>
              <Field label="Panier minimum (TND)" error={formErrors.minOrderAmount}>
                <Input type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={set('minOrderAmount')} />
              </Field>
              <Field label="Utilisations maximum (vide = illimité)" error={formErrors.maxUses}>
                <Input type="number" min="1" step="1" value={form.maxUses} onChange={set('maxUses')} />
              </Field>
              <Field label="Catégorie concernée">
                <select className={selectClassName} value={form.categoryId} onChange={set('categoryId')}>
                  <option value="">Tous les produits</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date d'expiration (vide = jamais)">
                <Input type="date" value={form.expiresAt} onChange={set('expiresAt')} />
              </Field>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Coupon actif
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className={tableClasses.wrapper}>
        <table className={tableClasses.table}>
          <thead>
            <tr>
              <th className={tableClasses.th}>Code</th>
              <th className={tableClasses.th}>Remise</th>
              <th className={tableClasses.th}>Panier min.</th>
              <th className={tableClasses.th}>Utilisations</th>
              <th className={tableClasses.th}>Expiration</th>
              <th className={tableClasses.th}>Statut</th>
              <th className={tableClasses.th} />
            </tr>
          </thead>
          <tbody>
            {coupons === null ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td className={tableClasses.td} colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={7}>
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                    <TicketPercent className="h-10 w-10" />
                    <p className="font-medium text-foreground">Aucun coupon pour le moment</p>
                    <p className="text-sm">Créez un code promo pour offrir une remise à vos clients.</p>
                  </div>
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const usage = c.maxUses ? Math.min((c.usedCount / c.maxUses) * 100, 100) : null;
                return (
                  <tr key={c.id}>
                    <td className={cn(tableClasses.td, 'font-mono font-semibold tracking-wide')}>
                      {c.code}
                      {c.categoryName && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 font-sans text-[11px] font-medium text-primary">
                          {c.categoryName}
                        </span>
                      )}
                    </td>
                    <td className={tableClasses.td}>{describeValue(c)}</td>
                    <td className={tableClasses.td}>{c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : '—'}</td>
                    <td className={tableClasses.td}>
                      <div className="min-w-[6rem]">
                        <span className="tabular-nums">
                          {c.usedCount}
                          {c.maxUses ? ` / ${c.maxUses}` : ''}
                        </span>
                        {usage !== null && (
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usage}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={tableClasses.td}>
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className={tableClasses.td}>
                      <StatusBadge coupon={c} />
                    </td>
                    <td className={`${tableClasses.td} space-x-2 whitespace-nowrap text-right`}>
                      <Button size="sm" variant="outline" onClick={() => toggleActive(c)}>
                        {c.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                        Modifier
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(c)}>
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCouponsPage;
