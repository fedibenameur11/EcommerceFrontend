/**
 * Application Constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7220/api',
  TIMEOUT: 10000,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Cart
export const CART = {
  STORAGE_KEY: 'cart_items',
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999,
};

// Auth
export const AUTH = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'Customer',
  ADMIN: 'Admin',
  SELLER: 'Seller',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur r�seau. Veuillez v�rifier votre connexion.',
  UNAUTHORIZED: 'Vous n\'�tes pas autoris� � acc�der � cette ressource.',
  NOT_FOUND: 'La ressource n\'a pas �t� trouv�e.',
  VALIDATION_ERROR: 'Les donn�es saisies sont invalides.',
  SERVER_ERROR: 'Une erreur serveur est survenue. Veuillez r�essayer plus tard.',
  UNKNOWN_ERROR: 'Une erreur inattendue est survenue.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion r�ussie!',
  REGISTER_SUCCESS: 'Inscription r�ussie! Veuillez vous connecter.',
  LOGOUT_SUCCESS: 'D�connexion r�ussie.',
  PRODUCT_ADDED_TO_CART: 'Produit ajout� au panier.',
  ORDER_CREATED: 'Commande cr��e avec succ�s.',
  PROFILE_UPDATED: 'Profil mis � jour avec succ�s.',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CATEGORIES: '/categories',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ORDERS: '/orders',
  ADMIN: '/admin',
  NOT_FOUND: '*',
} as const;
