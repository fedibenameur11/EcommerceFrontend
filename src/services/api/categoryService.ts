import api from './axiosInstance';
import type { Category } from '@/models/category';

/**
 * Category Service
 * Handles all category-related API calls
 */
export const categoryService = {
  /**
   * Get all categories
   */
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  /**
   * Create new category (Admin only)
   */
  createCategory: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  /**
   * Update category (Admin only)
   */
  updateCategory: async (id: number, data: Omit<Category, 'id'>): Promise<void> => {
    await api.put(`/categories/${id}`, { id, ...data });
  },

  /**
   * Delete category (Admin only)
   */
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryService;
