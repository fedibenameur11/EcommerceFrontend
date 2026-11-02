import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
} from '@/store/slices/cartSlice';
import type { Product } from '@/types';

/**
 * useCart Hook
 * Le panier vit côté client (Redux + sessionStorage) et n'est envoyé à l'API
 * qu'au moment de la commande (POST /orders).
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotal);
  const totalQuantity = useSelector(selectCartItemCount);

  const addToCart = useCallback((product: Product) => dispatch(addToCartAction(product)), [dispatch]);
  const setQuantity = useCallback(
    (productId: number, quantity: number, size?: string) => dispatch(updateQuantity({ productId, size, quantity })),
    [dispatch]
  );
  const removeFromCart = useCallback(
    (productId: number, size?: string) => dispatch(removeFromCartAction({ productId, size })),
    [dispatch]
  );
  const emptyCart = useCallback(() => dispatch(clearCart()), [dispatch]);

  return {
    items,
    totalPrice,
    totalQuantity,
    loading: false,
    error: null,
    addToCart,
    updateQuantity: setQuantity,
    removeFromCart,
    clearCart: emptyCart,
  };
};

export default useCart;
