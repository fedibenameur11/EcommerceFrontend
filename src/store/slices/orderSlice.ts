import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '@/models/order';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  },
};

export const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.error = null;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    removeOrder: (state, action: PayloadAction<number>) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    },
    setPagination: (
      state,
      action: PayloadAction<{
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalCount: number;
      }>
    ) => {
      state.pagination = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setOrders, addOrder, updateOrder, removeOrder, setPagination, setLoading, setError } =
  orderSlice.actions;
export default orderSlice.reducer;
