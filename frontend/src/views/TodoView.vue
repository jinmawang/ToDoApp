<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '../stores/todo'
import { useCategoryStore } from '../stores/category'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import CategoryManager from '../components/CategoryManager.vue'
import BackendIndicator from '../components/BackendIndicator.vue'

const router = useRouter()
const todoStore = useTodoStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const { filteredTodos, loading, error, statistics } = storeToRefs(todoStore)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const newTodoTitle = ref('')
const showAddForm = ref(false)
const searchInput = ref('')
const selectedCategory = ref<number | null>(null)
const selectedPriority = ref<string>('')

// 新建任务的表单数据
const newTodoDescription = ref('')
const newTodoPriority = ref<'low' | 'medium' | 'high'>('medium')
const newTodoCategory = ref<number | null>(null)
const newTodoDueDate = ref('')
const newSubTaskTitle = ref('')
const newSubTasks = ref<string[]>([])

onMounted(async () => {
  await Promise.all([
    todoStore.fetchTodos(),
    categoryStore.fetchCategories(),
    todoStore.fetchStatistics()
  ])
})

const handleAddTodo = async () => {
  if (newTodoTitle.value.trim()) {
    const todoData = {
      title: newTodoTitle.value,
      description: newTodoDescription.value,
      priority: newTodoPriority.value,
      dueDate: newTodoDueDate.value || null,
      categoryId: newTodoCategory.value,
      subtasks: newSubTasks.value.map(title => ({ title }))
    }

    await todoStore.addTodo(todoData)

    // 重置表单
    newTodoTitle.value = ''
    newTodoDescription.value = ''
    newTodoPriority.value = 'medium'
    newTodoCategory.value = null
    newTodoDueDate.value = ''
    newSubTaskTitle.value = ''
    newSubTasks.value = []
    showAddForm.value = false
  }
}

const addSubTask = () => {
  if (newSubTaskTitle.value.trim()) {
    newSubTasks.value.push(newSubTaskTitle.value.trim())
    newSubTaskTitle.value = ''
  }
}

const removeSubTask = (index: number) => {
  newSubTasks.value.splice(index, 1)
}

const handleAddSubTaskKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    addSubTask()
  }
}

const handleSearch = () => {
  todoStore.searchQuery = searchInput.value
  todoStore.fetchTodos()
}

const handleFilterByCategory = (categoryId: number | null) => {
  selectedCategory.value = categoryId
  todoStore.filterCategory = categoryId
  todoStore.fetchTodos()
}

const handleFilterByPriority = (priority: string) => {
  selectedPriority.value = selectedPriority.value === priority ? '' : priority
  todoStore.filterPriority = selectedPriority.value
  todoStore.fetchTodos()
}

const getPriorityColor = (priority: string) => {
  const colors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e'
  }
  return colors[priority as keyof typeof colors] || '#6b7280'
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority as keyof typeof labels] || priority
}

const isOverdue = (todo: any) => {
  if (!todo.dueDate) return false
  return new Date(todo.dueDate) < new Date() && !todo.isCompleted
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return '今天'
  if (date.toDateString() === tomorrow.toDateString()) return '明天'
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 按完成状态和优先级分组
const groupedTodos = computed(() => {
  const pending = filteredTodos.value.filter(t => !t.isCompleted)
  const completed = filteredTodos.value.filter(t => t.isCompleted)

  // 按优先级排序
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  pending.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])

  return { pending, completed }
})
</script>

