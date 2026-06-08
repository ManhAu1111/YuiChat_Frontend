<script setup>
import { computed, ref } from 'vue';
import { useFriendshipStore } from '../../../stores/friendshipStore';

const props = defineProps({
  /**
   * The UUID / numeric ID of the user whose friendship status we're reflecting.
   */
  targetUserId: {
    type: [String, Number],
    required: true,
  },
  /**
   * If true, buttons will only show icons without text to save horizontal space.
   */
  iconOnly: {
    type: Boolean,
    default: false,
  }
});

const friendshipStore = useFriendshipStore();

// Derive the current status from the store via the getter
const status = computed(() => friendshipStore.getStatus(props.targetUserId));

// Per-button loading flags for tight UX feedback
const loadingAction = ref(null); // 'add' | 'cancel' | 'accept' | 'decline' | 'unfriend'

// ── Action handlers ───────────────────────────────────────────────────────────

async function handleAddFriend() {
  if (loadingAction.value) return;
  loadingAction.value = 'add';
  try {
    await friendshipStore.sendRequest(props.targetUserId);
  } catch {
    // Error already logged in store; a toast can be added here if desired
  } finally {
    loadingAction.value = null;
  }
}

async function handleCancel() {
  if (loadingAction.value) return;
  loadingAction.value = 'cancel';
  try {
    await friendshipStore.cancelRequest(props.targetUserId);
  } catch {
    //
  } finally {
    loadingAction.value = null;
  }
}

async function handleAccept() {
  if (loadingAction.value) return;
  loadingAction.value = 'accept';
  try {
    await friendshipStore.acceptRequest(props.targetUserId);
  } catch {
    //
  } finally {
    loadingAction.value = null;
  }
}

async function handleDecline() {
  if (loadingAction.value) return;
  loadingAction.value = 'decline';
  try {
    await friendshipStore.declineRequest(props.targetUserId);
  } catch {
    //
  } finally {
    loadingAction.value = null;
  }
}

async function handleUnfriend() {
  if (loadingAction.value) return;
  loadingAction.value = 'unfriend';
  try {
    await friendshipStore.unfriend(props.targetUserId);
  } catch {
    //
  } finally {
    loadingAction.value = null;
  }
}
</script>

<template>
  <!-- ── ACCEPTED ── -->
  <div v-if="status === 'accepted'" class="fb-group">
    <!-- "Friends" pill — static, secondary style -->
    <button :class="['fb-btn fb-btn--secondary', { 'fb-btn--icon-only': iconOnly }]" disabled aria-label="Bạn bè" title="Bạn bè">
      <svg class="fb-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>
      <span v-if="!iconOnly">Bạn bè</span>
    </button>
    
    <!-- "Unfriend" — ghost danger -->
    <button
      :class="['fb-btn fb-btn--ghost fb-btn--danger', { 'fb-btn--icon-only': iconOnly }]"
      :disabled="loadingAction !== null"
      :aria-busy="loadingAction === 'unfriend'"
      @click="handleUnfriend"
      aria-label="Hủy kết bạn"
      title="Hủy kết bạn"
    >
      <span v-if="loadingAction === 'unfriend'" class="fb-spinner" aria-hidden="true" />
      <template v-else>
        <svg v-if="iconOnly" class="fb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        <span v-if="!iconOnly">Hủy kết bạn</span>
      </template>
    </button>
  </div>

  <!-- ── PENDING SENT ── -->
  <div v-else-if="status === 'pending_sent'" class="fb-group">
    <!-- "Requested" pill — disabled primary look -->
    <button :class="['fb-btn fb-btn--requested', { 'fb-btn--icon-only': iconOnly }]" disabled aria-label="Đã gửi lời mời" title="Đã gửi lời mời">
      <svg class="fb-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"/>
      </svg>
      <span v-if="!iconOnly">Đã gửi lời mời</span>
    </button>

    <!-- "Cancel request" — ghost -->
    <button
      :class="['fb-btn fb-btn--ghost fb-btn--danger', { 'fb-btn--icon-only': iconOnly }]"
      :disabled="loadingAction !== null"
      :aria-busy="loadingAction === 'cancel'"
      @click="handleCancel"
      aria-label="Hủy lời mời"
      title="Hủy lời mời"
    >
      <span v-if="loadingAction === 'cancel'" class="fb-spinner" aria-hidden="true" />
      <template v-else>
        <svg v-if="iconOnly" class="fb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        <span v-if="!iconOnly">Hủy lời mời</span>
      </template>
    </button>
  </div>

  <!-- ── PENDING RECEIVED ── -->
  <div v-else-if="status === 'pending_received'" class="fb-group">
    <!-- Accept — primary blue -->
    <button
      :class="['fb-btn fb-btn--primary', { 'fb-btn--icon-only': iconOnly }]"
      :disabled="loadingAction !== null"
      :aria-busy="loadingAction === 'accept'"
      @click="handleAccept"
      aria-label="Chấp nhận lời mời kết bạn"
      title="Chấp nhận"
    >
      <span v-if="loadingAction === 'accept'" class="fb-spinner fb-spinner--light" aria-hidden="true" />
      <template v-else>
        <svg v-if="iconOnly" class="fb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 13l4 4L19 7"/>
        </svg>
        <span v-if="!iconOnly">Chấp nhận</span>
      </template>
    </button>

    <!-- Decline — ghost -->
    <button
      :class="['fb-btn fb-btn--ghost fb-btn--danger', { 'fb-btn--icon-only': iconOnly }]"
      :disabled="loadingAction !== null"
      :aria-busy="loadingAction === 'decline'"
      @click="handleDecline"
      aria-label="Từ chối lời mời kết bạn"
      title="Từ chối"
    >
      <span v-if="loadingAction === 'decline'" class="fb-spinner" aria-hidden="true" />
      <template v-else>
        <svg v-if="iconOnly" class="fb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        <span v-if="!iconOnly">Từ chối</span>
      </template>
    </button>
  </div>

  <!-- ── NO RELATIONSHIP ── -->
  <div v-else class="fb-group">
    <button
      :class="['fb-btn fb-btn--primary', { 'fb-btn--icon-only': iconOnly }]"
      :disabled="loadingAction !== null"
      :aria-busy="loadingAction === 'add'"
      @click="handleAddFriend"
      aria-label="Thêm bạn bè"
      title="Thêm bạn bè"
    >
      <span v-if="loadingAction === 'add'" class="fb-spinner fb-spinner--light" aria-hidden="true" />
      <template v-else>
        <svg class="fb-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
        </svg>
        <span v-if="!iconOnly">Thêm bạn</span>
      </template>
    </button>
  </div>
