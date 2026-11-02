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

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  /** Nombre de produits actifs (renseigné par le serveur) */
  productCount?: number;
}

/**
 * Cart item with quantity
 */
export interface CartItem {
  product: Product;
  quantity: number;
  /** Pointure / taille choisie (absente pour un produit sans taille) */
  size?: string;
}

/** Identifie une ligne du panier : un même produit en deux tailles = deux lignes */
export interface CartLineKey {
  productId: number;
  size?: string;
}

/**
 * Sort options for product list
 */
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name' | 'newest';

/**
 * Filter state for products
 */
export interface ProductFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  search: string;
  /** Marque ('all' = toutes) */
  brand: string;
  /** Genre ('all' = tous) */
  gender: string;
  /** Taille ou pointure ('all' = toutes) */
  size: string;
  /** Couleur ('all' = toutes) */
  color: string;
  /** Note minimale 1-5 (0 = toutes) */
  minRating: number;
}
