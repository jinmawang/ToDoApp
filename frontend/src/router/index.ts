import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import TodoView from '../views/TodoView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/todos'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/todos',
      name: 'todos',
      component: TodoView,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫：检查认证状态
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录，跳转到登录页
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // 已登录用户访问登录页，跳转到 todos
    next({ name: 'todos' })
  } else {
    next()
  }
})

export default router
