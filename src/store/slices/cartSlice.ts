import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, CartLineKey, Product } from '@/types';
import type { AppliedCoupon } from '@/models/coupon';
import { logout } from './authSlice';
import couponService from '@/services/api/couponService';
import { getErrorMessage } from '@/utils/errorHandler';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Code promo appliqué (la remise est calculée par le serveur) */
  coupon: AppliedCoupon | null;
  couponError: string | null;
  couponLoading: boolean;
}

// Le panier est gardé en sessionStorage : il survit à un rechargement de page
// mais repart vide quand l'application / l'onglet est fermé puis relancé.
const loadCartFromStorage = (): CartItem[] => {
  try {
    localStorage.removeItem('cart'); // ancien stockage persistant : on le purge
    const savedCart = sessionStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
};

// Save cart to sessionStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    sessionStorage.setItem('cart', JSON.stringify(items));
  } catch {
    console.error('Failed to save cart to sessionStorage');
  }
};

/** Même produit et même taille = même ligne du panier */
const isLine = (item: CartItem, key: CartLineKey) =>
  item.product.id === key.productId && (item.size ?? null) === (key.size ?? null);

const initialState: CartState = {
  items: loadCartFromStorage(),
  isOpen: false,
  coupon: null,
  couponError: null,
  couponLoading: false,
};

/** Lignes envoyées au serveur pour qu'il calcule la remise (coupons limités à une catégorie compris) */
const cartLines = (state: { cart: CartState }) =>
  state.cart.items.map((item) => ({ productId: item.product.id, quantity: item.quantity }));

const cartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

/** Applique un code promo : le serveur vérifie sa validité et calcule la remise sur le panier actuel. */
export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code: string, { getState, rejectWithValue }) => {
    try {
      const result = await couponService.validate(code.trim(), cartSubtotal(getState() as { cart: CartState }), cartLines(getState() as { cart: CartState }));
      return { code: result.code, type: result.type, value: result.value, discount: result.discount } satisfies AppliedCoupon;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/** Recalcule la remise quand le contenu du panier change ; le code est retiré s'il n'est plus valable. */
export const refreshCoupon = createAsyncThunk(
  'cart/refreshCoupon',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { cart: CartState };
    if (!state.cart.coupon) return null;
    try {
      const result = await couponService.validate(state.cart.coupon.code, cartSubtotal(state), cartLines(state));
      return { code: result.code, type: result.type, value: result.value, discount: result.discount } satisfies AppliedCoupon;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Cart slice for managing shopping cart state
 * Includes add, remove, update quantity, and clear operations
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Add product to cart or increment quantity if exists
     */
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find((item) => isLine(item, { productId: action.payload.id }));

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }

      saveCartToStorage(state.items);
    },

    /**
     * Add several units of a product at once (quantity selector on the product page)
     */
    addManyToCart: (state, action: PayloadAction<{ product: Product; quantity: number; size?: string }>) => {
      const { product, quantity, size } = action.payload;
      if (quantity < 1) return;
      const existingItem = state.items.find((item) => isLine(item, { productId: product.id, size }));

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity, size });
      }

      saveCartToStorage(state.items);
    },

    /**
     * Remove product from cart completely
     */
    removeFromCart: (state, action: PayloadAction<CartLineKey>) => {
      state.items = state.items.filter((item) => !isLine(item, action.payload));
      saveCartToStorage(state.items);
    },

    /**
     * Update quantity of specific product
     */
    updateQuantity: (
      state,
      action: PayloadAction<CartLineKey & { quantity: number }>
    ) => {
      const { quantity, ...key } = action.payload;
      const item = state.items.find((item) => isLine(item, key));

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => !isLine(item, key));
        } else {
          item.quantity = quantity;
        }
      }

      saveCartToStorage(state.items);
    },

    /**
     * Increment product quantity by 1
     */
    incrementQuantity: (state, action: PayloadAction<CartLineKey>) => {
      const item = state.items.find((item) => isLine(item, action.payload));
      if (item) {
        item.quantity += 1;
        saveCartToStorage(state.items);
      }
    },

    /**
     * Decrement product quantity by 1 (removes if quantity becomes 0)
     */
    decrementQuantity: (state, action: PayloadAction<CartLineKey>) => {
      const item = state.items.find((item) => isLine(item, action.payload));
      if (item) {
        if (item.quantity <= 1) {
          state.items = state.items.filter((item) => !isLine(item, action.payload));
        } else {
          item.quantity -= 1;
        }
        saveCartToStorage(state.items);
      }
    },

    /**
     * Clear all items from cart
     */
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.couponError = null;
      saveCartToStorage(state.items);
    },

    /**
     * Toggle cart sidebar visibility
     */
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    /**
     * Set cart sidebar open state
     */
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },

    /**
     * Remove the applied promo code
     */
    removeCoupon: (state) => {
      state.coupon = null;
      state.couponError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Le panier appartient à la session : il est vidé à la déconnexion
      .addCase(logout, (state) => {
        state.items = [];
        state.coupon = null;
        state.couponError = null;
        saveCartToStorage(state.items);
      })
      .addCase(applyCoupon.pending, (state) => {
        state.couponLoading = true;
        state.couponError = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.couponLoading = false;
        state.coupon = action.payload;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.couponLoading = false;
        state.couponError = action.payload as string;
      })
      .addCase(refreshCoupon.fulfilled, (state, action) => {
        if (action.payload) state.coupon = action.payload;
      })
      .addCase(refreshCoupon.rejected, (state, action) => {
        // Le code n'est plus valable pour ce panier (montant minimum, expiration...)
        state.coupon = null;
        state.couponError = action.payload as string;
      });
  },
});

export const {
  addToCart,
  addManyToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  removeCoupon,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCoupon = (state: { cart: CartState }) => state.cart.coupon;
export const selectCouponError = (state: { cart: CartState }) => state.cart.couponError;
export const selectCouponLoading = (state: { cart: CartState }) => state.cart.couponLoading;
/** Remise en TND du code appliqué (0 si aucun) */
export const selectCartDiscount = (state: { cart: CartState }) => state.cart.coupon?.discount ?? 0;
export const selectIsCartOpen = (state: { cart: CartState }) =>
  state.cart.isOpen;

export default cartSlice.reducer;
