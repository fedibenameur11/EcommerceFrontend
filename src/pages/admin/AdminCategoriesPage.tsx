import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorAlert, Field, PageHeader } from '@/components/admin/AdminShared';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { tableClasses } from '@/components/admin/adminStyles';
import categoryService from '@/services/api/categoryService';
import { getErrorMessage } from '@/utils/errorHandler';
import type { Category } from '@/models/category';

const emptyForm = { name: '', description: '', imageUrl: '' };

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    categoryService.getAllCategories()
      .then((res) => {
        if (cancelled) return;
        setCategories(res);
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
  }, [reloadKey]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setNameError(undefined);
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description, imageUrl: c.imageUrl });
    setNameError(undefined);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError('Le nom est requis');
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };
    setSaving(true);
    try {
      if (editing) await categoryService.updateCategory(editing.id, payload);
      else await categoryService.createCategory(payload);
      closeForm();
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!window.confirm(`Supprimer la catégorie « ${c.name} » ?`)) return;
    try {
      await categoryService.deleteCategory(c.id);
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader title="Catégories" action={!showForm && <Button onClick={openCreate}>Nouvelle catégorie</Button>} />
      <ErrorAlert message={error} />

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? `Modifier « ${editing.name} »` : 'Nouvelle catégorie'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field label="Nom" error={nameError}>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Description">
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <ImageUploadField
                label="Image de la catégorie"
                alt="Aperçu de la catégorie"
                folder="categories"
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                onUploadingChange={setUploading}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={saving || uploading}>
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
              <th className={tableClasses.th}>Image</th>
              <th className={tableClasses.th}>Nom</th>
              <th className={tableClasses.th}>Description</th>
              <th className={tableClasses.th}></th>
            </tr>
          </thead>
          <tbody>
            {loading && categories.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={4}>
                  Chargement...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={4}>
                  Aucune catégorie.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td className={tableClasses.td}>
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted" />
                    )}
                  </td>
                  <td className={tableClasses.td}>{c.name}</td>
                  <td className={tableClasses.td}>{c.description}</td>
                  <td className={`${tableClasses.td} space-x-2 text-right`}>
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                      Modifier
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(c)}>
                      Supprimer
                    </Button>
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

export default AdminCategoriesPage;
