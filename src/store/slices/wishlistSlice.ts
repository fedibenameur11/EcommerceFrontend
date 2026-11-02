import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import wishlistService from '@/services/api/wishlistService';
import { getErrorMessage } from '@/utils/errorHandler';
import type { Product } from '@/models/product';

interface WishlistState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = { items: [], loading: false, error: null };

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    return await wishlistService.getWishlist();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (product: Product, { rejectWithValue }) => {
    try {
      await wishlistService.add(product.id);
      return product;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId: number, { rejectWithValue }) => {
    try {
      await wishlistService.remove(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.items.some((p) => p.id === action.payload.id)) state.items.unshift(action.payload);
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items;
export const selectWishlistLoading = (state: { wishlist: WishlistState }) => state.wishlist.loading;
export default wishlistSlice.reducer;