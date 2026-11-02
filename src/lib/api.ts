import productService, { type ProductPageQuery } from '@/services/api/productService';
import categoryService from '@/services/api/categoryService';
import type { Category } from '@/types';

/**
 * Product API client. Centralizes all product-related endpoints
 * so components and slices stay decoupled from the transport layer.
 */
export const productApi = {
  /** Une page de produits : la recherche, les filtres et le tri sont faits par le serveur */
  getPage: (query: ProductPageQuery) => productService.getPage(query),
  getById: (id: number) => productService.getProductById(id),
  getBrands: () => productService.getBrands(),
  getCategories: (): Promise<Category[]> => categoryService.getAllCategories(),
};
