<script setup>
const emit = defineEmits(['back']);
</script>

<template>
  <div class="flex flex-col h-full" style="background: #f5f5f7;">
    <!-- Header -->
    <div class="h-14 flex items-center px-5 flex-shrink-0 bg-white"
         style="border-bottom: 1px solid rgba(0,0,0,0.08);">
      <button
        class="md:hidden p-1.5 mr-3 rounded-full hover:bg-black/5 transition-colors"
        style="color: rgba(0,0,0,0.48);"
        @click="emit('back')"
        aria-label="Quay lại"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h2 class="font-semibold text-apple-text-dark"
          style="font-size: 17px; letter-spacing: -0.374px;">
        Thông báo
      </h2>
    </div>

    <!-- Notifications list -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div
        v-for="i in 2"
        :key="i"
        class="flex items-start gap-3 p-4 rounded-[12px] bg-white transition-shadow"
        style="box-shadow: rgba(0,0,0,0.06) 0 1px 4px 0;"
      >
        <img
          :src="`https://i.pravatar.cc/150?img=${i + 15}`"
          alt="avatar"
          class="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm text-apple-text-dark leading-snug" style="letter-spacing: -0.224px;">
            <span class="font-semibold">Người dùng {{ i }}</span>
            <span style="color: rgba(0,0,0,0.6);"> đã gửi cho bạn lời mời kết bạn</span>
          </p>
          <div class="flex gap-2 mt-3">
            <button
              class="apple-btn text-sm px-4 py-1.5"
              style="font-size: 13px; padding: 6px 14px; border-radius: 6px;"
            >
              Đồng ý
            </button>
            <button
              class="text-sm px-4 py-1.5 rounded-[6px] transition-colors font-medium"
              style="
                background: rgba(0,0,0,0.06);
                color: rgba(0,0,0,0.6);
                font-size: 13px; padding: 6px 14px;
                letter-spacing: -0.224px;
              "
            >
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
