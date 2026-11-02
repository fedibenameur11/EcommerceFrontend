import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPagination, ErrorAlert, Field, PageHeader } from '@/components/admin/AdminShared';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { MultiImageUploadField } from '@/components/admin/MultiImageUploadField';
import { selectClassName, tableClasses } from '@/components/admin/adminStyles';
import productService from '@/services/api/productService';
import categoryService from '@/services/api/categoryService';
import { getErrorMessage } from '@/utils/errorHandler';
import type { Product } from '@/models/product';
import type { Category } from '@/models/category';
import {
  COLORS,
  GENDERS,
  SIZE_KIND_LABELS,
  sizeKindOf,
  sizesForKind,
  sizesSummary,
  type SizeKind,
} from '@/utils/productOptions';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

type FormState = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  brand: string;
  /** « Homme », « Femme » ou vide (mixte) */
  gender: string;
  /** Couleur principale ou vide */
  color: string;
  /** Pointures, tailles de vêtements ou aucune */
  sizeKind: SizeKind;
  sizes: string[];
  /** Vente flash (facultative) : prix et fenêtre de dates, au format datetime-local */
  salePrice: string;
  saleStartsAt: string;
  saleEndsAt: string;
  imageUrl: string;
  /** Images supplémentaires (galerie de la page détail) */
  images: string[];
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  categoryId: '',
  brand: '',
  gender: '',
  color: '',
  sizeKind: 'none',
  sizes: [],
  salePrice: '',
  saleStartsAt: '',
  saleEndsAt: '',
  imageUrl: '',
  images: [],
};

/** ISO (UTC) -> valeur d'un champ datetime-local (heure locale) */
const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toForm = (p: Product): FormState => ({
  name: p.name,
  description: p.description,
  // Pendant une vente flash, p.price est le prix réduit : on édite le prix normal
  price: String(p.originalPrice ?? p.price),
  stockQuantity: String(p.stockQuantity),
  categoryId: String(p.categoryId),
  brand: p.brand ?? '',
  gender: p.gender ?? '',
  color: p.color ?? '',
  sizeKind: sizeKindOf(p.sizes),
  sizes: p.sizes ?? [],
  salePrice: p.salePrice != null ? String(p.salePrice) : '',
  saleStartsAt: toLocalInput(p.saleStartsAt),
  saleEndsAt: toLocalInput(p.saleEndsAt),
  imageUrl: p.imageUrl,
  images: p.images ?? [],
});

const validate = (f: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (!f.name.trim()) errors.name = 'Le nom est requis';
  if (f.price === '' || Number.isNaN(Number(f.price)) || Number(f.price) < 0) errors.price = 'Prix invalide';
  if (f.stockQuantity === '' || !Number.isInteger(Number(f.stockQuantity)) || Number(f.stockQuantity) < 0)
    errors.stockQuantity = 'Stock invalide';
  if (!f.categoryId) errors.categoryId = 'Choisissez une catégorie';
  if (f.sizeKind !== 'none' && f.sizes.length === 0) errors.sizes = 'Sélectionnez au moins une pointure / taille';
  if (f.salePrice !== '') {
    const sale = Number(f.salePrice);
    if (Number.isNaN(sale) || sale <= 0 || sale >= Number(f.price)) errors.salePrice = 'Doit être inférieur au prix normal';
    if (!f.saleEndsAt) errors.saleEndsAt = 'Date de fin requise';
    else if (f.saleStartsAt && new Date(f.saleStartsAt) >= new Date(f.saleEndsAt)) errors.saleEndsAt = 'Doit suivre le début';
  }
  return errors;
};

interface ProductsPageProps {
  /** Vendeur : n'affiche et ne gère que ses propres produits */
  mine?: boolean;
}

