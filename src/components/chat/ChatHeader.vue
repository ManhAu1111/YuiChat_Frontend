<script setup>
// Props nhận chatId để sau này gọi API lấy user thật
const props = defineProps(['chatId']);
const emit = defineEmits(['backToChatList']);
</script>

<template>
  <div class="h-16 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 bg-white">
    <div class="flex items-center">
      <button @click="emit('backToChatList')" class="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7-7 7"></path></svg>
      </button>
      <div class="relative flex-shrink-0">
        <img src="https://i.pravatar.cc/150?u=manh" alt="Avatar" class="w-10 h-10 rounded-full object-cover">
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div class="ml-3">
        <h2 class="text-sm font-semibold text-gray-800">Âu Mạnh</h2>
        <p class="text-xs text-green-500">Đang hoạt động</p>
      </div>
    </div>

    <div class="flex items-center space-x-1.5 text-gray-500">
      <button class="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </button>
      <button class="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
      </button>
      <button class="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553 2.276A1 1 0 0120 13.118v3.764a1 1 0 01-.447.894L15 20M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      </button>
      <div class="w-px h-6 bg-gray-200 mx-1"></div>
      <button class="p-2 rounded-lg hover:bg-gray-100 hover:text-red-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatHeader',
  props: {
    chatId: Number
  }
}
</script>