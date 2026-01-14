<script setup lang="ts">
import { ref, watch } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

const props = defineProps<{
  toasts: Toast[]
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
}>()

// 自动移除 toast
watch(() => props.toasts, (toasts) => {
  toasts.forEach(toast => {
    if (toast.duration !== 0) {
      setTimeout(() => {
        emit('remove', toast.id)
      }, toast.duration || 3000)
    }
  })
}, { deep: true })

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'info': return 'ℹ'
    default: return 'ℹ'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
        >
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            @click="emit('remove', toast.id)"
            class="toast-close"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  animation: toastIn 0.3s ease-out;
}

.toast-success {
  border-left: 4px solid #22c55e;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: #f0fdf4;
  color: #22c55e;
}

.toast-error .toast-icon {
  background: #fef2f2;
  color: #ef4444;
}

.toast-info .toast-icon {
  background: #eff6ff;
  color: #3b82f6;
}

.toast-message {
  flex: 1;
  font-size: 0.9375rem;
  color: #1f2937;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #374151;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
