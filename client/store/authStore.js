import { create } from 'zustand';
import api from '../services/api';

/**
 * Auth Store
 *
 * Allowed to store: user profile data, loading state, authentication flag.
 * FORBIDDEN: JWT tokens, passwords, OAuth tokens, API keys, encryption keys.
 */
const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // True until initial auth check completes

  /**
   * Initialize auth state on app load by calling /auth/me.
   * Sets isLoading=false when complete regardless of outcome.
   */
  initAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      const { user } = response.data.data;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Called after successful login.
   * @param {object} user - User profile (no password)
   */
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  /**
   * Called after logout — clears all auth state.
   */
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));

export default useAuthStore;
