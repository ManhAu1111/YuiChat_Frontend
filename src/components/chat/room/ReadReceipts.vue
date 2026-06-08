<template>
  <div v-if="isMine && readReceipts.length > 0" class="flex flex-wrap justify-end gap-1 w-full mt-0.5 pr-1">
    <img
      v-for="user in readReceipts"
      :key="user.id"
      :src="user.avatar ? getFileUrl(user.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&size=32`"
      :title="user.name"
      class="w-[14px] h-[14px] rounded-full object-cover shadow-sm border border-white dark:border-gray-800"
      alt="Seen by"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { useChatStore } from '../../../stores/chatStore';
import { getFileUrl } from '../../../services/api';

const props = defineProps({
  msg: { type: Object, required: true },
  isMine: { type: Boolean, required: true },
  participants: { type: Array, required: true }
});

const authStore = useAuthStore();
const chatStore = useChatStore();

const readReceipts = computed(() => {
  if (!props.isMine) return [];
  const msgId = props.msg._id || props.msg.id;
  if (!msgId || String(msgId).startsWith('temp_')) return [];
  
  const msgs = chatStore.currentMessages;
  const currentIndex = msgs.findIndex(m => (m._id || m.id) === msgId);
  
  const readers = props.participants.filter(p => {
      if (p.user_id === authStore.user?.id || !p.last_read_message_id) return false;
      if (msgId > p.last_read_message_id) return false;
      
      if (currentIndex !== -1) {
          for (let i = currentIndex + 1; i < msgs.length; i++) {
              const m = msgs[i];
              const mId = m._id || m.id;
              if (m.sender_id === authStore.user?.id && mId <= p.last_read_message_id) {
                  return false; 
              }
          }
      }
      return true;
  });
  
  return readers.map(r => r.user).filter(u => u);
});
</script>
