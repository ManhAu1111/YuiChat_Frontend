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
</script>

<template>
  <div
    class="relative flex flex-col h-full overflow-y-auto transition-colors duration-300 select-none"
    :style="themeStore.isDark ? 'background: #000000;' : 'background: #f5f5f7;'"
  >
    <!-- Nút quay lại trên Mobile -->
    <button
      class="md:hidden absolute top-4 left-4 p-2 rounded-full transition-colors z-10"
      :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.08);' : 'color: rgba(0,0,0,0.48); background: rgba(0,0,0,0.05);'"
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
             :style="themeStore.isDark ? 'background: rgba(255,255,255,0.1); color: #2997ff;' : 'background: rgba(0,113,227,0.1); color: #0071e3;'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h2 class="font-display font-semibold transition-colors duration-300"
            style="font-size: 28px; line-height: 1.14; letter-spacing: 0.196px;"
            :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
          Giao diện & Hiển thị
        </h2>
      </div>
      <p class="text-sm transition-colors duration-300 mb-8"
         style="letter-spacing: -0.224px;"
         :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
        Tùy chỉnh cách YuiChat hiển thị trên thiết bị của bạn.
      </p>

      <!-- Phần chọn giao diện (Theme) -->
      <div class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
            :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.4);'">
          Chế độ nền
        </h3>

        <!-- Lưới thẻ chọn Theme -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Card Sáng -->
          <button
            type="button"
            @click="themeStore.setTheme('light')"
            class="group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full overflow-hidden focus:outline-none"
            :style="themeStore.theme === 'light'
              ? 'border-color: #0071e3; background: ' + (themeStore.isDark ? '#272729' : '#ffffff') + ';'
              : 'border-color: transparent; background: ' + (themeStore.isDark ? '#272729' : '#ffffff') + ';'"
            :class="themeStore.theme === 'light' ? 'ring-2 ring-apple-blue/20 shadow-apple-sm' : 'hover:scale-[1.01]'"
          >
            <!-- Mockup giao diện sáng -->
            <div class="w-full h-24 rounded-xl bg-white border border-black/5 flex flex-col justify-between p-2.5 mb-3 shadow-sm relative overflow-hidden">
              <div class="flex items-center gap-1.5">
                <div class="w-4 h-4 rounded-full bg-apple-blue/10 flex items-center justify-center text-[8px] font-bold text-apple-blue">Y</div>
                <div class="w-12 h-2 rounded-full bg-black/10"></div>
              </div>
              <div class="space-y-1.5 w-full">
                <div class="h-4 w-3/4 rounded-lg bg-black/5 self-start"></div>
                <div class="h-4 w-2/3 rounded-lg bg-apple-blue text-white ml-auto flex items-center justify-end pr-2.5">
                  <span class="w-2 h-1 rounded-full bg-white/40 inline-block"></span>
                </div>
              </div>
            </div>

            <!-- Tên & Checkmark -->
            <div class="w-full flex items-center justify-between">
              <span class="text-sm font-medium transition-colors duration-300"
                    :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
                Sáng
              </span>
              <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200"
                   :style="themeStore.theme === 'light'
                     ? 'background: #0071e3; border-color: #0071e3;'
                     : (themeStore.isDark ? 'border-color: rgba(255,255,255,0.2);' : 'border-color: rgba(0,0,0,0.2);')">
                <svg v-if="themeStore.theme === 'light'" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
          </button>

          <!-- Card Tối -->
          <button
            type="button"
            @click="themeStore.setTheme('dark')"
            class="group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full overflow-hidden focus:outline-none"
            :style="themeStore.theme === 'dark'
              ? 'border-color: #0071e3; background: ' + (themeStore.isDark ? '#272729' : '#ffffff') + ';'
              : 'border-color: transparent; background: ' + (themeStore.isDark ? '#272729' : '#ffffff') + ';'"
            :class="themeStore.theme === 'dark' ? 'ring-2 ring-apple-blue/20 shadow-apple-sm' : 'hover:scale-[1.01]'"
          >
            <!-- Mockup giao diện tối -->
            <div class="w-full h-24 rounded-xl bg-[#1d1d1f] border border-white/5 flex flex-col justify-between p-2.5 mb-3 shadow-sm relative overflow-hidden">
              <div class="flex items-center gap-1.5">
                <div class="w-4 h-4 rounded-full bg-apple-blue/20 flex items-center justify-center text-[8px] font-bold text-apple-blue-dark">Y</div>
                <div class="w-12 h-2 rounded-full bg-white/10"></div>
              </div>
              <div class="space-y-1.5 w-full">
                <div class="h-4 w-3/4 rounded-lg bg-white/5 self-start"></div>
                <div class="h-4 w-2/3 rounded-lg bg-apple-blue text-white ml-auto flex items-center justify-end pr-2.5">
                  <span class="w-2 h-1 rounded-full bg-white/40 inline-block"></span>
                </div>
              </div>
            </div>

            <!-- Tên & Checkmark -->
            <div class="w-full flex items-center justify-between">
              <span class="text-sm font-medium transition-colors duration-300"
                    :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
                Tối
              </span>
              <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200"
                   :style="themeStore.theme === 'dark'
                     ? 'background: #0071e3; border-color: #0071e3;'
                     : (themeStore.isDark ? 'border-color: rgba(255,255,255,0.2);' : 'border-color: rgba(0,0,0,0.2);')">
                <svg v-if="themeStore.theme === 'dark'" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
          </button>

          <!-- Card Hệ thống -->
          <button
            type="button"
            @click="themeStore.setTheme('system')"
            class="group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full overflow-hidden focus:outline-none"
            :style="themeStore.theme === 'system'
              ? 'border-color: #0071e3; background: ' + (themeStore.isDark ? '#272729' : '#ffffff') + ';'
              : 'border-color: transparent; background: ' + (themeStore.isDark ? '#272729' : '#ffffff') + ';'"
            :class="themeStore.theme === 'system' ? 'ring-2 ring-apple-blue/20 shadow-apple-sm' : 'hover:scale-[1.01]'"
          >
            <!-- Mockup giao diện hệ thống (chia nửa sáng/tối chéo) -->
            <div class="w-full h-24 rounded-xl border flex flex-col justify-between p-2.5 mb-3 shadow-sm relative overflow-hidden"
                 :style="themeStore.isDark ? 'border-color: rgba(255,255,255,0.05);' : 'border-color: rgba(0,0,0,0.05);'">
              <!-- Nền chia nửa chéo -->
              <div class="absolute inset-0 bg-white"></div>
              <div class="absolute inset-0 bg-[#1d1d1f]" style="clip-path: polygon(100% 0, 0 100%, 100% 100%);"></div>

              <div class="flex items-center gap-1.5 relative z-10">
                <div class="w-4 h-4 rounded-full bg-apple-blue/10 flex items-center justify-center text-[8px] font-bold text-apple-blue">Y</div>
                <div class="w-12 h-2 rounded-full bg-black/10"></div>
              </div>
              <div class="space-y-1.5 w-full relative z-10">
                <div class="h-4 w-3/4 rounded-lg bg-black/5 self-start"></div>
                <div class="h-4 w-2/3 rounded-lg bg-apple-blue text-white ml-auto flex items-center justify-end pr-2.5">
                  <span class="w-2 h-1 rounded-full bg-white/40 inline-block"></span>
                </div>
              </div>
            </div>

            <!-- Tên & Checkmark -->
            <div class="w-full flex items-center justify-between">
              <span class="text-sm font-medium transition-colors duration-300"
                    :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
                Hệ thống
              </span>
              <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200"
                   :style="themeStore.theme === 'system'
                     ? 'background: #0071e3; border-color: #0071e3;'
                     : (themeStore.isDark ? 'border-color: rgba(255,255,255,0.2);' : 'border-color: rgba(0,0,0,0.2);')">
                <svg v-if="themeStore.theme === 'system'" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
          </button>
        </div>

        <!-- Khung thông tin mô tả chi tiết lựa chọn hiện tại -->
        <div class="mt-4 p-4 rounded-xl transition-colors duration-300 flex items-start gap-3"
             :style="themeStore.isDark ? 'background: #272729;' : 'background: #ffffff;'">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-300"
               :style="themeStore.isDark ? 'color: #2997ff;' : 'color: #0071e3;'"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-sm font-medium transition-colors duration-300"
               :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
              {{ options.find(o => o.id === themeStore.theme)?.label }}
            </p>
            <p class="text-xs mt-0.5 transition-colors duration-300"
               style="letter-spacing: -0.12px;"
               :style="themeStore.isDark ? 'color: rgba(255,255,255,0.6);' : 'color: rgba(0,0,0,0.6);'">
              {{ options.find(o => o.id === themeStore.theme)?.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Các mục cài đặt hiển thị phụ (Ví dụ) -->
      <div class="mt-8 space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
            :style="themeStore.isDark ? 'color: rgba(255,255,255,0.4);' : 'color: rgba(0,0,0,0.4);'">
          Tùy chọn khác
        </h3>

        <div class="rounded-2xl transition-colors duration-300 overflow-hidden divide-y"
             :style="themeStore.isDark ? 'background: #272729; divide-color: rgba(255,255,255,0.06);' : 'background: #ffffff; divide-color: rgba(0,0,0,0.06);'">
          <!-- Item 1 -->
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium transition-colors duration-300"
                 :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
                Giảm chuyển động
              </p>
              <p class="text-xs transition-colors duration-300"
                 style="letter-spacing: -0.12px;"
                 :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
                Tắt các hiệu ứng hoạt ảnh động để tối ưu hiệu suất.
              </p>
            </div>
            <!-- Switch giả lập -->
            <button class="w-11 h-6 rounded-full transition-colors duration-200 p-0.5 flex items-center"
                    style="background: rgba(120,120,128,0.16);">
              <div class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 translate-x-0"></div>
            </button>
          </div>

          <!-- Item 2 -->
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium transition-colors duration-300"
                 :style="themeStore.isDark ? 'color: #ffffff;' : 'color: #1d1d1f;'">
                Chế độ tương phản cao
              </p>
              <p class="text-xs transition-colors duration-300"
                 style="letter-spacing: -0.12px;"
                 :style="themeStore.isDark ? 'color: rgba(255,255,255,0.48);' : 'color: rgba(0,0,0,0.48);'">
                Làm đậm màu viền và văn bản để dễ đọc hơn.
              </p>
            </div>
            <!-- Switch giả lập -->
            <button class="w-11 h-6 rounded-full transition-colors duration-200 p-0.5 flex items-center"
                    style="background: rgba(120,120,128,0.16);">
              <div class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 translate-x-0"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
