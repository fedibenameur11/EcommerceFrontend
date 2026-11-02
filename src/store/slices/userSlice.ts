import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/models/user';

interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    setPagination: (
      state,
      action: PayloadAction<{
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalCount: number;
      }>
    ) => {
      state.pagination = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const {
  setCurrentUser,
  updateCurrentUser,
  setUsers,
  updateUser,
  removeUser,
  setPagination,
  setLoading,
  setError,
  clearCurrentUser,
} = userSlice.actions;
export default userSlice.reducer;
