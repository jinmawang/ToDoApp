import { defineStore } from 'pinia'
import axios from 'axios'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { API_ENDPOINTS } from '@/config/api'

export interface SubTask {
  id: number
  title: string
  isCompleted: boolean
  todoId: number
  createdAt: string
}

export interface Category {
  id: number
  name: string
  color: string
  icon: string
  userId: number
  createdAt: string
}

export interface Todo {
  id: number
  title: string
  description: string
  isCompleted: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  hasReminder: boolean
  userId: number
  categoryId: number | null
  category: Category | null
  parentId: number | null
  parent: Todo | null
  subtasks: SubTask[]
  progress: number
  createdAt: string
  updatedAt: string
}

export interface Statistics {
  total: number
  completed: number
  pending: number
  completionRate: number
  priorityStats: {
    high: number
    medium: number
    low: number
  }
  overdueCount: number
}

export const useTodoStore = defineStore('todo', () => {
  const todos: Ref<Todo[]> = ref([])
  const loading = ref(false)
  const error = ref('')
  const statistics: Ref<Statistics | null> = ref(null)
  const selectedTodos = ref<number[]>([])

  const API_URL = API_ENDPOINTS.todos

  // 搜索和过滤状态
  const searchQuery = ref('')
  const filterPriority = ref<string>('')
  const filterCategory = ref<number | null>(null)
  const filterCompleted = ref<boolean | undefined>(undefined)
  const filterDueDate = ref<string>('')

  // 计算属���：过滤后的todos
  const filteredTodos = computed(() => {
    let filtered = todos.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      )
    }

    if (filterPriority.value) {
      filtered = filtered.filter((t) => t.priority === filterPriority.value)
    }

    if (filterCategory.value) {
      filtered = filtered.filter((t) => t.categoryId === filterCategory.value)
    }

    if (filterCompleted.value !== undefined) {
      filtered = filtered.filter((t) => t.isCompleted === filterCompleted.value)
    }

    if (filterDueDate.value) {
      filtered = filtered.filter((t) => t.dueDate === filterDueDate.value)
    }

    return filtered
  })

  async function fetchTodos() {
    loading.value = true
    try {
      const params: Record<string, string> = {}
      if (searchQuery.value) params.search = searchQuery.value
      if (filterPriority.value) params.priority = filterPriority.value
      if (filterCategory.value) params.categoryId = filterCategory.value.toString()
      if (filterCompleted.value !== undefined)
        params.isCompleted = filterCompleted.value.toString()
      if (filterDueDate.value) params.dueDate = filterDueDate.value

      const response = await axios.get(API_URL, { params })
      todos.value = response.data
    } catch (e) {
      error.value = 'Failed to fetch todos'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchStatistics() {
    try {
      const response = await axios.get(`${API_URL}/statistics`)
      statistics.value = response.data
    } catch (e) {
      error.value = 'Failed to fetch statistics'
      console.error(e)
    }
  }

  async function addTodo(todoData: Partial<Todo>) {
    try {
      const response = await axios.post(API_URL, todoData)
      todos.value.unshift(response.data)
      await fetchStatistics()
    } catch (e) {
      error.value = 'Failed to add todo'
      console.error(e)
    }
  }

  async function updateTodo(id: number, todoData: Partial<Todo>) {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, todoData)
      const index = todos.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        todos.value[index] = response.data
      }
      await fetchStatistics()
    } catch (e) {
      error.value = 'Failed to update todo'
      console.error(e)
    }
  }

  async function toggleTodo(todo: Todo) {
    try {
      const response = await axios.patch(`${API_URL}/${todo.id}/toggle`)
      const index = todos.value.findIndex((t) => t.id === todo.id)
      if (index !== -1) {
        todos.value[index] = response.data
      }
      await fetchStatistics()
    } catch (e) {
      error.value = 'Failed to toggle todo'
      console.error(e)
    }
  }

  async function deleteTodo(id: number) {
    try {
      await axios.delete(`${API_URL}/${id}`)
      todos.value = todos.value.filter((t) => t.id !== id)
      await fetchStatistics()
    } catch (e) {
      error.value = 'Failed to delete todo'
      console.error(e)
    }
  }

  // 子任务相关方法
  async function addSubTask(todoId: number, title: string) {
    try {
      const response = await axios.post(`${API_URL}/${todoId}/subtasks`, {
        todoId,
        title
      })
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        todo.subtasks.push(response.data)
      }
    } catch (e) {
      error.value = 'Failed to add subtask'
      console.error(e)
    }
  }

  async function toggleSubTask(subTaskId: number, todoId: number) {
    try {
      const response = await axios.patch(
        `${API_URL}/subtasks/${subTaskId}/toggle`
      )
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        const subtaskIndex = todo.subtasks.findIndex((st) => st.id === subTaskId)
        if (subtaskIndex !== -1) {
          todo.subtasks[subtaskIndex] = response.data
        }
      }
    } catch (e) {
      error.value = 'Failed to toggle subtask'
      console.error(e)
    }
  }

  async function deleteSubTask(subTaskId: number, todoId: number) {
    try {
      await axios.delete(`${API_URL}/subtasks/${subTaskId}`)
      const todo = todos.value.find((t) => t.id === todoId)
      if (todo) {
        todo.subtasks = todo.subtasks.filter((st) => st.id !== subTaskId)
      }
    } catch (e) {
      error.value = 'Failed to delete subtask'
      console.error(e)
    }
  }

  // 批量操作
  async function batchDelete(ids: number[]) {
    try {
      await axios.delete(`${API_URL}/batch`, { data: { ids } })
      todos.value = todos.value.filter((t) => !ids.includes(t.id))
      selectedTodos.value = []
      await fetchStatistics()
    } catch (e) {
      error.value = 'Failed to batch delete'
      console.error(e)
    }
  }

  async function batchUpdate(ids: number[], updates: Partial<Todo>) {
    try {
      await axios.patch(`${API_URL}/batch/update`, { ids, ...updates })
      await fetchTodos()
      selectedTodos.value = []
      await fetchStatistics()
    } catch (e) {
      error.value = 'Failed to batch update'
      console.error(e)
    }
  }

  function toggleSelectTodo(id: number) {
    const index = selectedTodos.value.indexOf(id)
    if (index > -1) {
      selectedTodos.value.splice(index, 1)
    } else {
      selectedTodos.value.push(id)
    }
  }

  function clearSelection() {
    selectedTodos.value = []
  }

  return {
    todos,
    filteredTodos,
    loading,
    error,
    statistics,
    selectedTodos,
    searchQuery,
    filterPriority,
    filterCategory,
    filterCompleted,
    filterDueDate,
    fetchTodos,
    fetchStatistics,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    batchDelete,
    batchUpdate,
    toggleSelectTodo,
    clearSelection
  }
})
