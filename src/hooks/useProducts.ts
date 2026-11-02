import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import productService from '@/services/api/productService';
import type { RootState } from '@/store/store';

/**
 * useProducts Hook
 * Provides product fetching and filtering functionality
 */
export const useProducts = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.products);
  // Fallback for backward compatibility with existing productSlice
  const products = (state as unknown as Record<string, unknown>)?.items as unknown[] || [];
  const loading = (state as unknown as Record<string, unknown>)?.loading as boolean || false;
  const error = (state as unknown as Record<string, unknown>)?.error as string | null || null;

  const fetchProducts = useCallback(
    async (pageNumber: number = 1, pageSize: number = 10) => {
      const response = await productService.getAllProducts(pageNumber, pageSize);
      // Dispatch actions to Redux would go here
      return response;
    },
    [dispatch]
  );

  const fetchProductsByCategory = useCallback(
    async (categoryId: string, pageNumber: number = 1) => {
      const response = await productService.getProductsByCategory(Number(categoryId), pageNumber, 10);
      return response;
    },
    []
  );

  const searchProducts = useCallback(
    async (query: string) => {
      const results = await productService.searchProducts(query);
      return results;
    },
    []
  );

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductsByCategory,
    searchProducts,
  };
};

export default useProducts;
