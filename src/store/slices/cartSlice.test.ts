import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, {
  addToCart,
  addManyToCart,
  removeFromCart,
  removeCoupon,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  selectCartTotal,
  selectCartItemCount,
} from './cartSlice';
import type { Product } from '@/types';

const product: Product = {
  id: 1,
  name: 'Test Product',
  price: 10,
  description: 'A product used in tests',
  categoryId: 1,
  stockQuantity: 5,
  imageUrl: 'https://example.com/image.png',
};

const initialState = { items: [], isOpen: false, coupon: null, couponError: null, couponLoading: false };

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('cartSlice reducer', () => {
  it('adds a new product with quantity 1', () => {
    const state = cartReducer(initialState, addToCart(product));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
  });

  it('adds several units at once and ignores an invalid quantity', () => {
    let state = cartReducer(initialState, addManyToCart({ product, quantity: 3 }));
    expect(state.items[0].quantity).toBe(3);
    state = cartReducer(state, addManyToCart({ product, quantity: 2 }));
    expect(state.items[0].quantity).toBe(5);
    state = cartReducer(state, addManyToCart({ product, quantity: 0 }));
    expect(state.items[0].quantity).toBe(5);
  });

  it('clears the applied coupon when the cart is cleared or the coupon removed', () => {
    const withCoupon = {
      ...cartReducer(initialState, addToCart(product)),
      coupon: { code: 'PROMO10', type: 'Percentage' as const, value: 10, discount: 1 },
    };
    expect(cartReducer(withCoupon, removeCoupon()).coupon).toBeNull();
    expect(cartReducer(withCoupon, clearCart()).coupon).toBeNull();
  });

  it('increments quantity when adding an existing product', () => {
    let state = cartReducer(initialState, addToCart(product));
    state = cartReducer(state, addToCart(product));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('removes a product entirely', () => {
    const populated = cartReducer(initialState, addToCart(product));
    const state = cartReducer(populated, removeFromCart({ productId: product.id }));
    expect(state.items).toHaveLength(0);
  });

  it('updates quantity to a specific value', () => {
    const populated = cartReducer(initialState, addToCart(product));
    const state = cartReducer(
      populated,
      updateQuantity({ productId: product.id, quantity: 5 })
    );
    expect(state.items[0].quantity).toBe(5);
  });

  it('removes the item when updated quantity is zero or less', () => {
    const populated = cartReducer(initialState, addToCart(product));
    const state = cartReducer(
      populated,
      updateQuantity({ productId: product.id, quantity: 0 })
    );
    expect(state.items).toHaveLength(0);
  });

  it('removes the item when decrementing from quantity 1', () => {
    const populated = cartReducer(initialState, addToCart(product));
    const state = cartReducer(populated, decrementQuantity({ productId: product.id }));
    expect(state.items).toHaveLength(0);
  });

  it('increments quantity by one', () => {
    const populated = cartReducer(initialState, addToCart(product));
    const state = cartReducer(populated, incrementQuantity({ productId: product.id }));
    expect(state.items[0].quantity).toBe(2);
  });

  it('keeps one line per size for the same product', () => {
    let state = cartReducer(initialState, addManyToCart({ product, quantity: 1, size: '42' }));
    state = cartReducer(state, addManyToCart({ product, quantity: 2, size: '43' }));
    state = cartReducer(state, addManyToCart({ product, quantity: 1, size: '42' }));
    expect(state.items).toHaveLength(2);
    expect(state.items.find((i) => i.size === '42')?.quantity).toBe(2);

    state = cartReducer(state, removeFromCart({ productId: product.id, size: '42' }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].size).toBe('43');
  });

  it('clears the cart', () => {
    const populated = cartReducer(initialState, addToCart(product));
    const state = cartReducer(populated, clearCart());
    expect(state.items).toHaveLength(0);
  });
});

describe('cart selectors', () => {
  it('computes the total price', () => {
    let state = cartReducer(initialState, addToCart(product));
    state = cartReducer(state, incrementQuantity({ productId: product.id }));
    expect(selectCartTotal({ cart: state })).toBe(20);
  });

  it('computes the total item count', () => {
    let state = cartReducer(initialState, addToCart(product));
    state = cartReducer(state, incrementQuantity({ productId: product.id }));
    expect(selectCartItemCount({ cart: state })).toBe(2);
  });
});
