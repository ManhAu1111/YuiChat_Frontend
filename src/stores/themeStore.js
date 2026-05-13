import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'system');
  const systemIsDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Lắng nghe sự thay đổi giao diện từ hệ thống
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    systemIsDark.value = e.matches;
    applyTheme();
  });

  const isDark = computed(() => {
    if (theme.value === 'dark') return true;
    if (theme.value === 'light') return false;
    return systemIsDark.value;
  });

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme();
  };

  // Khởi tạo áp dụng theme ban đầu
  applyTheme();

  return {
    theme,
    isDark,
    setTheme,
    applyTheme
  };
});
