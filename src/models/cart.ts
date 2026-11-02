/**
 * Cart Models (server-side cart, see CartsController)
 */

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}
