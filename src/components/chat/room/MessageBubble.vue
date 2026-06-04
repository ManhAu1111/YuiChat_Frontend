<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { useChatStore } from '../../../stores/chatStore';
import FileCard from '../media/FileCard.vue';
import ImageLightbox from '../media/ImageLightbox.vue';

const props = defineProps({
  msg: { type: Object, required: true },
  isMine: { type: Boolean, default: false },
  sender: { type: Object, default: null },
  showAvatar: { type: Boolean, default: true },
  participants: { type: Array, default: () => [] },
  isGroup: { type: Boolean, default: false },
  showTimeAndStatus: { type: Boolean, default: true },
});

const authStore = useAuthStore();
const chatStore = useChatStore();
const lightboxSrc = ref(null);

const attachments = computed(() => props.msg.attachments || []);

const isImage = computed(() =>
  props.msg.type === 'image' ||
  (attachments.value.length > 0 && attachments.value[0].file_type?.startsWith('image/'))
);
const isFile = computed(() =>
  props.msg.type === 'file' ||
  (attachments.value.length > 0 && !attachments.value[0].file_type?.startsWith('image/'))
);

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const avatarUrl = computed(() => {
  const name = props.sender?.name || 'U';
  return props.sender?.avatar ? getFileUrl(props.sender.avatar) :
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=56`;
});

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.includes('/storage/')) {
    const path = url.substring(url.indexOf('/storage/'));
    return `http://${window.location.hostname}:8000${path}`;
  }
  return url;
};

const getGridClass = (index, total) => {
  if (total === 1) return 'col-span-6';
  
  let r3 = 0;
  if (total % 3 === 0) {
    r3 = total / 3;
  } else if (total % 3 === 1) {
    r3 = Math.floor(total / 3) - 1;
  } else {
    r3 = Math.floor(total / 3);
  }
  
  return index < r3 * 3 ? 'col-span-2' : 'col-span-3';
};

const messageStatus = computed(() => {
  if (!props.isMine) return null;
  if (props.msg.status === 'sending') return 'sending';
  if (props.msg.status === 'failed') return 'failed';
  
  const msgId = props.msg._id || props.msg.id;
  if (!msgId || String(msgId).startsWith('temp_')) return 'sending';

  if (!props.isGroup) {
      const otherP = props.participants.find(p => p.user_id !== authStore.user?.id);
      if (otherP) {
          if (otherP.last_read_message_id && msgId <= otherP.last_read_message_id) return 'read';
          if (otherP.last_delivered_message_id && msgId <= otherP.last_delivered_message_id) return 'delivered';
      }
      return 'sent';
  }
  return 'sent'; // groups use mini avatars
});

