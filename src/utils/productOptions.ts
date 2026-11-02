/**
 * Options de fiche produit : public visé (genre) et pointures / tailles.
 * Les valeurs doivent rester identiques à celles acceptées par l'API (ProductOptions.cs).
 */

export const GENDERS = ['Homme', 'Femme'] as const;

/** Couleurs principales d'un produit : le nom est envoyé à l'API, la teinte sert à l'affichage */
export const COLORS = [
  { name: 'Noir', hex: '#111827' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#9CA3AF' },
  { name: 'Beige', hex: '#D9C7A3' },
  { name: 'Marron', hex: '#7C4A21' },
  { name: 'Rouge', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Jaune', hex: '#FACC15' },
  { name: 'Vert', hex: '#22C55E' },
  { name: 'Bleu', hex: '#3B82F6' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Rose', hex: '#EC4899' },
] as const;

export const colorHex = (name?: string | null): string | undefined => COLORS.find((c) => c.name === name)?.hex;

/** Pointures des chaussures (espadrilles...) */
export const SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45'];

/** Tailles des vêtements */
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Type de tailles proposé par un produit */
export type SizeKind = 'none' | 'shoes' | 'clothing';

export const SIZE_KIND_LABELS: Record<SizeKind, string> = {
  none: 'Aucune taille',
  shoes: 'Pointures (38 à 45)',
  clothing: 'Tailles (XS à XXL)',
};

export const sizesForKind = (kind: SizeKind): string[] =>
  kind === 'shoes' ? SHOE_SIZES : kind === 'clothing' ? CLOTHING_SIZES : [];

/** Déduit le type de tailles d'une liste déjà enregistrée */
export const sizeKindOf = (sizes?: string[] | null): SizeKind => {
  if (!sizes || sizes.length === 0) return 'none';
  return SHOE_SIZES.includes(sizes[0]) ? 'shoes' : 'clothing';
};

/** « Pointures 38–45 », « Tailles S, M, L »... (résumé court pour les cartes produit) */
export const sizesSummary = (sizes?: string[] | null): string => {
  if (!sizes || sizes.length === 0) return '';
  const kind = sizeKindOf(sizes);
  const label = kind === 'shoes' ? 'Pointures' : 'Tailles';
  if (sizes.length > 2 && kind === 'shoes') return `${label} ${sizes[0]}–${sizes[sizes.length - 1]}`;
  return `${label} ${sizes.join(', ')}`;
};

/** Texte du type « Pointure » / « Taille » pour une valeur choisie */
export const sizeNoun = (size: string): string => (SHOE_SIZES.includes(size) ? 'Pointure' : 'Taille');
