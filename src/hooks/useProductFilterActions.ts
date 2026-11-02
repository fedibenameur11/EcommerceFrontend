import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { resetFilters } from '@/store/slices/productSlice';

/**
 * Actions de filtre partagées par la barre latérale et la barre d'outils.
 * La catégorie vit dans l'adresse (?category=ID) : la changer met à jour l'URL,
 * et la barre latérale recopie ensuite l'URL dans le store.
 */
export function useProductFilterActions() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectCategory = (value: string) => {
    if (value === 'all') searchParams.delete('category');
    else searchParams.set('category', value);
    setSearchParams(searchParams, { preventScrollReset: true });
  };

  const resetAll = () => {
    dispatch(resetFilters());
    setSearchParams({}, { preventScrollReset: true });
  };

  return { selectCategory, resetAll };
}
