import { create } from 'zustand';

/**
 * UI Store
 *
 * Manages loading states, error states, and toast notifications.
 */
const useUiStore = create((set) => ({
  // Loading states keyed by operation name
  loading: {},

  // Error states keyed by operation name
  errors: {},

  // Toast notifications queue
  toasts: [],

  // ── Loading ───────────────────────────────────────────────────────────────
  setLoading: (key, isLoading) =>
    set((state) => ({
      loading: { ...state.loading, [key]: isLoading },
    })),

  // ── Errors ────────────────────────────────────────────────────────────────
  setError: (key, message) =>
    set((state) => ({
      errors: { ...state.errors, [key]: message },
    })),

  clearError: (key) =>
    set((state) => {
      const errors = { ...state.errors };
      delete errors[key];
      return { errors };
    }),

  // ── Toasts ────────────────────────────────────────────────────────────────
  addToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Date.now() + Math.random(), message, type },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Convenience helpers
  showSuccess: (message) => {
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Date.now() + Math.random(), message, type: 'success' },
      ],
    }));
  },

  showError: (message) => {
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Date.now() + Math.random(), message, type: 'error' },
      ],
    }));
  },
}));

export default useUiStore;
