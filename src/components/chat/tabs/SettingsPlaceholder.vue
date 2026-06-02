<script setup>
import { useThemeStore } from '../../../stores/themeStore';

const emit = defineEmits(['back']);
const themeStore = useThemeStore();

const options = [
  {
    id: 'light',
    label: 'Sáng',
    description: 'Giao diện nền trắng sáng sủa, rõ ràng.'
  },
  {
    id: 'dark',
    label: 'Tối',
    description: 'Giao diện tối giúp dịu mắt trong môi trường thiếu sáng.'
  },
  {
    id: 'system',
    label: 'Hệ thống',
    description: 'Tự động điều chỉnh theo cài đặt của hệ điều hành.'
  }
];

const colorThemes = [
  { id: 'matcha', label: 'Matcha', color: '#10b981' },
  { id: 'amethyst', label: 'Amethyst', color: '#8b5cf6' },
  { id: 'sunset', label: 'Sunset', color: '#f97316' },
  { id: 'blue', label: 'Mặc định', color: '#0071e3' },
];
</script>

<template>
  <div
    class="relative flex flex-col h-full overflow-y-auto transition-colors duration-300 select-none"
    style="background: var(--bg-primary);"
  >
    <!-- Nút quay lại trên Mobile -->
    <button
      class="md:hidden absolute top-4 left-4 p-2 rounded-full transition-colors z-10"
      style="color: var(--text-secondary);"
      onmouseover="this.style.background='var(--hover-bg)'"
      onmouseout="this.style.background='transparent'"
      @click="emit('back')"
      aria-label="Quay lại"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <!-- Tiêu đề Cài đặt -->
    <div class="px-8 pt-14 pb-6 max-w-2xl mx-auto w-full">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
             style="background: var(--accent-light); color: var(--accent-color);">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h2 class="font-display font-semibold transition-colors duration-300"
            style="font-size: 28px; line-height: 1.14; letter-spacing: 0.196px; color: var(--text-primary);">
          Giao diện & Hiển thị
        </h2>
      </div>
      <p class="text-[15px] transition-colors duration-300 mb-8"
         style="letter-spacing: -0.224px; color: var(--text-secondary);">
        Tùy chỉnh cách YuiChat hiển thị trên thiết bị của bạn.
      </p>

      <!-- Phần chọn giao diện (Mode) -->
      <div class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
            style="color: var(--text-tertiary);">
          Chế độ nền
        </h3>

        <!-- Lưới thẻ chọn Theme -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Card Sáng -->
          <button
            type="button"
            @click="themeStore.setMode('light')"
            class="group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full overflow-hidden focus:outline-none"
            :style="themeStore.mode === 'light'
              ? 'border-color: var(--accent-color); background: var(--bg-secondary);'
              : 'border-color: transparent; background: var(--bg-secondary);'"
            :class="themeStore.mode === 'light' ? 'ring-2 ring-apple-blue/20 shadow-sm' : 'hover:scale-[1.01] hover:shadow-sm'"
          >
            <!-- Mockup giao diện sáng -->
            <div class="w-full h-24 rounded-xl bg-white border border-black/5 flex flex-col justify-between p-2.5 mb-3 shadow-sm relative overflow-hidden">
              <div class="flex items-center gap-1.5">
                <div class="w-4 h-4 rounded-full bg-black/5 flex items-center justify-center text-[8px] font-bold text-black/40">Y</div>
                <div class="w-12 h-2 rounded-full bg-black/10"></div>
              </div>
              <div class="space-y-1.5 w-full">
                <div class="h-4 w-3/4 rounded-lg bg-black/5 self-start"></div>
                <div class="h-4 w-2/3 rounded-lg text-white ml-auto flex items-center justify-end pr-2.5" style="background: var(--accent-color);">
                  <span class="w-2 h-1 rounded-full bg-white/40 inline-block"></span>
                </div>
              </div>
            </div>

            <!-- Tên & Checkmark -->
            <div class="w-full flex items-center justify-between">
              <span class="text-sm font-medium transition-colors duration-300"
                    style="color: var(--text-primary);">
                Sáng
              </span>
              <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200"
                   :style="themeStore.mode === 'light'
                     ? 'background: var(--accent-color); border-color: var(--accent-color);'
                     : 'border-color: var(--border-color);'">
                <svg v-if="themeStore.mode === 'light'" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
          </button>

          <!-- Card Tối -->
          <button
            type="button"
            @click="themeStore.setMode('dark')"
            class="group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full overflow-hidden focus:outline-none"
            :style="themeStore.mode === 'dark'
              ? 'border-color: var(--accent-color); background: var(--bg-secondary);'
              : 'border-color: transparent; background: var(--bg-secondary);'"
            :class="themeStore.mode === 'dark' ? 'ring-2 ring-apple-blue/20 shadow-sm' : 'hover:scale-[1.01] hover:shadow-sm'"
          >
            <!-- Mockup giao diện tối -->
            <div class="w-full h-24 rounded-xl bg-[#1d1d1f] border border-white/5 flex flex-col justify-between p-2.5 mb-3 shadow-sm relative overflow-hidden">
              <div class="flex items-center gap-1.5">
                <div class="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-white/40">Y</div>
                <div class="w-12 h-2 rounded-full bg-white/10"></div>
              </div>
              <div class="space-y-1.5 w-full">
                <div class="h-4 w-3/4 rounded-lg bg-white/5 self-start"></div>
                <div class="h-4 w-2/3 rounded-lg text-white ml-auto flex items-center justify-end pr-2.5" style="background: var(--accent-color);">
                  <span class="w-2 h-1 rounded-full bg-white/40 inline-block"></span>
                </div>
              </div>
            </div>

            <!-- Tên & Checkmark -->
            <div class="w-full flex items-center justify-between">
              <span class="text-sm font-medium transition-colors duration-300"
                    style="color: var(--text-primary);">
                Tối
              </span>
              <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200"
                   :style="themeStore.mode === 'dark'
                     ? 'background: var(--accent-color); border-color: var(--accent-color);'
                     : 'border-color: var(--border-color);'">
                <svg v-if="themeStore.mode === 'dark'" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
          </button>

          <!-- Card Hệ thống -->
          <button
            type="button"
            @click="themeStore.setMode('system')"
            class="group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full overflow-hidden focus:outline-none"
            :style="themeStore.mode === 'system'
              ? 'border-color: var(--accent-color); background: var(--bg-secondary);'
              : 'border-color: transparent; background: var(--bg-secondary);'"
            :class="themeStore.mode === 'system' ? 'ring-2 ring-apple-blue/20 shadow-sm' : 'hover:scale-[1.01] hover:shadow-sm'"
          >
            <!-- Mockup giao diện hệ thống (chia nửa sáng/tối chéo) -->
            <div class="w-full h-24 rounded-xl border flex flex-col justify-between p-2.5 mb-3 shadow-sm relative overflow-hidden border-black/5">
              <!-- Nền chia nửa chéo -->
              <div class="absolute inset-0 bg-white"></div>
              <div class="absolute inset-0 bg-[#1d1d1f]" style="clip-path: polygon(100% 0, 0 100%, 100% 100%);"></div>

              <div class="flex items-center gap-1.5 relative z-10">
                <div class="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[8px] font-bold text-black/40">Y</div>
                <div class="w-12 h-2 rounded-full bg-black/10"></div>
              </div>
              <div class="space-y-1.5 w-full relative z-10">
                <div class="h-4 w-3/4 rounded-lg bg-black/5 self-start"></div>
                <div class="h-4 w-2/3 rounded-lg text-white ml-auto flex items-center justify-end pr-2.5" style="background: var(--accent-color);">
                  <span class="w-2 h-1 rounded-full bg-white/40 inline-block"></span>
                </div>
              </div>
            </div>

            <!-- Tên & Checkmark -->
            <div class="w-full flex items-center justify-between">
              <span class="text-sm font-medium transition-colors duration-300"
                    style="color: var(--text-primary);">
                Hệ thống
              </span>
              <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200"
                   :style="themeStore.mode === 'system'
                     ? 'background: var(--accent-color); border-color: var(--accent-color);'
                     : 'border-color: var(--border-color);'">
                <svg v-if="themeStore.mode === 'system'" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
          </button>
        </div>

        <!-- Khung thông tin mô tả chi tiết lựa chọn hiện tại -->
        <div class="mt-4 p-4 rounded-xl transition-colors duration-300 flex items-start gap-3"
             style="background: var(--bg-secondary);">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-300"
               style="color: var(--accent-color);"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-[15px] font-medium transition-colors duration-300"
               style="color: var(--text-primary);">
              {{ options.find(o => o.id === themeStore.mode)?.label }}
            </p>
            <p class="text-[13px] mt-0.5 transition-colors duration-300"
               style="letter-spacing: -0.12px; color: var(--text-secondary);">
              {{ options.find(o => o.id === themeStore.mode)?.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Phần chọn Màu chủ đạo (Color Theme) -->
      <div class="mt-8 space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
            style="color: var(--text-tertiary);">
          Màu chủ đạo
        </h3>

        <div class="flex gap-4">
          <button
            v-for="colorTheme in colorThemes"
            :key="colorTheme.id"
            type="button"
            @click="themeStore.setColorTheme(colorTheme.id)"
            class="w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center focus:outline-none hover:scale-110 shadow-sm"
            :style="themeStore.colorTheme === colorTheme.id 
              ? `background: ${colorTheme.color}; border-color: ${colorTheme.color}; ring: 2px solid ${colorTheme.color}80;` 
              : `background: ${colorTheme.color}; border-color: transparent;`"
            :title="colorTheme.label"
          >
            <svg v-if="themeStore.colorTheme === colorTheme.id" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Các mục cài đặt hiển thị phụ (Ví dụ) -->
      <div class="mt-8 space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
            style="color: var(--text-tertiary);">
          Tùy chọn khác
        </h3>

        <div class="rounded-2xl transition-colors duration-300 overflow-hidden divide-y"
             style="background: var(--bg-secondary); border: 1px solid var(--border-color); divide-color: var(--border-color);">
          <!-- Item 1 -->
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="text-[15px] font-medium transition-colors duration-300"
                 style="color: var(--text-primary);">
                Giảm chuyển động
              </p>
              <p class="text-[13px] transition-colors duration-300"
                 style="letter-spacing: -0.12px; color: var(--text-secondary);">
                Tắt các hiệu ứng hoạt ảnh động để tối ưu hiệu suất.
              </p>
            </div>
            <!-- Switch giả lập -->
            <button class="w-11 h-6 rounded-full transition-colors duration-200 p-0.5 flex items-center"
                    style="background: var(--hover-bg);">
              <div class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 translate-x-0"></div>
            </button>
          </div>

          <!-- Item 2 -->
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="text-[15px] font-medium transition-colors duration-300"
                 style="color: var(--text-primary);">
                Chế độ tương phản cao
              </p>
              <p class="text-[13px] transition-colors duration-300"
                 style="letter-spacing: -0.12px; color: var(--text-secondary);">
                Làm đậm màu viền và văn bản để dễ đọc hơn.
              </p>
            </div>
            <!-- Switch giả lập -->
            <button class="w-11 h-6 rounded-full transition-colors duration-200 p-0.5 flex items-center"
                    style="background: var(--hover-bg);">
              <div class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 translate-x-0"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
