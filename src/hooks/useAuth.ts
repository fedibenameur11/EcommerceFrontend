import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, setLoading, setError } from '@/store/slices/authSlice';
import { setToken, setUser, clearAuth } from '@/services/storage/tokenService';
import authService from '@/services/api/authService';
import userService from '@/services/api/userService';
import { getErrorMessage, parseError } from '@/utils/errorHandler';
import type { LoginRequest, RegisterRequest } from '@/models/auth';
import type { RootState } from '@/store/store';

/**
 * useAuth Hook
 * Provides authentication functionality and state
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(setLoading(true));
        const { token } = await authService.login(credentials);
        setToken(token);
        // Le login ne renvoie que le JWT : on charge le profil avec ce token
        const profile = await userService.getCurrentUser();
        setUser(profile);
        dispatch(login(profile));
        return profile;
      } catch (err) {
        clearAuth();
        const message =
          parseError(err).status === 401
            ? 'E-mail ou mot de passe incorrect.'
            : getErrorMessage(err);
        dispatch(setError(message));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handleRegister = useCallback(
    async (data: RegisterRequest) => {
      try {
        dispatch(setLoading(true));
        // L'inscription ne connecte pas : l'utilisateur doit ensuite se connecter
        return await authService.register(data);
      } catch (err) {
        dispatch(setError(getErrorMessage(err)));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    clearAuth();
    dispatch(logout());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};

export default useAuth;