</template>

<style scoped>
/*
 * Apple Design System — FriendshipButton
 * Font family: SF Pro Text with Inter as web fallback.
 * Colors strictly from DESIGN.md.
 */

/* ── Group wrapper — keeps buttons side-by-side ── */
.fb-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

/* ── Base button ── */
.fb-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  font-family: 'SF Pro Text', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 13px;          /* below 14px caption range — compact list context */
  font-weight: 400;
  letter-spacing: -0.224px;
  line-height: 1.43;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
  outline: none;
  position: relative;
  overflow: hidden; /* clip the spinner */
}

/* Modifier for icon-only circular buttons */
.fb-btn--icon-only {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
}

.fb-btn:focus-visible {
  outline: 2px solid #0071e3;
  outline-offset: 2px;
}

.fb-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ── Primary (Apple Blue) ── */
.fb-btn--primary {
  background: #0071e3;
  color: #ffffff;
  border-color: transparent;
}

.fb-btn--primary:not(:disabled):hover {
  background: #0077ed;
}

.fb-btn--primary:not(:disabled):active {
  background: #006edb;
}

/* ── Requested (muted blue — communicates "done / waiting") ── */
.fb-btn--requested {
  background: rgba(0, 113, 227, 0.12);
  color: #0071e3;
  border-color: rgba(0, 113, 227, 0.2);
}

/* ── Secondary (neutral — "Friends" badge) ── */
.fb-btn--secondary {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.6);
  border-color: rgba(0, 0, 0, 0.08);
}

/* ── Ghost (outline only) ── */
.fb-btn--ghost {
  background: transparent;
  color: rgba(0, 0, 0, 0.6);
  border-color: rgba(0, 0, 0, 0.15);
}

.fb-btn--ghost:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.2);
}

.fb-btn--ghost:not(:disabled):active {
  background: rgba(0, 0, 0, 0.08);
}

/* Danger variant of ghost — used for "Unfriend" */
.fb-btn--ghost.fb-btn--danger {
  color: #c0392b;       /* accessible red, not in Apple palette but universally understood */
  border-color: rgba(192, 57, 43, 0.25);
}

.fb-btn--ghost.fb-btn--danger:not(:disabled):hover {
  background: rgba(192, 57, 43, 0.06);
  border-color: rgba(192, 57, 43, 0.35);
}

/* ── Icon inside buttons ── */
.fb-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ── Spinner (loading indicator) ── */
.fb-spinner {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  animation: fb-spin 0.65s linear infinite;
}

.fb-spinner--light {
  border-color: rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
}

@keyframes fb-spin {
  to { transform: rotate(360deg); }
}

/*
 * Dark context override — when this component sits inside the dark sidebar
 * (background: #1d1d1f / #000).  Parent adds data-theme="dark" or a
 * .dark-surface class to enable these overrides.
 */
:global(.apple-sidebar) .fb-btn--ghost,
:global(.dark-surface) .fb-btn--ghost,
:global(.apple-sidebar) .fb-btn--secondary,
:global(.dark-surface) .fb-btn--secondary {
  color: rgba(255, 255, 255, 0.55);
  border-color: rgba(255, 255, 255, 0.15);
}

:global(.apple-sidebar) .fb-btn--ghost:not(:disabled):hover,
:global(.dark-surface) .fb-btn--ghost:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.8);
}

:global(.apple-sidebar) .fb-btn--requested,
:global(.dark-surface) .fb-btn--requested {
  background: rgba(0, 113, 227, 0.18);
  color: #2997ff; /* bright blue for dark bg per DESIGN.md */
  border-color: rgba(41, 151, 255, 0.3);
}
</style>
