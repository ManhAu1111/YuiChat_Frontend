<script setup>
import { ref, computed, nextTick } from 'vue';
import { useChatStore } from '../../../stores/chatStore';
import api from '../../../services/api';
import AttachmentPreview from './AttachmentPreview.vue';

const props = defineProps(['conversationId']);
const chatStore = useChatStore();

const messageText = ref('');
const isSending = ref(false);
const isFocused = ref(false);
const selectedFiles = ref([]); // mảng các object: { id, file, previewUrl, name, size, type, isUploading, progress }
const fileInputRef = ref(null);
const imageInputRef = ref(null);
const errorMsg = ref('');

const autoResize = (event) => {
  const el = event.target || event;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight) + 'px';
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE  = 50 * 1024 * 1024; // 50 MB
const MAX_IMAGES = 9;
const MAX_FILES = 3;

// Mở file picker
const openFilePicker = () => fileInputRef.value?.click();
const openImagePicker = () => imageInputRef.value?.click();

// Xử lý khi user chọn file
const onFileSelected = (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  errorMsg.value = '';

  let currentType = selectedFiles.value.length > 0 
    ? (selectedFiles.value[0].type.startsWith('image/') ? 'image' : 'file') 
    : null;

  for (const file of files) {
    const isImage = file.type.startsWith('image/');
    const fileType = isImage ? 'image' : 'file';

    if (currentType && currentType !== fileType) {
      errorMsg.value = 'Không thể gửi ảnh và file cùng lúc.';
      continue;
    }
    currentType = fileType;

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    if (file.size > maxSize) {
      errorMsg.value = isImage ? 'Ảnh không được vượt quá 10MB.' : 'File không được vượt quá 50MB.';
      continue;
    }

    if (isImage && selectedFiles.value.length >= MAX_IMAGES) {
      errorMsg.value = `Tối đa ${MAX_IMAGES} ảnh một lần.`;
      break;
    }
    if (!isImage && selectedFiles.value.length >= MAX_FILES) {
      errorMsg.value = `Tối đa ${MAX_FILES} file một lần.`;
      break;
    }

    const previewUrl = isImage ? URL.createObjectURL(file) : null;
    selectedFiles.value.push({
      id: Date.now() + Math.random(),
      file,
      previewUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      isUploading: false,
      progress: 0,
    });
  }

  // Reset input để có thể chọn lại cùng file
  event.target.value = '';
  
  // Focus lại input để người dùng có thể nhấn Enter gửi luôn
  nextTick(() => {
    document.getElementById('chat-message-input')?.focus();
  });
};

// Xóa file đã chọn
const removeFile = (index) => {
  const file = selectedFiles.value[index];
  if (file?.previewUrl) {
    URL.revokeObjectURL(file.previewUrl);
  }
  selectedFiles.value.splice(index, 1);
  if (selectedFiles.value.length === 0) {
    errorMsg.value = '';
  }
};

// Upload file lên server
const uploadFile = async (fileObj) => {
  const formData = new FormData();
  formData.append('file', fileObj.file);
  formData.append('context', fileObj.type.startsWith('image/') ? 'image' : 'file');

  fileObj.isUploading = true;

  try {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        fileObj.progress = Math.round((e.loaded * 100) / (e.total || 1));
      },
    });
    return response.data;
  } finally {
    fileObj.isUploading = false;
  }
};

// Gửi tin nhắn (text hoặc file)
const sendMessage = async () => {
  const hasText = messageText.value.trim();
  const hasFiles = selectedFiles.value.length > 0;
  if ((!hasText && !hasFiles) || isSending.value) return;

  const isUploadingAny = selectedFiles.value.some(f => f.isUploading);
  if (isUploadingAny) return; // Wait until all are done or don't allow sending while uploading

  isSending.value = true;
  errorMsg.value = '';

  try {
    if (hasFiles) {
      // Upload tất cả các file
      const uploadPromises = selectedFiles.value.map(fileObj => uploadFile(fileObj));
      const results = await Promise.all(uploadPromises);

      const attachments = results.map(res => ({
        file_url: res.url,
        file_name: res.file_name,
        file_type: res.file_type,
        file_size: res.file_size
      }));

      const msgType = selectedFiles.value[0].type.startsWith('image/') ? 'image' : 'file';

      await chatStore.sendFileMessage(props.conversationId, {
        attachments,
        content: hasText || null,
        msgType,
      });

      messageText.value = '';
      nextTick(() => {
        const el = document.getElementById('chat-message-input');
        if (el) el.style.height = 'auto';
      });
      selectedFiles.value.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      selectedFiles.value = [];
    } else {
      // Chỉ gửi text
      const content = messageText.value;
      messageText.value = '';
      nextTick(() => {
        const el = document.getElementById('chat-message-input');
        if (el) el.style.height = 'auto';
      });
      await chatStore.sendMessage(props.conversationId, content);
    }
  } catch (err) {
    errorMsg.value = 'Không thể gửi. Thử lại sau!';
    console.error(err);
  } finally {
    isSending.value = false;
  }
};

