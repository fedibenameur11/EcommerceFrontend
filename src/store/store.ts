import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import productReducer from './slices/productSlice';
import userReducer from './slices/userSlice';
import wishlistReducer from './slices/wishlistSlice';

/**
 * Redux store configuration
 * Combines all slices for state management
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    categories: categoryReducer,
    orders: orderReducer,
    products: productReducer,
    user: userReducer,
    wishlist: wishlistReducer,
  },
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
