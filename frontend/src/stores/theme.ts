import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'light')
  const isDark = ref(false)

  function applyTheme() {
    const themeValue = theme.value === 'auto' ? 'light' : theme.value
    isDark.value = themeValue === 'dark'

    if (themeValue === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  function toggleTheme() {
    const newTheme: Theme = isDark.value ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // 监听主题变化
  watch(theme, () => {
    applyTheme()
  })

  // 初始化主题
  applyTheme()

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  }
})