<template>
  <div class="todo-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">📝</span>
          <span>Todo List</span>
        </h1>
        <div class="header-actions">
          <div class="user-info">
            <span class="user-name">{{ authStore.displayName }}</span>
            <button @click="handleLogout" class="btn-logout">
              登出
            </button>
          </div>
          <CategoryManager />
          <button @click="showAddForm = !showAddForm" class="btn-add" :class="{ active: showAddForm }">
            <span class="btn-icon">{{ showAddForm ? '−' : '+' }}</span>
            <span>{{ showAddForm ? '收起' : '新建任务' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 统计卡片 -->
      <div v-if="statistics" class="stats-cards">
        <div class="stat-card total">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.total }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
        <div class="stat-card rate">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </div>
      </div>

      <!-- 后端服务指示器 -->
      <BackendIndicator />

      <!-- 添加任务表单 -->
      <div v-if="showAddForm" class="add-todo-card">
        <div class="form-header">
          <h3>✨ 创建新任务</h3>
        </div>
        <div class="form-content">
          <input
            v-model="newTodoTitle"
            @keyup.enter="handleAddTodo"
            placeholder="输入任务标题..."
            type="text"
            class="input-primary"
            autoFocus
          />

          <textarea
            v-model="newTodoDescription"
            placeholder="输入任务描述（可选）..."
            class="input-description"
            rows="3"
          ></textarea>

          <!-- 优先级选择 -->
          <div class="form-group-inline">
            <label class="form-label">优先级：</label>
            <div class="priority-selector">
              <button
                @click="newTodoPriority = 'low'"
                :class="['priority-option', 'low', { active: newTodoPriority === 'low' }]"
              >
                🟢 低
              </button>
              <button
                @click="newTodoPriority = 'medium'"
                :class="['priority-option', 'medium', { active: newTodoPriority === 'medium' }]"
              >
                🟡 中
              </button>
              <button
                @click="newTodoPriority = 'high'"
                :class="['priority-option', 'high', { active: newTodoPriority === 'high' }]"
              >
                🔴 高
              </button>
            </div>
          </div>

          <!-- 分类选择 -->
          <div class="form-group-inline">
            <label class="form-label">分类：</label>
            <select v-model="newTodoCategory" class="select-input">
              <option :value="null">无分类</option>
              <option
                v-for="category in categoryStore.categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>

          <!-- 截止日期 -->
          <div class="form-group-inline">
            <label class="form-label">截止日期：</label>
            <input
              v-model="newTodoDueDate"
              type="date"
              class="date-input"
              :min="new Date().toISOString().split('T')[0]"
            />
          </div>

          <!-- 子任务 -->
          <div class="subtasks-add-section">
            <label class="form-label">子任务：</label>
            <div class="subtask-input-row">
              <input
                v-model="newSubTaskTitle"
                @keyup.enter="handleAddSubTaskKeyUp"
                type="text"
                placeholder="输入子任务名称..."
                class="input-subtask"
              />
              <button @click="addSubTask" class="btn-add-subtask">
                <span>+</span>
                <span>添加</span>
              </button>
            </div>

            <!-- 子任务列表 -->
            <div v-if="newSubTasks.length > 0" class="new-subtasks-list">
              <div
                v-for="(subtask, index) in newSubTasks"
                :key="index"
                class="new-subtask-item"
              >
                <span class="subtask-bullet">•</span>
                <span class="subtask-text">{{ subtask }}</span>
                <button @click="removeSubTask(index)" class="btn-remove-subtask">×</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="handleAddTodo" class="btn-primary">
              <span>✓</span>
              <span>创建任务</span>
            </button>
            <button @click="showAddForm = false; newTodoTitle = ''; newTodoDescription = ''; newTodoPriority = 'medium'; newTodoCategory = null; newTodoDueDate = ''; newSubTaskTitle = ''; newSubTasks = []" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 搜索和过滤栏 -->
      <div class="filter-section">
        <div class="search-box">
          <input
            v-model="searchInput"
            @keyup.enter="handleSearch"
            placeholder="搜索任务..."
            type="text"
            class="search-input"
          />
          <button @click="handleSearch" class="btn-search">🔍</button>
        </div>

        <!-- 分类过滤 -->
        <div class="filter-tags">
          <button
            @click="handleFilterByCategory(null)"
            :class="['filter-tag', { active: selectedCategory === null }]"
          >
            全部
          </button>
          <button
            v-for="category in categoryStore.categories"
            :key="category.id"
            @click="handleFilterByCategory(category.id)"
            :class="['filter-tag', { active: selectedCategory === category.id }]"
            :style="{ borderColor: selectedCategory === category.id ? category.color : '' }"
          >
            {{ category.icon }} {{ category.name }}
          </button>
        </div>

        <!-- 优先级过滤 -->
        <div class="priority-filters">
          <button
            @click="handleFilterByPriority('high')"
            :class="['priority-btn', 'high', { active: selectedPriority === 'high' }]"
          >
            🔴 高
          </button>
          <button
            @click="handleFilterByPriority('medium')"
            :class="['priority-btn', 'medium', { active: selectedPriority === 'medium' }]"
          >
            🟡 中
          </button>
          <button
            @click="handleFilterByPriority('low')"
            :class="['priority-btn', 'low', { active: selectedPriority === 'low' }]"
          >
            🟢 低
          </button>
        </div>
      </div>

      <!-- 加载和错误状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-if="error" class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <!-- 任务列表 -->
      <div v-if="!loading" class="todo-sections">
        <!-- 待完成任务 -->
        <div v-if="groupedTodos.pending.length > 0" class="todo-section">
          <h2 class="section-title">
            <span class="title-dot"></span>
            待处理
            <span class="count">{{ groupedTodos.pending.length }}</span>
          </h2>
          <div class="todo-list">
            <div
              v-for="todo in groupedTodos.pending"
              :key="todo.id"
              :class="['todo-card', { overdue: isOverdue(todo) }]"
            >
              <div class="todo-main">
                <button
                  @click="todoStore.toggleTodo(todo)"
                  class="checkbox-btn"
                  :class="{ checked: todo.isCompleted }"
                >
                  <span class="checkbox-icon">✓</span>
                </button>
                <div class="todo-content">
                  <h3 class="todo-title">{{ todo.title }}</h3>
                  <p v-if="todo.description" class="todo-description">{{ todo.description }}</p>
                  <div class="todo-meta">
                    <span
                      class="priority-badge"
                      :style="{ backgroundColor: getPriorityColor(todo.priority) }"
                    >
                      {{ getPriorityLabel(todo.priority) }}
                    </span>
                    <span v-if="todo.dueDate" class="due-date" :class="{ overdue: isOverdue(todo) }">
                      📅 {{ formatDate(todo.dueDate) }}
                      <span v-if="isOverdue(todo)" class="overdue-text">已逾期</span>
                    </span>
                    <span v-if="todo.category" class="category-badge" :style="{ color: todo.category.color }">
                      {{ todo.category.icon }} {{ todo.category.name }}
                    </span>
                  </div>
                </div>
                <button @click="todoStore.deleteTodo(todo.id)" class="btn-delete">
                  🗑️
                </button>
              </div>

              <!-- 子任务 -->
              <div v-if="todo.subtasks && todo.subtasks.length > 0" class="subtasks-section">
                <div class="subtasks-header">
                  <span class="subtasks-label">子任务</span>
                  <span class="subtasks-count">{{ todo.subtasks.filter((st: any) => st.isCompleted).length }}/{{ todo.subtasks.length }}</span>
                </div>
                <div class="subtasks-list">
                  <div
                    v-for="subtask in todo.subtasks"
                    :key="subtask.id"
                    class="subtask-item"
                  >
                    <button
                      @click="todoStore.toggleSubTask(subtask.id, todo.id)"
                      class="checkbox-small"
                      :class="{ checked: subtask.isCompleted }"
                    >
                      <span class="checkbox-icon-small">✓</span>
                    </button>
                    <span :class="['subtask-title', { completed: subtask.isCompleted }]">{{ subtask.title }}</span>
                    <button
                      @click="todoStore.deleteSubTask(subtask.id, todo.id)"
                      class="btn-delete-small"
                    >×</button>
                  </div>
                </div>
                <!-- 进度条 -->
                <div class="progress-section">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: todo.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ todo.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 已完成任务 -->
        <div v-if="groupedTodos.completed.length > 0" class="todo-section completed-section">
          <h2 class="section-title completed">
            <span class="title-dot"></span>
            已完成
            <span class="count">{{ groupedTodos.completed.length }}</span>
          </h2>
          <div class="todo-list">
            <div
              v-for="todo in groupedTodos.completed"
              :key="todo.id"
              class="todo-card completed"
            >
              <div class="todo-main">
                <button
                  @click="todoStore.toggleTodo(todo)"
                  class="checkbox-btn checked"
                >
                  <span class="checkbox-icon">✓</span>
                </button>
                <div class="todo-content">
                  <h3 class="todo-title">{{ todo.title }}</h3>
                  <div class="todo-meta">
                    <span
                      class="priority-badge"
                      :style="{ backgroundColor: getPriorityColor(todo.priority) }"
                    >
                      {{ getPriorityLabel(todo.priority) }}
                    </span>
                  </div>
                </div>
                <button @click="todoStore.deleteTodo(todo.id)" class="btn-delete">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredTodos.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>暂无任务</h3>
          <p>点击上方"新建任务"开始添加你的第一个任务吧</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局布局 */
.todo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 12px;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.btn-logout {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #9ca3af;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2.5rem;
}

.btn-add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-add.active {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.btn-icon {
  font-size: 1.25rem;
  font-weight: 300;
}

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* 添加任务表单 */
.add-todo-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-header {
  margin-bottom: 1rem;
}

.form-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-primary {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-primary:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-description {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.input-description:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-description::placeholder {
  color: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  padding: 0.875rem 1.5rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* 表单内联组 */
.form-group-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  min-width: 80px;
}

/* 优先级选择器 */
.priority-selector {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.priority-option {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.priority-option:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.priority-option.low.active {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #22c55e;
}

.priority-option.medium.active {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #f59e0b;
}

.priority-option.high.active {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

/* 选择框和日期输入 */
.select-input,
.date-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.select-input:focus,
.date-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}

/* 子任务添加区域 */
.subtasks-add-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.subtask-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.input-subtask {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-subtask:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-add-subtask {
  background: #22c55e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add-subtask:hover {
  background: #16a34a;
  transform: translateY(-1px);
}

.btn-add-subtask span:first-child {
  font-size: 1.25rem;
  font-weight: 300;
  line-height: 1;
}

.new-subtasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0;
}

.new-subtask-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

.new-subtask-item:hover {
  background: #f3f4f6;
}

.subtask-bullet {
  color: #667eea;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.subtask-text {
  flex: 1;
  font-size: 0.9375rem;
  color: #374151;
}

.btn-remove-subtask {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 1.5rem;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1;
  opacity: 0.6;
}

.btn-remove-subtask:hover {
  background: #fef2f2;
  opacity: 1;
}

/* 过滤区域 */
.filter-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-box {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-search {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
}

.btn-search:hover {
  background: #5a67d8;
}

.filter-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.filter-tag {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
}

.filter-tag:hover {
  background: #e5e7eb;
}

.filter-tag.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.priority-filters {
  display: flex;
  gap: 0.5rem;
}

.priority-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid transparent;
  transition: all 0.2s;
  background: #f3f4f6;
}

.priority-btn.high.active {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.priority-btn.medium.active {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #f59e0b;
}

.priority-btn.low.active {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #22c55e;
}

/* 加载和错误状态 */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-banner {
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #dc2626;
}

/* 任务区域 */
.todo-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.todo-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-dot {
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.section-title.completed .title-dot {
  background: #d1d5db;
}

.count {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* 任务卡片 */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.todo-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s;
  border-left: 4px solid #667eea;
}

.todo-card:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.todo-card.overdue {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.todo-card.completed {
  opacity: 0.6;
}

.todo-main {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.checkbox-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.checkbox-btn:hover {
  border-color: #667eea;
}

.checkbox-btn.checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.checkbox-icon {
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.todo-card.completed .todo-title {
  text-decoration: line-through;
  color: #9ca3af;
}

.todo-description {
  margin: 0.5rem 0;
  color: #6b7280;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.todo-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.due-date {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.due-date.overdue {
  color: #ef4444;
}

.overdue-text {
  font-weight: 700;
  margin-left: 0.25rem;
}

.category-badge {
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-delete {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.25rem;
  opacity: 0;
  transition: all 0.2s;
  border-radius: 6px;
}

.todo-card:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: #fef2f2;
}

/* 子任务 */
.subtasks-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.subtasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.subtasks-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.subtasks-count {
  font-size: 0.75rem;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border-radius: 8px;
  transition: all 0.2s;
}

.subtask-item:hover {
  background: #f9fafb;
}

.checkbox-small {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox-small:hover {
  border-color: #667eea;
}

.checkbox-small.checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.checkbox-icon-small {
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
}

.subtask-title {
  flex: 1;
  font-size: 0.9375rem;
  color: #374151;
}

.subtask-title.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.btn-delete-small {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  line-height: 1;
  padding: 0 0.25rem;
}

.subtask-item:hover .btn-delete-small {
  opacity: 1;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #374151;
}

.empty-state p {
  margin: 0;
  color: #9ca3af;
  font-size: 1rem;
}

/* 已完成任务区域 */
.completed-section {
  opacity: 0.8;
}

.completed-section .todo-card {
  border-left-color: #d1d5db;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .main-content {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .title-icon {
    font-size: 2rem;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .btn-add span:last-child {
    display: none;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}

/* 深色主题 */
:global(.dark) .todo-page {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

:global(.dark) .page-header,
:global(.dark) .add-todo-card,
:global(.dark) .filter-section,
:global(.dark) .todo-section,
:global(.dark) .empty-state {
  background: rgba(31, 41, 55, 0.95);
}

:global(.dark) .page-title {
  color: #f9fafb;
}

:global(.dark) .stat-card,
:global(.dark) .todo-card {
  background: #374151;
}

:global(.dark) .stat-number,
:global(.dark) .section-title,
:global(.dark) .todo-title,
:global(.dark) .form-header h3,
:global(.dark) .empty-state h3 {
  color: #f9fafb;
}

:global(.dark) .input-primary,
:global(.dark) .search-input,
:global(.dark) .input-description {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

:global(.dark) .select-input,
:global(.dark) .date-input {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

:global(.dark) .priority-option {
  background: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}

:global(.dark) .priority-option:hover {
  border-color: #667eea;
  background: #4b5563;
}

:global(.dark) .form-label {
  color: #d1d5db;
}

:global(.dark) .todo-card.overdue {
  background: #451a1a;
}

:global(.dark) .checkbox-btn {
  background: #374151;
  border-color: #4b5563;
}

:global(.dark) .subtask-item {
  background: #374151;
}
</style>
