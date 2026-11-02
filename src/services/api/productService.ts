import api from './axiosInstance';
import type { Product, PaginatedResponse } from '@/models/product';

export interface ProductPageQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  gender?: string;
  size?: string;
  color?: string;
  minRating?: number;
  onSale?: boolean;
  sort?: 'price-asc' | 'price-desc' | 'name' | 'newest';
}

export interface ProductSuggestion {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
}

/**
 * Product Service
 * Handles all product-related API calls
 */
export const productService = {
  /**
   * Get all products with pagination
   */
  getAllProducts: async (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    categoryId?: number
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/products', {
      params: { page, pageSize, search, categoryId },
    });
    return response.data;
  },

  /** Liste paginée avec recherche, filtres et tri exécutés par le serveur */
  getPage: async (query: ProductPageQuery): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/products', { params: query });
    return response.data;
  },

  /** Marques disponibles pour le filtre */
  getBrands: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/products/brands');
    return response.data;
  },

  /** Suggestions affichées pendant la frappe dans la recherche */
  getSuggestions: async (q: string, signal?: AbortSignal): Promise<ProductSuggestion[]> => {
    const response = await api.get<ProductSuggestion[]>('/products/suggestions', {
      params: { q, take: 6 },
      signal,
    });
    return response.data;
  },

  /** Vendeur : mes produits, paginés */
  getMyProducts: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/products/mine', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (
    categoryId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/products', {
      params: { page, pageSize, categoryId },
    });
    return response.data;
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get<PaginatedResponse<Product>>('/products', {
      params: { page: 1, pageSize: 100, search: query },
    });
    return response.data.items;
  },

  /**
   * Get products by category
   */
  createProduct: async (data: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  updateProduct: async (id: number, data: Omit<Product, 'id'>): Promise<void> => {
    await api.put(`/products/${id}`, { id, ...data });
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export default productService;
