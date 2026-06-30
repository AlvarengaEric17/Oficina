import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: authService.getStoredUser(),
  token: authService.getToken(),
  isLoading: false,
  error: null,
  isAuthenticated: !!authService.getToken(),

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  initAuth: () => {
    const token = authService.getToken();
    const user = authService.getStoredUser();
    set({
      token,
      user,
      isAuthenticated: !!token,
    });
  },
}));
