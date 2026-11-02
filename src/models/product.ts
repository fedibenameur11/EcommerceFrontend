export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  /** Marque (vide = sans marque) */
  brand?: string;
  /** Public visé : « Homme », « Femme » ou vide (mixte) */
  gender?: string;
  /** Couleur principale (Noir, Blanc, Rouge...) ; vide = non précisée */
  color?: string;
  /** Pointures (38-45) ou tailles (XS-XXL) disponibles ; vide = produit sans taille */
  sizes?: string[];
  /** Prix normal barré : renseigné seulement pendant une vente flash */
  originalPrice?: number | null;
  /** Vente flash programmée (prix, début, fin) */
  salePrice?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  /** true si la vente flash est en cours */
  onSale?: boolean;
  /** Image de couverture : affichée dans la liste des produits */
  imageUrl: string;
  /** Images supplémentaires : galerie de la page détail (renseignées par GET /products/{id}) */
  images?: string[];
  /** Vendeur propriétaire (absent = produit de la boutique) */
  sellerId?: number | null;
  /** Note moyenne sur 5 (0 si aucun avis) */
  averageRating?: number;
  reviewCount?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
