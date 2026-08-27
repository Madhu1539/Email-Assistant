import { create } from 'zustand';

/**
 * Gmail Store
 *
 * Stores only the Gmail connection status and email address.
 * FORBIDDEN: Gmail access tokens, refresh tokens, OAuth credentials.
 */
const useGmailStore = create((set) => ({
  isConnected: false,
  gmailEmail: null,

  setGmailStatus: ({ isConnected, email }) =>
    set({ isConnected, gmailEmail: email || null }),

  clearGmailStatus: () => set({ isConnected: false, gmailEmail: null }),
}));

export default useGmailStore;
