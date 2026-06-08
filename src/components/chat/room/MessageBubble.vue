<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { useChatStore } from '../../../stores/chatStore';
import FileCard from '../media/FileCard.vue';
import ImageLightbox from '../media/ImageLightbox.vue';
import MessageStatusIcon from './MessageStatusIcon.vue';
import ReadReceipts from './ReadReceipts.vue';
import { getFileUrl } from '../../../services/api';

const isMenuOpen = ref(false);

const handleForward = () => {
  chatStore.toggleSelectionMode(true);
  chatStore.toggleMessageSelection(props.msg._id || props.msg.id);
};

const isSelectable = computed(() => {
  if (!chatStore.isSelectionMode) return false;
  if (!chatStore.validSequenceMessageIds) return true;
  return chatStore.validSequenceMessageIds.includes(String(props.msg._id || props.msg.id));
});

const handleBubbleClick = () => {
  if (chatStore.isSelectionMode) {
    if (isSelectable.value) {
      chatStore.toggleMessageSelection(props.msg._id || props.msg.id);
    }
  }
};

const isSelected = computed(() => {
  return chatStore.selectedMessageIds.includes(props.msg._id || props.msg.id);
});

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
const emit = defineEmits(['forward-attachment']);

const attachments = computed(() => props.msg.attachments || []);

const activeAttachment = ref(null);

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

</script>

<template>
  <div class="flex items-end gap-2 relative group" :class="[
      isMine ? 'justify-end' : 'justify-start',
      chatStore.isSelectionMode ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-xl transition-colors' : ''
    ]"
    @click="handleBubbleClick"
    :style="chatStore.isSelectionMode && !isSelectable ? 'opacity: 0.5; pointer-events: none;' : ''"
  >
    
    <!-- Selection Checkbox -->
    <div v-if="chatStore.isSelectionMode" class="flex-shrink-0 mr-1" :class="isMine ? 'order-first' : ''">
      <div class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
           :class="[
             isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400 dark:border-gray-500',
             !isSelectable ? 'opacity-30' : ''
           ]">
        <svg v-if="isSelected" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
    </div>


    <!-- Avatar phía nhận -->
    <div v-if="!isMine" class="w-8 flex-shrink-0 flex justify-center mb-0.5" :class="chatStore.isSelectionMode ? 'ml-2' : ''">
      <img v-if="showAvatar" :src="avatarUrl" class="w-8 h-8 rounded-full object-cover transition-colors duration-300" style="background: var(--hover-bg);" :alt="sender?.name" />
      <div v-else class="w-8 h-8"></div>
    </div>

    <!-- Wrapper cho Bubble và Mini Avatars -->
    <div class="flex flex-col gap-1 max-w-[75%]" :class="[isMine ? 'items-end' : 'items-start', chatStore.isSelectionMode && isMine ? 'mr-2' : '']">
      
      <!-- Forwarded Indicator -->
      <div v-if="msg.metadata?.is_forwarded" class="flex items-center gap-1 text-[11px] opacity-70 mb-[-2px] px-1 font-medium" :class="isMine ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        <span>tin nhắn chuyển tiếp</span>
      </div>

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
                <MessageStatusIcon :status="messageStatus" />
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
              @click="activeAttachment = att"
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
                  <MessageStatusIcon :status="messageStatus" />
              </template>
            </div>
          </div>
        </div>
      </template>

      <!-- TYPE: FILE -->
      <template v-else-if="isFile">
        <div class="px-4 py-2.5 text-[15px]">
          <div class="flex flex-col gap-2">
            <FileCard v-for="(att, idx) in attachments" :key="att.id || idx" :attachment="att" @forward="$emit('forward-attachment', att)" />
          </div>
          <p v-if="msg.content" class="mt-2 text-[14px] whitespace-pre-wrap break-words">{{ msg.content }}</p>
          <div v-if="showTimeAndStatus" class="flex justify-end mt-1.5 items-center gap-1">
            <span class="text-[10px] opacity-60 font-medium" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
            <template v-if="isMine && !isGroup">
                  <MessageStatusIcon :status="messageStatus" />
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
                  <MessageStatusIcon :status="messageStatus" />
            </template>
          </div>
        </div>
      </template>
    </div>

    <!-- Mini avatars for read receipts (chuyển xuống dưới Bubble) -->
    <ReadReceipts 
      :msg="msg"
      :isMine="isMine"
      :participants="participants"
    />
  </div>
  
    <!-- Quick Forward Button (Hover) -->
    <div v-if="!chatStore.isSelectionMode" class="opacity-0 group-hover:opacity-100 transition-opacity self-center flex-shrink-0"
         :class="isMine ? 'order-first mr-1' : 'ml-1'">
      <button @click.stop="handleForward" class="p-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors" title="Chuyển tiếp">
        <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
    </div>

    <!-- Lightbox xem ảnh -->
    <ImageLightbox
      v-if="activeAttachment"
      :attachment="activeAttachment"
      @close="activeAttachment = null"
      @forward="$emit('forward-attachment', activeAttachment); activeAttachment = null;"
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
