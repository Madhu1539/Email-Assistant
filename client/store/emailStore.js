import { create } from 'zustand';

/**
 * Email Store
 *
 * Manages email list, selected email, pagination tokens, and search results.
 */
const useEmailStore = create((set) => ({
  // Inbox
  emails: [],
  nextPageToken: null,
  hasMore: false,

  // Selected email (detail view)
  selectedEmail: null,

  // Thread view
  currentThread: null,

  // Search
  searchResults: [],
  searchNextPageToken: null,
  searchHasMore: false,

  // ── Inbox actions ─────────────────────────────────────────────────────────
  setEmails: (emails, nextPageToken, hasMore) =>
    set({ emails, nextPageToken, hasMore }),

  appendEmails: (newEmails, nextPageToken, hasMore) =>
    set((state) => ({
      emails: [...state.emails, ...newEmails],
      nextPageToken,
      hasMore,
    })),

  updateEmailInList: (messageId, updates) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        e.messageId === messageId ? { ...e, ...updates } : e
      ),
    })),

  removeEmailFromList: (messageId) =>
    set((state) => ({
      emails: state.emails.filter((e) => e.messageId !== messageId),
    })),

  // ── Email detail actions ────────────────────────────────────────────────────
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  clearSelectedEmail: () => set({ selectedEmail: null }),

  // ── Thread actions ──────────────────────────────────────────────────────────
  setCurrentThread: (thread) => set({ currentThread: thread }),
  clearCurrentThread: () => set({ currentThread: null }),

  // ── Search actions ──────────────────────────────────────────────────────────
  setSearchResults: (results, nextPageToken, hasMore) =>
    set({ searchResults: results, searchNextPageToken: nextPageToken, searchHasMore: hasMore }),

  appendSearchResults: (newResults, nextPageToken, hasMore) =>
    set((state) => ({
      searchResults: [...state.searchResults, ...newResults],
      searchNextPageToken: nextPageToken,
      searchHasMore: hasMore,
    })),

  clearSearchResults: () =>
    set({ searchResults: [], searchNextPageToken: null, searchHasMore: false }),
}));

export default useEmailStore;
