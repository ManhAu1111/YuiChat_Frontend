<script setup>
import { ref, computed } from 'vue';
import { useThemeStore } from '../../../stores/themeStore';
import FileCard from '../media/FileCard.vue';
import ImageLightbox from '../media/ImageLightbox.vue';

const props = defineProps({
  msg: { type: Object, required: true },
  isMine: { type: Boolean, default: false },
  sender: { type: Object, default: null },
  showAvatar: { type: Boolean, default: true },
});

const themeStore = useThemeStore();
const lightboxSrc = ref(null);

const attachment = computed(() => props.msg.attachments?.[0] || null);

const isImage = computed(() =>
  props.msg.type === 'image' ||
  (attachment.value && attachment.value.file_type?.startsWith('image/'))
);
const isFile = computed(() =>
  props.msg.type === 'file' ||
  (attachment.value && !attachment.value.file_type?.startsWith('image/'))
);

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const avatarUrl = computed(() => {
  const name = props.sender?.name || 'U';
  return props.sender?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e9e9eb&color=1d1d1f&size=56`;
});
</script>

<template>
  <div class="flex items-end gap-2" :class="isMine ? 'justify-end' : 'justify-start'">

    <!-- Avatar phía nhận -->
    <div v-if="!isMine" class="w-7 flex-shrink-0">
      <img v-if="showAvatar" :src="avatarUrl" class="w-7 h-7 rounded-full object-cover" :alt="sender?.name" />
    </div>

    <!-- Bubble chứa nội dung -->
    <div
      class="max-w-[65%]"
      :class="[
        msg.type === 'image' ? '' : 'px-4 py-2.5 text-sm',
        isMine ? 'bubble-sent' : 'bubble-received'
      ]"
      :style="[
        'letter-spacing:-0.224px; line-height:1.47;',
        msg.is_sending ? 'opacity:0.65;' : '',
        msg.type === 'image' ? 'padding:0; overflow:hidden; border-radius:inherit;' : '',
      ]"
    >
      <!-- TYPE: TEXT -->
      <template v-if="msg.type === 'text'">
        <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
        <div class="flex justify-end mt-0.5">
          <span class="text-[9px] opacity-50" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
        </div>
      </template>

      <!-- TYPE: IMAGE -->
      <template v-else-if="isImage">
        <div class="relative">
          <img
            v-if="attachment"
            :src="attachment.file_url"
            :alt="attachment.file_name || 'Ảnh'"
            class="rounded-2xl max-w-full cursor-zoom-in object-cover"
            style="max-height: 300px;"
            @click="lightboxSrc = attachment.file_url"
            loading="lazy"
          />
          <!-- Caption nếu có -->
          <p v-if="msg.content" class="px-4 pt-2 pb-1 text-sm whitespace-pre-wrap break-words">
            {{ msg.content }}
          </p>
          <div class="flex justify-end px-4 pb-2">
            <span class="text-[9px] opacity-50" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
          </div>
        </div>
      </template>

      <!-- TYPE: FILE -->
      <template v-else-if="isFile">
        <FileCard v-if="attachment" :attachment="attachment" />
        <p v-if="msg.content" class="mt-2 text-sm whitespace-pre-wrap break-words">{{ msg.content }}</p>
        <div class="flex justify-end mt-1">
          <span class="text-[9px] opacity-50" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
        </div>
      </template>

      <!-- FALLBACK: hiển thị raw content -->
      <template v-else>
        <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
        <div class="flex justify-end mt-0.5">
          <span class="text-[9px] opacity-50" style="letter-spacing:0;">{{ formatTime(msg.created_at) }}</span>
        </div>
      </template>
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
  background: #0071e3;
  color: #ffffff;
  border-radius: 18px 18px 4px 18px;
}
.bubble-received {
  background: #e9e9eb;
  color: #1d1d1f;
  border-radius: 18px 18px 18px 4px;
}

/* Dark mode overrides */
:global(.dark) .bubble-received {
  background: #3a3a3c;
  color: #ffffff;
}
</style>
