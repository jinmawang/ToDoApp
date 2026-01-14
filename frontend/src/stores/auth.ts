import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, computed } from 'vue'
import { API_BASE_URL } from '@/config/api'

export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref('')

  // 从 localStorage 恢复状态
  function loadFromStorage() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken) {
      token.value = savedToken
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
    }

    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  // 保存到 localStorage
  function saveToStorage(user: User, accessToken: string) {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
  }

  // 清除 localStorage
  function clearStorage() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 计算属性：是否已登录
  const isAuthenticated = computed(() => !!token.value)

  // 计算属性：用户显示名称
  const displayName = computed(() => user.value?.username || '用户')

  // 注册
  async function register(username: string, email: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password
      })

      // 注册成功后自动登录
      const { user: registeredUser, accessToken } = response.data
      user.value = registeredUser
      token.value = accessToken

      saveToStorage(registeredUser, accessToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

      return { success: true }
    } catch (e: any) {
      error.value = e.response?.data?.message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 登录
  async function login(email: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, {
        email,
        password
      })

      const { user: loggedInUser, accessToken } = response.data
      user.value = loggedInUser
      token.value = accessToken

      saveToStorage(loggedInUser, accessToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

      return { success: true }
    } catch (e: any) {
      error.value = e.response?.data?.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function fetchProfile() {
    if (!token.value) return

    loading.value = true
    error.value = ''
    try {
      const response = await axios.get<User>(`${API_BASE_URL}/auth/profile`)
      user.value = response.data
      saveToStorage(response.data, token.value)
    } catch (e: any) {
      error.value = e.response?.data?.message || '获取用户信息失败'
      // 如果 token 无效，清除登录状态
      if (e.response?.status === 401) {
        logout()
      }
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  async function updateProfile(updateData: Partial<User>) {
    if (!token.value) return { success: false, error: '未登录' }

    loading.value = true
    error.value = ''
    try {
      const response = await axios.patch<User>(`${API_BASE_URL}/auth/profile`, updateData)
      user.value = response.data
      saveToStorage(response.data, token.value)
      return { success: true }
    } catch (e: any) {
      error.value = e.response?.data?.message || '更新失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    user.value = null
    token.value = null
    delete axios.defaults.headers.common['Authorization']
    clearStorage()
  }

  // 初始化时从 localStorage 恢复
  loadFromStorage()

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    displayName,
    register,
    login,
    fetchProfile,
    updateProfile,
    logout
  }
})
