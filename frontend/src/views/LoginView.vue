<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const username = ref('')

const handleSubmit = async () => {
  if (isLogin.value) {
    // 登录
    const result = await authStore.login(email.value, password.value)
    if (result.success) {
      toast.success('登录成功！正在跳转...', 2000)
      setTimeout(() => {
        router.push('/todos')
      }, 500)
    } else {
      toast.error(result.error || '登录失败，请检查邮箱和密码')
    }
  } else {
    // 注册
    const result = await authStore.register(username.value, email.value, password.value)
    if (result.success) {
      toast.success('注册成功！欢迎加入！', 2000)
      setTimeout(() => {
        router.push('/todos')
      }, 1000)
    } else {
      toast.error(result.error || '注册失败，请重试')
    }
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  authStore.error = ''
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">
            <span v-if="isLogin">登录</span>
            <span v-else>注册</span>
          </h1>
          <p class="auth-subtitle">Todo 管理系统</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div v-if="!isLogin" class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input
              v-model="email"
              type="email"
              class="form-input"
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="请输入密码"
              required
              minlength="6"
            />
          </div>

          <button
            type="submit"
            class="btn-primary"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading">加载中...</span>
            <span v-else>{{ isLogin ? '登录' : '注册' }}</span>
          </button>

          <div class="auth-footer">
            <span class="auth-text">
              {{ isLogin ? '还没有账号？' : '已有账号？' }}
            </span>
            <button
              type="button"
              @click="toggleMode"
              class="btn-link"
            >
              {{ isLogin ? '立即注册' : '立即登录' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: white;
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  padding-top: 1rem;
}

.auth-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.btn-link {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  padding: 0;
  margin-left: 0.25rem;
}

.btn-link:hover {
  text-decoration: underline;
}
</style>
