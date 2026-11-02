import { useAppSelector } from '@/store/hooks';
import { selectCategories } from '@/store/slices/productSlice';

/**
 * Nom de la catégorie d'un produit (les catégories sont chargées dans le store par le Header).
 */
export const useCategoryName = (categoryId: number): string => {
  const categories = useAppSelector(selectCategories);
  return categories.find((category) => category.id === categoryId)?.name ?? `Catégorie ${categoryId}`;
};

export default useCategoryName;
