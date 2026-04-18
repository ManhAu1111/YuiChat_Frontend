<script setup>
import { ref } from 'vue';
import { useChatStore } from '../../stores/chatStore';

const props = defineProps(['conversationId']);
const chatStore = useChatStore();
const messageText = ref('');
const isSending = ref(false);

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
    Apple ChatInput: white bar, thin top border, pill input, Apple Blue send icon
  -->
  <div class="flex items-center gap-3 px-4 py-3 bg-white flex-shrink-0"
       style="border-top: 1px solid rgba(0,0,0,0.08);">

    <!-- Attachment button -->
    <button
      class="flex-shrink-0 p-2 rounded-full transition-colors"
      style="color: rgba(0,0,0,0.35);"
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
        class="w-full px-4 py-2.5 pr-11 rounded-apple-pill text-sm bg-[#f5f5f7] outline-none transition-all"
        style="
          border: 1px solid transparent;
          color: #1d1d1f;
          letter-spacing: -0.224px;
          line-height: 1.47;
        "
        onfocus="this.style.borderColor='#0071e3'; this.style.background='#fff';"
        onblur="this.style.borderColor='transparent'; this.style.background='#f5f5f7';"
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