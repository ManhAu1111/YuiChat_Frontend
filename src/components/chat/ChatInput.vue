<script setup>
import { ref, computed } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import { useThemeStore } from '../../stores/themeStore';

const props = defineProps(['conversationId']);
const chatStore = useChatStore();
const themeStore = useThemeStore();
const messageText = ref('');
const isSending = ref(false);
const isFocused = ref(false);

const inputStyle = computed(() => {
  const isDark = themeStore.isDark;
  return {
    background: isDark 
      ? (isFocused.value ? '#2a2a2d' : '#272729')
      : (isFocused.value ? '#ffffff' : '#f5f5f7'),
    color: isDark ? '#ffffff' : '#1d1d1f',
    borderColor: isFocused.value ? '#0071e3' : 'transparent',
    borderStyle: 'solid',
    borderWidth: '1px',
    letterSpacing: '-0.224px',
    lineHeight: '1.47'
  };
});

const sendMessage = async () => {
  if (messageText.value.trim() && !isSending.value) {
    const content = messageText.value;
    messageText.value = '';
    isSending.value = true;
    try {
      await chatStore.sendMessage(props.conversationId, content);
    } catch {
      alert('Không thể gửi tin nhắn. Thử lại sau!');
      messageText.value = content;
    } finally {
      isSending.value = false;
    }
  }
};
</script>

<template>
  <!--
    Apple ChatInput hỗ trợ Dark Theme
  -->
  <div class="flex items-center gap-3 px-4 py-3 flex-shrink-0 transition-colors duration-300"
       :style="themeStore.isDark ? 'background: #1d1d1f; border-top: 1px solid rgba(255,255,255,0.08);' : 'background: #ffffff; border-top: 1px solid rgba(0,0,0,0.08);'">

    <!-- Attachment button -->
    <button
      class="flex-shrink-0 p-2 rounded-full transition-colors"
      :style="themeStore.isDark ? 'color: rgba(255,255,255,0.5);' : 'color: rgba(0,0,0,0.35);'"
      aria-label="Đính kèm tệp"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
      </svg>
    </button>

    <!-- Message input -->
    <div class="flex-1 relative">
      <input
        id="chat-message-input"
        type="text"
        v-model="messageText"
        @keyup.enter="sendMessage"
        placeholder="Nhập tin nhắn..."
        class="w-full px-4 py-2.5 pr-11 rounded-apple-pill text-sm outline-none transition-all duration-300"
        :style="inputStyle"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Send button — Apple Blue, visible when text present -->
      <Transition name="send-fade">
        <button
          v-if="messageText.trim()"
          @click="sendMessage"
          id="chat-send-btn"
          class="absolute right-2 inset-y-0 my-auto flex items-center justify-center w-7 h-7 rounded-full transition-all active:scale-90"
          style="background: #0071e3;"
          aria-label="Gửi"
        >
          <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.send-fade-enter-active,
.send-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.send-fade-enter-from,
.send-fade-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>