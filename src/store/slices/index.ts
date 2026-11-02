// Export reducers
export { default as authReducer } from './authSlice';
export { default as cartReducer } from './cartSlice';
export { default as categoryReducer } from './categorySlice';
export { default as orderReducer } from './orderSlice';
export { default as productReducer } from './productSlice';
export { default as userReducer } from './userSlice';

// Export only named actions to avoid conflicts
// Auth actions
export {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  setLoading as authSetLoading,
  setError as authSetError,
  clearError as authClearError,
} from './authSlice';

// Cart actions
export * from './cartSlice';

// Category actions
export {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setLoading as categorySetLoading,
  setError as categorySetError,
} from './categorySlice';

// Order actions
export {
  setOrders,
  addOrder,
  updateOrder,
  removeOrder,
  setPagination,
  setLoading as orderSetLoading,
  setError as orderSetError,
} from './orderSlice';

// Product actions
export * from './productSlice';

// User actions
export {
  setCurrentUser,
  updateCurrentUser,
  setUsers,
  updateUser,
  removeUser,
  setPagination as userSetPagination,
  setLoading as userSetLoading,
  setError as userSetError,
  clearCurrentUser,
} from './userSlice';
