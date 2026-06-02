import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // mode: 'light', 'dark', 'system'
  const mode = ref(localStorage.getItem('theme_mode') || 'system');
  
  // colorTheme: 'matcha', 'amethyst', 'sunset', 'blue'
  const colorTheme = ref(localStorage.getItem('color_theme') || 'matcha');
  
  const systemIsDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Lắng nghe sự thay đổi giao diện từ hệ thống
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    systemIsDark.value = e.matches;
    applyTheme();
  });

  const isDark = computed(() => {
    if (mode.value === 'dark') return true;
    if (mode.value === 'light') return false;
    return systemIsDark.value;
  });

  const applyTheme = () => {
    const html = document.documentElement;
    
    // Apply Mode
    if (isDark.value) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Apply Color Theme
    html.setAttribute('data-theme', colorTheme.value);
  };

  const setMode = (newMode) => {
    mode.value = newMode;
    localStorage.setItem('theme_mode', newMode);
    applyTheme();
  };

  const setColorTheme = (newTheme) => {
    colorTheme.value = newTheme;
    localStorage.setItem('color_theme', newTheme);
    applyTheme();
  };

  // Khởi tạo áp dụng theme ban đầu
  applyTheme();

  return {
    mode,
    colorTheme,
    isDark,
    setMode,
    setColorTheme,
    applyTheme
  };
});
