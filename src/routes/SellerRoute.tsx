import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/**
 * SellerRoute Component
 * Redirects to home if user is not a seller
 */
export const SellerRoute = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || user?.role !== 'Seller') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SellerRoute;