export const AdminProductsPage = ({ mine = false }: ProductsPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    (mine
      ? productService.getMyProducts(page, PAGE_SIZE)
      : productService.getAllProducts(page, PAGE_SIZE, query || undefined)
    )
      .then((res) => {
        if (cancelled) return;
        setProducts(res.items);
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
  }, [page, query, reloadKey, mine]);

  useEffect(() => {
    categoryService
      .getAllCategories()
      .then(setCategories)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? `#${id}`;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = async (p: Product) => {
    setEditing(p);
    setForm(toForm(p));
    setFormErrors({});
    setShowForm(true);
    // La liste ne contient pas la galerie : on charge le détail du produit
    try {
      const detail = await productService.getProductById(p.id);
      setForm((f) => ({ ...f, images: detail.images ?? [] }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
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

    const payload: Omit<Product, 'id'> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      categoryId: Number(form.categoryId),
      brand: form.brand.trim(),
      gender: form.gender,
      color: form.color,
      sizes: form.sizeKind === 'none' ? [] : sizesForKind(form.sizeKind).filter((s) => form.sizes.includes(s)),
      salePrice: form.salePrice === '' ? null : Number(form.salePrice),
      saleStartsAt: form.salePrice !== '' && form.saleStartsAt ? new Date(form.saleStartsAt).toISOString() : null,
      saleEndsAt: form.salePrice !== '' && form.saleEndsAt ? new Date(form.saleEndsAt).toISOString() : null,
      imageUrl: form.imageUrl.trim(),
      images: form.images,
    };

    setSaving(true);
    try {
      if (editing) await productService.updateProduct(editing.id, payload);
      else await productService.createProduct(payload);
      closeForm();
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Supprimer le produit « ${p.name} » ?`)) return;
    try {
      await productService.deleteProduct(p.id);
      // Revenir à la page précédente si on vient de vider la dernière page
      if (products.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const changeSizeKind = (kind: SizeKind) => setForm((f) => ({ ...f, sizeKind: kind, sizes: [] }));
  const toggleSize = (size: string) =>
    setForm((f) => ({ ...f, sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size] }));

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <PageHeader title={mine ? 'Mes produits' : 'Produits'} action={!showForm && <Button onClick={openCreate}>Nouveau produit</Button>} />
      <ErrorAlert message={error} />

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? `Modifier « ${editing.name} »` : 'Nouveau produit'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
              <Field label="Nom" error={formErrors.name}>
                <Input value={form.name} onChange={set('name')} />
              </Field>
              <Field label="Catégorie" error={formErrors.categoryId}>
                <select className={selectClassName} value={form.categoryId} onChange={set('categoryId')}>
                  <option value="">— Choisir —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Marque (optionnel)" error={formErrors.brand}>
                <Input value={form.brand} onChange={set('brand')} maxLength={60} />
              </Field>
              <Field label="Prix" error={formErrors.price}>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} />
              </Field>
              <Field label="Stock" error={formErrors.stockQuantity}>
                <Input type="number" min="0" step="1" value={form.stockQuantity} onChange={set('stockQuantity')} />
              </Field>
              <Field label="Genre">
                <select className={selectClassName} value={form.gender} onChange={set('gender')}>
                  <option value="">Mixte / non précisé</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Couleur">
                <select className={selectClassName} value={form.color} onChange={set('color')}>
                  <option value="">Non précisée</option>
                  {COLORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Pointures / tailles disponibles">
                <select
                  className={selectClassName}
                  value={form.sizeKind}
                  onChange={(e) => changeSizeKind(e.target.value as SizeKind)}
                >
                  {(Object.keys(SIZE_KIND_LABELS) as SizeKind[]).map((kind) => (
                    <option key={kind} value={kind}>
                      {SIZE_KIND_LABELS[kind]}
                    </option>
                  ))}
                </select>
              </Field>
              {form.sizeKind !== 'none' && (
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {form.sizeKind === 'shoes' ? 'Pointures proposées' : 'Tailles proposées'}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setForm((f) => ({ ...f, sizes: sizesForKind(f.sizeKind) }))}
                      >
                        Tout sélectionner
                      </button>
                      <button
                        type="button"
                        className="text-muted-foreground hover:underline"
                        onClick={() => setForm((f) => ({ ...f, sizes: [] }))}
                      >
                        Tout effacer
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Pointures ou tailles disponibles">
                    {sizesForKind(form.sizeKind).map((size) => {
                      const selected = form.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleSize(size)}
                          className={cn(
                            'h-10 min-w-[3rem] rounded-lg border px-3 text-sm font-semibold transition-colors',
                            selected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'bg-background hover:border-primary/50 hover:bg-accent'
                          )}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {formErrors.sizes && <p className="text-xs text-destructive">{formErrors.sizes}</p>}
                  <p className="text-xs text-muted-foreground">
                    Le client devra choisir l&apos;une de ces {form.sizeKind === 'shoes' ? 'pointures' : 'tailles'} avant d&apos;ajouter le
                    produit au panier. Le stock reste global au produit.
                  </p>
                </div>
              )}
              <fieldset className="grid gap-4 rounded-lg border border-dashed p-4 sm:col-span-2 sm:grid-cols-3">
                <legend className="px-2 text-sm font-semibold">⚡ Vente flash (facultatif)</legend>
                <Field label="Prix promotionnel (TND)" error={formErrors.salePrice}>
                  <Input type="number" min="0" step="0.01" value={form.salePrice} onChange={set('salePrice')} />
                </Field>
                <Field label="Début (vide = tout de suite)">
                  <Input type="datetime-local" value={form.saleStartsAt} onChange={set('saleStartsAt')} />
                </Field>
                <Field label="Fin" error={formErrors.saleEndsAt}>
                  <Input type="datetime-local" value={form.saleEndsAt} onChange={set('saleEndsAt')} />
                </Field>
                <p className="text-xs text-muted-foreground sm:col-span-3">
                  Pendant cette période, le prix barré et un compte à rebours s&apos;affichent sur le produit. Laissez le prix
                  vide pour ne pas programmer de vente flash.
                </p>
              </fieldset>
              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Image principale (affichée dans la liste des produits)"
                  alt="Aperçu du produit"
                  value={form.imageUrl}
                  onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                  onUploadingChange={setUploading}
                />
              </div>
              <div className="sm:col-span-2">
                <MultiImageUploadField
                  label="Images supplémentaires (affichées dans le détail du produit)"
                  hint="Ajoutez plusieurs photos à la fois. Survolez une miniature pour la retirer ou changer son ordre."
                  value={form.images}
                  onChange={(images) => setForm((f) => ({ ...f, images }))}
                  onUploadingChange={setUploading}
                />
              </div>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.description}
                    onChange={set('description')}
                  />
                </Field>
              </div>
              <div className="flex gap-2 sm:col-span-2">
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

      {!mine && (
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search.trim());
        }}
      >
        <Input placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="outline">
          Rechercher
        </Button>
      </form>
      )}

      <div className={tableClasses.wrapper}>
        <table className={tableClasses.table}>
          <thead>
            <tr>
              <th className={tableClasses.th}>Image</th>
              <th className={tableClasses.th}>Nom</th>
              <th className={tableClasses.th}>Catégorie</th>
              <th className={tableClasses.th}>Genre / tailles</th>
              <th className={tableClasses.th}>Prix</th>
              <th className={tableClasses.th}>Stock</th>
              <th className={tableClasses.th}></th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={7}>
                  Chargement...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td className={tableClasses.td} colSpan={7}>
                  Aucun produit.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className={tableClasses.td}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted" />
                    )}
                  </td>
                  <td className={tableClasses.td}>{p.name}</td>
                  <td className={tableClasses.td}>{categoryName(p.categoryId)}</td>
                  <td className={tableClasses.td}>
                    <div>{p.gender || <span className="text-muted-foreground">Mixte</span>}</div>
                    {(p.sizes?.length ?? 0) > 0 && (
                      <div className="text-xs text-muted-foreground">{sizesSummary(p.sizes)}</div>
                    )}
                  </td>
                  <td className={tableClasses.td}>{formatPrice(p.price)}</td>
                  <td className={tableClasses.td}>{p.stockQuantity}</td>
                  <td className={`${tableClasses.td} space-x-2 text-right`}>
                    <Button size="sm" variant="outline" onClick={() => void openEdit(p)}>
                      Modifier
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(p)}>
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

export default AdminProductsPage;
