import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPagination, ErrorAlert, Field, PageHeader } from '@/components/admin/AdminShared';
import { tableClasses } from '@/components/admin/adminStyles';
import userService from '@/services/api/userService';
import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { roleLabel } from '@/utils/labels';
import { PHONE_ERROR, PHONE_LENGTH, isValidPhoneNumber, sanitizePhone, toLocalPhone } from '@/lib/phone';
import type { User, UpdateUserProfile, NewDeliveryPerson } from '@/models/user';

const PAGE_SIZE = 10;

const emptyDeliveryPerson: NewDeliveryPerson = { firstName: '', lastName: '', email: '', password: '', phoneNumber: '' };

export const AdminUsersPage = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UpdateUserProfile>({ firstName: '', lastName: '', phoneNumber: '', address: '' });
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newPerson, setNewPerson] = useState<NewDeliveryPerson>(emptyDeliveryPerson);
  const [createError, setCreateError] = useState<string>();

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    userService.getAllUsers(page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setUsers(res.items);
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
  }, [page, reloadKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.firstName.trim() || !newPerson.lastName.trim() || !newPerson.email.trim()) {
      setCreateError('Le prénom, le nom et l\'e-mail sont requis');
      return;
    }
    if (newPerson.phoneNumber && !isValidPhoneNumber(newPerson.phoneNumber)) {
      setCreateError(PHONE_ERROR);
      return;
    }
    if (newPerson.password.length < 8) {
      setCreateError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setSaving(true);
    try {
      await userService.createDeliveryPerson({
        ...newPerson,
        firstName: newPerson.firstName.trim(),
        lastName: newPerson.lastName.trim(),
        email: newPerson.email.trim(),
        phoneNumber: newPerson.phoneNumber.trim(),
      });
      setCreating(false);
      setNewPerson(emptyDeliveryPerson);
      setCreateError(undefined);
      reload();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const setNew = (key: keyof NewDeliveryPerson) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewPerson((p) => ({ ...p, [key]: e.target.value }));

  const openEdit = (u: User) => {
    setCreating(false);
    setEditing(u);
    setFormError(undefined);
    setForm({ firstName: u.firstName, lastName: u.lastName, phoneNumber: toLocalPhone(u.phoneNumber), address: u.address });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('Le prénom et le nom sont requis');
      return;
    }
    if (form.phoneNumber && !isValidPhoneNumber(form.phoneNumber)) {
      setFormError(PHONE_ERROR);
      return;
    }
    setSaving(true);
    try {
      await userService.updateUser(editing.id, form);
      setEditing(null);
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (!window.confirm(`Supprimer l'utilisateur ${u.email} ?`)) return;
    try {
      await userService.deleteUser(u.id);
      if (users.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const set = (key: keyof UpdateUserProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        action={!creating && <Button onClick={() => { setCreating(true); setEditing(null); }}>Nouveau livreur</Button>}
      />
      <ErrorAlert message={error} />

      {creating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nouveau livreur</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2" noValidate>
              <Field label="Prénom">
                <Input value={newPerson.firstName} onChange={setNew('firstName')} />
              </Field>
              <Field label="Nom">
                <Input value={newPerson.lastName} onChange={setNew('lastName')} />
              </Field>
              <Field label="E-mail">
                <Input type="email" value={newPerson.email} onChange={setNew('email')} autoComplete="off" />
              </Field>
              <Field label="Téléphone">
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={PHONE_LENGTH}
                  placeholder="12345678"
                  value={newPerson.phoneNumber}
                  onChange={(e) => setNewPerson((p) => ({ ...p, phoneNumber: sanitizePhone(e.target.value) }))}
                />
              </Field>
              <Field label="Mot de passe (8 caractères minimum)" error={createError}>
                <Input type="password" value={newPerson.password} onChange={setNew('password')} autoComplete="new-password" />
              </Field>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Création...' : 'Créer le livreur'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreating(false);
                    setCreateError(undefined);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Modifier {editing.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
              <Field label="Prénom" error={formError}>
                <Input value={form.firstName} onChange={set('firstName')} />
              </Field>
              <Field label="Nom">
                <Input value={form.lastName} onChange={set('lastName')} />
              </Field>
              <Field label="Téléphone">
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={PHONE_LENGTH}
                  placeholder="12345678"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((p) => ({ ...p, phoneNumber: sanitizePhone(e.target.value) }))}
                />
              </Field>
              <Field label="Adresse">
                <Input value={form.address} onChange={set('address')} />
              </Field>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
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
              <th className={tableClasses.th}>Nom</th>
              <th className={tableClasses.th}>E-mail</th>
              <th className={tableClasses.th}>Téléphone</th>
              <th className={tableClasses.th}>Rôle</th>
              <th className={tableClasses.th}></th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={5}>
                  Chargement...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={5}>
                  Aucun utilisateur.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className={tableClasses.td}>
                    {u.firstName} {u.lastName}
                  </td>
                  <td className={tableClasses.td}>{u.email}</td>
                  <td className={tableClasses.td}>{u.phoneNumber}</td>
                  <td className={tableClasses.td}>
                    <Badge variant={u.role === 'Admin' ? 'default' : 'secondary'}>{roleLabel(u.role)}</Badge>
                  </td>
                  <td className={`${tableClasses.td} space-x-2 text-right`}>
                    <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={u.id === currentUser?.id}
                      title={u.id === currentUser?.id ? 'Vous ne pouvez pas supprimer votre propre compte' : undefined}
                      onClick={() => handleDelete(u)}
                    >
                      Supprimer
                    </Button>
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

export default AdminUsersPage;