// Xử lý sự kiện nhấn Enter
const handleEnter = (event) => {
  // Kiểm tra thiết bị: nếu màn hình nhỏ (mobile/tablet) hoặc có cảm ứng
  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  
  if (!isMobile) {
    // Trên máy tính: Enter để gửi, ngăn chặn xuống dòng mặc định
    event.preventDefault();
    sendMessage();
  }
  // Trên điện thoại: không gọi preventDefault() để textarea tự động thêm dòng mới
};
</script>

<template>
  <div class="flex-shrink-0 transition-colors duration-300 pb-4 pt-2 px-4 relative z-10"
       style="background: linear-gradient(to top, var(--bg-primary) 30%, transparent);">
    
    <!-- Thông báo lỗi -->
    <p v-if="errorMsg" class="px-2 pb-2 text-xs text-red-500 font-medium">{{ errorMsg }}</p>

    <!-- Command Bar Container -->
    <div class="flex flex-col transition-all duration-300 rounded-[24px] overflow-hidden"
         :style="isFocused 
            ? 'background: var(--bg-primary); border: 1px solid var(--accent-color); box-shadow: 0 4px 20px rgba(0,0,0,0.1);' 
            : 'background: var(--bg-secondary); border: 1px solid var(--border-color);'">

      <!-- Preview file đã chọn -->
      <div v-if="selectedFiles.length > 0" class="flex overflow-x-auto px-2 py-2 gap-2 scrollbar-hide">
        <AttachmentPreview
          v-for="(file, index) in selectedFiles"
          :key="file.id"
          :file="file"
          @remove="removeFile(index)"
        />
      </div>

      <!-- Input row -->
      <div class="flex items-end gap-2 px-2 py-2">

        <!-- Hidden file/image inputs -->
        <input
          ref="imageInputRef"
          type="file"
          class="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          @change="onFileSelected"
        />
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          accept="application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv"
          multiple
          @change="onFileSelected"
        />

        <!-- Action Buttons (Left) -->
        <div class="flex items-center pb-[2px]">
          <!-- Nút đính kèm ảnh -->
          <button
            @click="openImagePicker"
            :disabled="isSending"
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style="color: var(--text-secondary);"
            onmouseover="this.style.background='var(--hover-bg)'"
            onmouseout="this.style.background='transparent'"
            aria-label="Đính kèm ảnh"
          >
            <svg class="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </button>

          <!-- Nút đính kèm file -->
          <button
            @click="openFilePicker"
            :disabled="isSending"
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style="color: var(--text-secondary);"
            onmouseover="this.style.background='var(--hover-bg)'"
            onmouseout="this.style.background='transparent'"
            aria-label="Đính kèm tệp"
          >
            <svg class="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
          </button>
        </div>

        <!-- Message input -->
        <div class="flex-1 min-w-0 pb-[4px]">
          <textarea
            id="chat-message-input"
            v-model="messageText"
            @keydown.enter.exact="handleEnter"
            @input="autoResize"
            :placeholder="selectedFiles.length > 0 ? `Đã chọn ${selectedFiles.length} tệp đính kèm...` : 'Nhập tin nhắn...'"
            class="w-full bg-transparent px-2 py-1.5 text-[15px] outline-none resize-none scrollbar-hide"
            rows="1"
            style="color: var(--text-primary); max-height: 120px;"
            @focus="isFocused = true"
            @blur="isFocused = false"
            :disabled="isSending"
          ></textarea>
        </div>

        <!-- Nút gửi (Right) -->
        <div class="pb-[3px] pr-1">
          <Transition name="send-fade">
            <button
              v-if="messageText.trim() || selectedFiles.length > 0"
              @click="sendMessage"
              :disabled="isSending || selectedFiles.some(f => f.isUploading)"
              id="chat-send-btn"
              class="flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-90 disabled:opacity-50 shadow-sm"
              style="background: var(--accent-color);"
              aria-label="Gửi"
            >
              <!-- Spinner khi đang upload/gửi -->
              <svg v-if="isSending" class="w-[18px] h-[18px] text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <!-- Icon gửi bình thường -->
              <svg v-else class="w-[16px] h-[16px] text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </Transition>
        </div>
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

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>