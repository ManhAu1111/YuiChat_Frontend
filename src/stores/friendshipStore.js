import { defineStore } from 'pinia';
import api from '../services/api';

const STORAGE_KEY = 'friendship_states';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return { accepted: [], pending_sent: [], pending_received: [] };
}

function saveToStorage(states) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {
    // ignore storage errors (quota, private mode, etc.)
  }
}

export const useFriendshipStore = defineStore('friendship', {
  state: () => ({
    friendshipStates: loadFromStorage(),
    friends: [],
    isLoadingFriends: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    /**
     * Returns the friendship status string for a given user ID.
     * Possible values: 'accepted' | 'pending_sent' | 'pending_received' | null
     */
    getStatus: (state) => (userId) => {
      const id = String(userId);
      if (state.friendshipStates.accepted.includes(id)) return 'accepted';
      if (state.friendshipStates.pending_sent.includes(id)) return 'pending_sent';
      if (state.friendshipStates.pending_received.includes(id)) return 'pending_received';
      return null;
    },
  },

  actions: {
    /**
     * Sync the three arrays after every mutation so localStorage stays current.
     */
    _persist() {
      saveToStorage(this.friendshipStates);
    },

    /**
     * Fetch all friendship states from the server and replace local state.
     * GET /api/friendship-states
     * Expected response: { accepted: [...], pending_sent: [...], pending_received: [...] }
     */
    async fetchStates() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/friendship-states');
        const data = response.data.data;
        this.friendshipStates = {
          accepted: (data.accepted ?? []).map(String),
          pending_sent: (data.pending_sent ?? []).map(String),
          pending_received: (data.pending_received ?? []).map(String),
        };
        this._persist();
      } catch (err) {
        this.error = err?.response?.data?.message ?? 'Failed to fetch friendship states.';
        console.error('[FriendshipStore] fetchStates error:', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Fetch the detailed list of accepted friends.
     * GET /api/friends
     */
    async fetchFriends() {
      this.isLoadingFriends = true;
      try {
        const response = await api.get('/friends');
        this.friends = response.data.data || [];
      } catch (err) {
        console.error('[FriendshipStore] fetchFriends error:', err);
      } finally {
        this.isLoadingFriends = false;
      }
    },

    /**
     * Send a friend request.
     * POST /api/friendships/request  { friend_id: friendId }
     */
    async sendRequest(friendId) {
      const id = String(friendId);
      // Optimistic update
      if (!this.friendshipStates.pending_sent.includes(id)) {
        this.friendshipStates.pending_sent.push(id);
        this._persist();
      }
      try {
        await api.post('/friendships/request', { friend_id: friendId });
      } catch (err) {
        // Roll back optimistic update
        this.friendshipStates.pending_sent = this.friendshipStates.pending_sent.filter(v => v !== id);
        this._persist();
        this.error = err?.response?.data?.message ?? 'Failed to send friend request.';
        console.error('[FriendshipStore] sendRequest error:', err);
        throw err;
      }
    },

    /**
     * Cancel a sent friend request.
     * DELETE /api/friendships/decline  { friend_id: friendId }
     */
    async cancelRequest(friendId) {
      const id = String(friendId);
      // Optimistic update
      this.friendshipStates.pending_sent = this.friendshipStates.pending_sent.filter(v => v !== id);
      this._persist();
      try {
        await api.delete('/friendships/decline', { data: { friend_id: friendId } });
      } catch (err) {
        // Roll back
        if (!this.friendshipStates.pending_sent.includes(id)) {
          this.friendshipStates.pending_sent.push(id);
          this._persist();
        }
        this.error = err?.response?.data?.message ?? 'Failed to cancel friend request.';
        console.error('[FriendshipStore] cancelRequest error:', err);
        throw err;
      }
    },

    /**
     * Accept an incoming friend request.
     * POST /api/friendships/accept  { friend_id: friendId }
     */
    async acceptRequest(friendId) {
      const id = String(friendId);
      // Optimistic update: move from pending_received → accepted
      this.friendshipStates.pending_received = this.friendshipStates.pending_received.filter(v => v !== id);
      if (!this.friendshipStates.accepted.includes(id)) {
        this.friendshipStates.accepted.push(id);
      }
      this._persist();
      try {
        await api.post('/friendships/accept', { friend_id: friendId });
      } catch (err) {
        // Roll back
        this.friendshipStates.accepted = this.friendshipStates.accepted.filter(v => v !== id);
        if (!this.friendshipStates.pending_received.includes(id)) {
          this.friendshipStates.pending_received.push(id);
        }
        this._persist();
        this.error = err?.response?.data?.message ?? 'Failed to accept friend request.';
        console.error('[FriendshipStore] acceptRequest error:', err);
        throw err;
      }
    },

    /**
     * Decline an incoming friend request.
     * DELETE /api/friendships/decline  { friend_id: friendId }
     */
    async declineRequest(friendId) {
      const id = String(friendId);
      // Optimistic update
      this.friendshipStates.pending_received = this.friendshipStates.pending_received.filter(v => v !== id);
      this._persist();
      try {
        await api.delete('/friendships/decline', { data: { friend_id: friendId } });
      } catch (err) {
        // Roll back
        if (!this.friendshipStates.pending_received.includes(id)) {
          this.friendshipStates.pending_received.push(id);
          this._persist();
        }
        this.error = err?.response?.data?.message ?? 'Failed to decline friend request.';
        console.error('[FriendshipStore] declineRequest error:', err);
        throw err;
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Real-time updates via Laravel Echo / Pusher
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Subscribe to the authenticated user's private notification channel.
     * Call this once after login / app mount (when userId is known).
     *
     * Laravel broadcasts all database notifications on:
     *   App.Models.User.{userId}   (via BroadcastNotificationCreated)
     *
     * We listen for three notification types:
     *   - FriendRequestNoti   → push sender_id into pending_received
     *   - FriendAcceptedNoti  → move the ID from pending_sent → accepted
     *   - FriendDeclinedNoti  → remove from pending_sent
     */
    listenForRealTimeUpdates(userId) {
      if (!window.Echo || !userId) return;

      window.Echo.private(`App.Models.User.${userId}`)
        .notification((notification) => {
          const type = notification.type ?? '';
          const senderId = String(notification.sender_id ?? '');
          if (!senderId) return;

          // ── Incoming friend request ──────────────────────────────────────
          if (type.endsWith('FriendRequestNoti')) {
            if (!this.friendshipStates.pending_received.includes(senderId)) {
              this.friendshipStates.pending_received.push(senderId);
              this._persist();
            }
          }

          // ── Receiver accepted our sent request ───────────────────────────
          if (type.endsWith('FriendAcceptedNoti')) {
            this.friendshipStates.pending_sent =
              this.friendshipStates.pending_sent.filter(v => v !== senderId);
            if (!this.friendshipStates.accepted.includes(senderId)) {
              this.friendshipStates.accepted.push(senderId);
            }
            this._persist();
          }

          // ── Receiver declined our sent request ───────────────────────────
          if (type.endsWith('FriendDeclinedNoti')) {
            this.friendshipStates.pending_sent =
              this.friendshipStates.pending_sent.filter(v => v !== senderId);
            this._persist();
          }
        });
    },

    /**
     * Stop listening on the user's private notification channel.
     * Call on logout.
     */
    stopListening(userId) {
      if (window.Echo && userId) {
        window.Echo.leave(`App.Models.User.${userId}`);
      }
    },

    /**
     * Unfriend an existing friend.
     * DELETE /api/friendships/unfriend  { friend_id: friendId }
     */
    async unfriend(friendId) {
      const id = String(friendId);
      // Optimistic update
      this.friendshipStates.accepted = this.friendshipStates.accepted.filter(v => v !== id);
      this._persist();
      try {
        await api.delete('/friendships/unfriend', { data: { friend_id: friendId } });
      } catch (err) {
        // Roll back
        if (!this.friendshipStates.accepted.includes(id)) {
          this.friendshipStates.accepted.push(id);
          this._persist();
        }
        this.error = err?.response?.data?.message ?? 'Failed to unfriend.';
        console.error('[FriendshipStore] unfriend error:', err);
        throw err;
      }
    },
  },
});
