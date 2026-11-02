import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { SellerRoute } from './SellerRoute';
import { DeliveryRoute } from './DeliveryRoute';

// Pages - Public
import { HomePage } from '@/pages/HomePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CategoriesPage } from '@/pages/categories/CategoriesPage';
import { LoginPage } from '@/pages/login/LoginPage';
import { RegisterPage } from '@/pages/register/RegisterPage';
import { ForgotPasswordPage } from '@/pages/forgot-password/ForgotPasswordPage';

// Pages - Protected
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { WishlistPage } from '@/pages/wishlist/WishlistPage';

// Pages - Seller
import { SellerProductsPage } from '@/pages/seller/SellerProductsPage';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { SellerDashboardPage } from '@/pages/seller/SellerDashboardPage';
import { SellerOrdersPage } from '@/pages/seller/SellerOrdersPage';
import { MyReturnsPage } from '@/pages/returns/MyReturnsPage';

// Pages - Delivery (livreur)
import { DeliveryLayout } from '@/components/delivery/DeliveryLayout';
import { DeliveryOrdersPage } from '@/pages/delivery/DeliveryOrdersPage';
import { DeliveryStatsPage } from '@/pages/delivery/DeliveryStatsPage';

// Pages - Admin
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { AdminReturnsPage } from '@/pages/admin/AdminReturnsPage';
// Pages - Error
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';

/**
 * Application Routes Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public routes
      { index: true, element: <HomePage /> },
      { path: 'products', element: <Navigate to="/" replace /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },

      // Protected routes (JWT requis côté API)
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'wishlist', element: <WishlistPage /> },
          { path: 'returns', element: <MyReturnsPage /> },
        ],
      },

      // Seller routes
      {
        element: <SellerRoute />,
        children: [
          {
            path: 'seller',
            element: <SellerLayout />,
            children: [
              { index: true, element: <SellerDashboardPage /> },
              { path: 'products', element: <SellerProductsPage /> },
              { path: 'orders', element: <SellerOrdersPage /> },
            ],
          },
        ],
      },

      // Delivery routes
      {
        element: <DeliveryRoute />,
        children: [
          {
            path: 'delivery',
            element: <DeliveryLayout />,
            children: [
              { index: true, element: <DeliveryOrdersPage /> },
              { path: 'stats', element: <DeliveryStatsPage /> },
            ],
          },
        ],
      },

      // Admin routes
      {
        element: <AdminRoute />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'analytics', element: <AdminAnalyticsPage /> },
              { path: 'products', element: <AdminProductsPage /> },
              { path: 'categories', element: <AdminCategoriesPage /> },
              { path: 'orders', element: <AdminOrdersPage /> },
              { path: 'orders/:id', element: <AdminOrderDetailPage /> },
              { path: 'coupons', element: <AdminCouponsPage /> },
              { path: 'returns', element: <AdminReturnsPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'audit', element: <AdminAuditPage /> },
            ],
          },
        ],
      },

      // 404 - Not Found
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
