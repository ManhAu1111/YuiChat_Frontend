<script setup>
const emit = defineEmits(['back']);
</script>

<template>
  <div class="flex flex-col h-full text-white">
    <!-- Header -->
    <div class="h-16 flex items-center px-4 border-b border-white/20 flex-shrink-0">
      <button class="md:hidden mr-3 p-2 -ml-2 text-white/70 hover:text-white rounded-full hover:bg-white/10" @click="emit('back')">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h2 class="text-lg font-semibold">Thông báo</h2>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div class="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-start gap-3 border border-white/5" v-for="i in 2" :key="i">
        <img :src="`https://i.pravatar.cc/150?img=${i + 15}`" alt="avatar" class="w-10 h-10 rounded-full object-cover" />
        <div class="flex-1">
          <p class="text-sm"><span class="font-bold">Người dùng {{ i }}</span> <span class="text-white/60">đã gửi cho bạn một lời mời kết bạn</span></p>
          <div class="flex gap-2 mt-2">
            <button class="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg text-sm font-medium">Đồng ý</button>
            <button class="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-sm font-medium">Từ chối</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
