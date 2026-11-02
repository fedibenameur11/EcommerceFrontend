import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/models/auth';
import { getUser, isAuthenticated as hasValidToken, clearAuth } from '@/services/storage/tokenService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Restaure la session au rechargement de la page (token valide + profil stocké)
const loadSession = (): User | null => {
  if (!hasValidToken()) {
    clearAuth();
    return null;
  }
  return getUser() as User | null;
};

const storedUser = loadSession();

const initialState: AuthState = {
  user: storedUser,
  isAuthenticated: storedUser !== null,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    register: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { login, logout, register, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;
