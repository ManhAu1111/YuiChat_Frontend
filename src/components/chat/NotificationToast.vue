<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore';
import { useFriendshipStore } from '../../stores/friendshipStore';
import { useThemeStore } from '../../stores/themeStore';
import NotificationItem from './NotificationItem.vue';

const notificationStore = useNotificationStore();
const friendshipStore = useFriendshipStore();
const themeStore = useThemeStore();

const dismissToast = (noti) => {
  notificationStore.dismissToast(noti.id);
};

const handleAcceptFromToast = (noti) => {
  notificationStore.dismissToast(noti.id);
};

const handleDeclineFromToast = (noti) => {
  notificationStore.dismissToast(noti.id);
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-0 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
         style="z-index: 9999; padding-top: 16px; padding-left: 16px; padding-right: 16px;">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col items-center gap-2 w-full"
        style="max-width: 420px;"
      >
        <div
          v-for="noti in notificationStore.toastQueue"
          :key="noti.id"
          class="w-full pointer-events-auto"
          @click="dismissToast(noti)"
        >
          <NotificationItem
            :noti="noti"
            :compact="true"
            @accept="handleAcceptFromToast"
            @decline="handleDeclineFromToast"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* Toast slide-in/out animation */
.toast-enter-active {
  animation: toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  animation: toast-slide-out 0.35s cubic-bezier(0.55, 0, 1, 0.45);
}

.toast-move {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-100%) scale(0.92);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-slide-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-60%) scale(0.92);
  }
}
</style>
