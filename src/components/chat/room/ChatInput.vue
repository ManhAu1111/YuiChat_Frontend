<script setup>
import { ref, computed } from 'vue';
import { useChatStore } from '../../../stores/chatStore';
import { useThemeStore } from '../../../stores/themeStore';
import api from '../../../services/api';
import AttachmentPreview from './AttachmentPreview.vue';

const props = defineProps(['conversationId']);
const chatStore = useChatStore();
const themeStore = useThemeStore();

const messageText = ref('');
const isSending = ref(false);
const isFocused = ref(false);
const selectedFile = ref(null); // { file, previewUrl, name, size, type, isUploading, progress }
const fileInputRef = ref(null);
const errorMsg = ref('');

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE  = 50 * 1024 * 1024; // 50 MB

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
    lineHeight: '1.47',
  };
});

// Mở file picker
const openFilePicker = () => fileInputRef.value?.click();

// Xử lý khi user chọn file
const onFileSelected = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  errorMsg.value = '';

  const isImage = file.type.startsWith('image/');
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (file.size > maxSize) {
    errorMsg.value = isImage
      ? 'Ảnh không được vượt quá 10MB.'
      : 'File không được vượt quá 50MB.';
    event.target.value = '';
    return;
  }

  const previewUrl = isImage ? URL.createObjectURL(file) : null;
  selectedFile.value = {
    file,
    previewUrl,
    name: file.name,
    size: file.size,
    type: file.type,
    isUploading: false,
    progress: 0,
  };
  // Reset input để có thể chọn lại cùng file
  event.target.value = '';
};

// Xóa file đã chọn
const removeFile = () => {
  if (selectedFile.value?.previewUrl) {
    URL.revokeObjectURL(selectedFile.value.previewUrl);
  }
  selectedFile.value = null;
  errorMsg.value = '';
};

// Upload file lên server
const uploadFile = async (fileObj) => {
  const formData = new FormData();
  formData.append('file', fileObj.file);
  formData.append('context', fileObj.type.startsWith('image/') ? 'image' : 'file');

  selectedFile.value.isUploading = true;

  try {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (selectedFile.value) {
          selectedFile.value.progress = Math.round((e.loaded * 100) / (e.total || 1));
        }
      },
    });
    return response.data;
  } finally {
    if (selectedFile.value) selectedFile.value.isUploading = false;
  }
};

// Gửi tin nhắn (text hoặc file)
const sendMessage = async () => {
  const hasText = messageText.value.trim();
  const hasFile = !!selectedFile.value;
  if ((!hasText && !hasFile) || isSending.value) return;

  isSending.value = true;
  errorMsg.value = '';

  try {
    if (hasFile) {
      // Upload file rồi gửi
      const uploadResult = await uploadFile(selectedFile.value);
      const msgType = uploadResult.context === 'image' ? 'image' : 'file';

      await chatStore.sendFileMessage(props.conversationId, {
        url: uploadResult.url,
        fileName: uploadResult.file_name,
        fileType: uploadResult.file_type,
        fileSize: uploadResult.file_size,
        content: hasText || null,
        msgType,
      });

      messageText.value = '';
      removeFile();
    } else {
      // Chỉ gửi text
      const content = messageText.value;
      messageText.value = '';
      await chatStore.sendMessage(props.conversationId, content);
    }
  } catch (err) {
    errorMsg.value = 'Không thể gửi. Thử lại sau!';
    console.error(err);
  } finally {
    isSending.value = false;
  }
};
</script>

<template>
  <div class="flex-shrink-0 transition-colors duration-300"
    :style="themeStore.isDark
      ? 'background:#1d1d1f; border-top:1px solid rgba(255,255,255,0.08);'
      : 'background:#ffffff; border-top:1px solid rgba(0,0,0,0.08);'"
  >
    <!-- Preview file đã chọn -->
    <AttachmentPreview
      v-if="selectedFile"
      :file="selectedFile"
      @remove="removeFile"
    />

    <!-- Thông báo lỗi -->
    <p v-if="errorMsg" class="px-4 pb-1 text-xs text-red-500">{{ errorMsg }}</p>

    <!-- Input row -->
    <div class="flex items-center gap-3 px-4 py-3">

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv"
        @change="onFileSelected"
      />

      <!-- Nút đính kèm -->
      <button
        @click="openFilePicker"
        :disabled="isSending"
        class="flex-shrink-0 p-2 rounded-full transition-colors"
        :style="themeStore.isDark ? 'color:rgba(255,255,255,0.5);' : 'color:rgba(0,0,0,0.35);'"
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
          :placeholder="selectedFile ? 'Thêm tin nhắn (tùy chọn)...' : 'Nhập tin nhắn...'"
          class="w-full px-4 py-2.5 pr-11 rounded-apple-pill text-sm outline-none transition-all duration-300"
          :style="inputStyle"
          @focus="isFocused = true"
          @blur="isFocused = false"
          :disabled="isSending"
        />

        <!-- Nút gửi: hiện khi có text HOẶC có file -->
        <Transition name="send-fade">
          <button
            v-if="messageText.trim() || selectedFile"
            @click="sendMessage"
            :disabled="isSending || selectedFile?.isUploading"
            id="chat-send-btn"
            class="absolute right-2 inset-y-0 my-auto flex items-center justify-center w-7 h-7 rounded-full transition-all active:scale-90 disabled:opacity-50"
            style="background:#0071e3;"
            aria-label="Gửi"
          >
            <!-- Spinner khi đang upload/gửi -->
            <svg v-if="isSending" class="w-3.5 h-3.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <!-- Icon gửi bình thường -->
            <svg v-else class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </Transition>
      </div>
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