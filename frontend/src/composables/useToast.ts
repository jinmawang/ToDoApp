import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  const show = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration: number = 3000
  ) => {
    const id = ++toastId
    toasts.value.push({
      id,
      message,
      type,
      duration
    })

    return id
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return show(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    return show(message, 'error', duration)
  }

  const info = (message: string, duration?: number) => {
    return show(message, 'info', duration)
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    info
  }
}
