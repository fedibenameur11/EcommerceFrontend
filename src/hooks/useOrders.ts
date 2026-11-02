import { useCallback, useState } from 'react';
import orderService from '@/services/api/orderService';
import { getErrorMessage } from '@/utils/errorHandler';
import type { Order, CreateOrder } from '@/models/order';

interface UseOrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

/**
 * useOrders Hook
 * Provides order fetching and management functionality
 */
export const useOrders = () => {
  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    loading: false,
    error: null,
  });

  const fetchUserOrders = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const orders = await orderService.getMyOrders();
      setState({ orders, loading: false, error: null });
      return orders;
    } catch (err) {
      setState((prev) => ({ ...prev, error: getErrorMessage(err), loading: false }));
      throw err;
    }
  }, []);

  const createOrder = useCallback(async (data: CreateOrder): Promise<Order> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const order = await orderService.createOrder(data);
      setState((prev) => ({
        ...prev,
        orders: [order, ...prev.orders],
        loading: false,
      }));
      return order;
    } catch (err) {
      setState((prev) => ({ ...prev, error: getErrorMessage(err), loading: false }));
      throw err;
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: number) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await orderService.cancelOrder(orderId);
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'Cancelled' as const } : o
        ),
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: getErrorMessage(err), loading: false }));
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchUserOrders,
    createOrder,
    cancelOrder,
  };
};

export default useOrders;
