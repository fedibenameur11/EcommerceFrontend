import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/**
 * DeliveryRoute Component
 * Redirects to home if user is not a delivery person (livreur)
 */
export const DeliveryRoute = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || user?.role !== 'Delivery') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default DeliveryRoute;
