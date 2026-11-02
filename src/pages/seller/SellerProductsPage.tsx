import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';

/**
 * Espace vendeur : gestion de ses propres produits
 * (même écran que l'admin, restreint aux produits du vendeur connecté).
 */
export const SellerProductsPage = () => <AdminProductsPage mine />;

export default SellerProductsPage;