const groupReadReceipts = computed(() => {
    if (!props.isMine || !props.isGroup) return [];
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

<template>
  <div class="flex items-end gap-2" :class="isMine ? 'justify-end' : 'justify-start'">

    <!-- Avatar phía nhận -->
    <div v-if="!isMine" class="w-8 flex-shrink-0 flex justify-center mb-0.5">
      <img v-if="showAvatar" :src="avatarUrl" class="w-8 h-8 rounded-full object-cover transition-colors duration-300" style="background: var(--hover-bg);" :alt="sender?.name" />
      <div v-else class="w-8 h-8"></div>
    </div>

    <!-- Wrapper cho Bubble và Mini Avatars -->
    <div class="flex flex-col gap-1 max-w-[75%]" :class="isMine ? 'items-end' : 'items-start'">
      
      <!-- Bubble chứa nội dung -->
      <div
        class="relative overflow-hidden"
      :class="isMine ? 'bubble-sent' : 'bubble-received'"
      :style="[
        'letter-spacing:-0.2px; line-height:1.47; transition: background 0.3s, color 0.3s;',
        msg.is_sending ? 'opacity:0.65;' : ''
      ]"
    >
      <!-- TYPE: TEXT -->
      <template v-if="msg.type === 'text'">
        <div class="px-4 py-2.5 text-[15px]">
          <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
          <div v-if="showTimeAndStatus" class="flex justify-end mt-1 items-center gap-1">
            <span class="text-[10px] opacity-60 font-medium" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
            <template v-if="isMine && !isGroup">
                <!-- Status Icons for 1on1 -->
                <svg v-if="messageStatus === 'sending'" class="w-3 h-3 text-white/70 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else-if="messageStatus === 'sent'" class="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <svg v-else-if="messageStatus === 'delivered'" class="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" style="transform: translateX(4px)"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" style="transform: translateX(-4px)"></path></svg>
                <svg v-else-if="messageStatus === 'read'" class="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" style="transform: translateX(4px)"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" style="transform: translateX(-4px)"></path></svg>
            </template>
          </div>
        </div>
      </template>

      <!-- TYPE: IMAGE -->
      <template v-else-if="isImage">
        <div class="relative group h-full flex flex-col">
          <!-- Grid Layout -->
          <div class="grid grid-cols-6 gap-[2px]">
            <img
              v-for="(att, index) in attachments"
              :key="att.id || index"
              :src="getFileUrl(att.file_url)"
              :alt="att.file_name || 'Ảnh'"
              class="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
              :class="getGridClass(index, attachments.length)"
              :style="{
                maxHeight: attachments.length === 1 ? '350px' : '200px',
                aspectRatio: attachments.length === 1 ? 'auto' : '1'
              }"
              @click="lightboxSrc = getFileUrl(att.file_url)"
              loading="lazy"
            />
          </div>
          <!-- Time overlay on hover (only if no caption) -->
          <div v-if="!msg.content && showTimeAndStatus" class="absolute bottom-2 right-3 px-2 py-1 rounded-[8px] bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span class="text-[10px] text-white font-medium shadow-sm" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
          </div>

          <!-- Caption nếu có -->
          <div v-if="msg.content" class="px-4 py-2.5 text-[15px]">
            <p class="whitespace-pre-wrap break-words">
              {{ msg.content }}
            </p>
            <div v-if="showTimeAndStatus" class="flex justify-end mt-1 items-center gap-1">
              <span class="text-[10px] opacity-60 font-medium" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
              <template v-if="isMine && !isGroup">
                  <svg v-if="messageStatus === 'sending'" class="w-3 h-3 text-white/70 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else-if="messageStatus === 'sent'" class="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg v-else-if="messageStatus === 'delivered'" class="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" style="transform: translateX(4px)"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" style="transform: translateX(-4px)"></path></svg>
                  <svg v-else-if="messageStatus === 'read'" class="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" style="transform: translateX(4px)"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" style="transform: translateX(-4px)"></path></svg>
              </template>
            </div>
          </div>
        </div>
      </template>

      <!-- TYPE: FILE -->
      <template v-else-if="isFile">
        <div class="px-4 py-2.5 text-[15px]">
          <div class="flex flex-col gap-2">
            <FileCard v-for="(att, idx) in attachments" :key="att.id || idx" :attachment="att" />
          </div>
          <p v-if="msg.content" class="mt-2 text-[14px] whitespace-pre-wrap break-words">{{ msg.content }}</p>
          <div v-if="showTimeAndStatus" class="flex justify-end mt-1.5 items-center gap-1">
            <span class="text-[10px] opacity-60 font-medium" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
            <template v-if="isMine && !isGroup">
                  <svg v-if="messageStatus === 'sending'" class="w-3 h-3 text-white/70 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <svg v-else-if="messageStatus === 'sent'" class="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg v-else-if="messageStatus === 'delivered'" class="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" style="transform: translateX(4px)"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" style="transform: translateX(-4px)"></path></svg>
                  <svg v-else-if="messageStatus === 'read'" class="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" style="transform: translateX(4px)"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" style="transform: translateX(-4px)"></path></svg>
            </template>
          </div>
        </div>
      </template>

      <!-- FALLBACK: hiển thị raw content -->
      <template v-else>
        <div class="px-4 py-2.5 text-[15px]">
          <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
          <div v-if="showTimeAndStatus" class="flex justify-end mt-1 items-center gap-1">
            <span class="text-[10px] opacity-60 font-medium" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
            <template v-if="isMine && !isGroup">
                  <svg v-if="messageStatus === 'sending'" class="w-3 h-3 text-white/70 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <svg v-else-if="messageStatus === 'sent'" class="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg v-else-if="messageStatus === 'delivered'" class="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" style="transform: translateX(4px)"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" style="transform: translateX(-4px)"></path></svg>
                  <svg v-else-if="messageStatus === 'read'" class="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" style="transform: translateX(4px)"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" style="transform: translateX(-4px)"></path></svg>
            </template>
          </div>
        </div>
      </template>
    </div>

    <!-- Mini avatars for group read receipts (chuyển xuống dưới Bubble) -->
    <div v-if="isMine && isGroup && groupReadReceipts.length > 0" class="flex flex-wrap justify-end gap-1 w-full mt-0.5 pr-1">
      <img
        v-for="user in groupReadReceipts"
        :key="user.id"
        :src="user.avatar ? getFileUrl(user.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&size=32`"
        :title="user.name"
        class="w-[14px] h-[14px] rounded-full object-cover shadow-sm border border-white"
        alt="Seen by"
      />
    </div>
  </div>

    <!-- Lightbox xem ảnh -->
    <ImageLightbox
      v-if="lightboxSrc"
      :src="lightboxSrc"
      @close="lightboxSrc = null"
    />
  </div>
</template>

<style scoped>
.bubble-sent {
  background: var(--accent-color);
  color: #ffffff;
  border-radius: 18px 18px 4px 18px;
}
.bubble-received {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 18px 18px 18px 4px;
}
</style>
