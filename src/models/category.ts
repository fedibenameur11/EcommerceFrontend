export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  /** Nombre de produits actifs (renseigné par le serveur) */
  productCount?: number;
}
