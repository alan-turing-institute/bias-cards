import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateTokens: (
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isTokenExpired: () => boolean;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear all localStorage data related to auth
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bias-cards-auth');
        }
      },

      updateTokens: (accessToken, refreshToken, expiresIn) => {
        const currentUser = get().user;
        if (currentUser) {
          const expiresAt = expiresIn
            ? Date.now() + expiresIn * 1000
            : undefined;

          set({
            user: {
              ...currentUser,
              accessToken,
              refreshToken: refreshToken || currentUser.refreshToken,
              expiresAt,
            },
          });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      isTokenExpired: () => {
        const user = get().user;
        if (!user?.expiresAt) {
          return false;
        }
        return Date.now() > user.expiresAt;
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },
    }),
    {
      name: 'bias-cards-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
