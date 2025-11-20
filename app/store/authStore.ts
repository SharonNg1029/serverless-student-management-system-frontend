import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: (userData: User) => {
        // Lưu token vào localStorage
        localStorage.setItem('token', userData.token);
        
        set({
          user: userData,
          token: userData.token,
          isAuthenticated: true,
          error: null,
        });
      },

      // Logout action
      logout: () => {
        // Xóa token khỏi localStorage
        localStorage.removeItem('token');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Update user action
      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      // Set loading state
      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      // Set error
      setError: (error: string | null) =>
        set({ error }),

      // Clear error
      clearError: () =>
        set({ error: null }),
    }),
    {
      name: 'auth-storage', // key trong localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
