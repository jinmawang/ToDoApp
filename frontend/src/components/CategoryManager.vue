<script setup lang="ts">
import { ref } from 'vue'
import { useCategoryStore } from '../stores/category'
import { storeToRefs } from 'pinia'
import type { Category } from '../stores/todo'

const categoryStore = useCategoryStore()
const { categories } = storeToRefs(categoryStore)

const showManager = ref(false)
const showAddForm = ref(false)
const editingCategory = ref<Category | null>(null)

// 新建分类表单
const newCategoryName = ref('')
const newCategoryColor = ref('#3B82F6')
const newCategoryIcon = ref('📁')

// 预设颜色
const presetColors = [
  '#3B82F6', // 蓝色
  '#22c55e', // 绿色
  '#f59e0b', // 橙色
  '#ef4444', // 红色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#06b6d4', // 青色
  '#6b7280', // 灰色
]

// 预设图标
const presetIcons = [
  '💼', '🏠', '📚', '💻', '🎯',
  '🎨', '🎵', '🏃', '🍔', '✈️',
  '💰', '🎁', '🔧', '📱', '🌟',
  '❤️', '⭐', '🔥', '💡', '📝'
]

const openManager = () => {
  showManager.value = true
}

const closeManager = () => {
  showManager.value = false
  showAddForm.value = false
  editingCategory.value = null
  newCategoryName.value = ''
  newCategoryColor.value = '#3B82F6'
  newCategoryIcon.value = '📁'
}

const openAddForm = () => {
  showAddForm.value = true
  editingCategory.value = null
  newCategoryName.value = ''
  newCategoryColor.value = '#3B82F6'
  newCategoryIcon.value = '📁'
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  newCategoryName.value = category.name
  newCategoryColor.value = category.color
  newCategoryIcon.value = category.icon
  showAddForm.value = true
}

const handleSave = async () => {
  if (!newCategoryName.value.trim()) return

  if (editingCategory.value) {
    await categoryStore.updateCategory(editingCategory.value.id, {
      name: newCategoryName.value,
      color: newCategoryColor.value,
      icon: newCategoryIcon.value
    })
  } else {
    await categoryStore.addCategory({
      name: newCategoryName.value,
      color: newCategoryColor.value,
      icon: newCategoryIcon.value
    })
  }

  closeManager()
}

const handleDelete = async (id: number) => {
  if (confirm('确定要删除这个分类吗？')) {
    await categoryStore.deleteCategory(id)
  }
}

const cancelEdit = () => {
  showAddForm.value = false
  editingCategory.value = null
  newCategoryName.value = ''
  newCategoryColor.value = '#3B82F6'
  newCategoryIcon.value = '📁'
}
</script>

<template>
  <div class="category-manager">
    <button @click="openManager" class="btn-manage-categories">
      <span>🏷️</span>
      <span>管理分类</span>
    </button>

    <!-- 分类管理面板 -->
    <div v-if="showManager" class="manager-overlay" @click="closeManager">
      <div class="manager-panel" @click.stop>
        <div class="manager-header">
          <h2>🏷️ 分类管理</h2>
          <button @click="closeManager" class="btn-close">×</button>
        </div>

        <!-- 添加/编辑表单 -->
        <div v-if="showAddForm" class="add-form-section">
          <h3>{{ editingCategory ? '编辑分类' : '新建分类' }}</h3>
          <div class="form-group">
            <label>分类名称</label>
            <input
              v-model="newCategoryName"
              type="text"
              placeholder="输入分类名称..."
              class="input-text"
              maxlength="20"
            />
          </div>

          <div class="form-group">
            <label>选择颜色</label>
            <div class="color-picker">
              <button
                v-for="color in presetColors"
                :key="color"
                @click="newCategoryColor = color"
                :class="['color-btn', { active: newCategoryColor === color }]"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
            <input
              v-model="newCategoryColor"
              type="color"
              class="color-input"
            />
          </div>

          <div class="form-group">
            <label>选择图标</label>
            <div class="icon-picker">
              <button
                v-for="icon in presetIcons"
                :key="icon"
                @click="newCategoryIcon = icon"
                :class="['icon-btn', { active: newCategoryIcon === icon }]"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <div class="form-preview">
            <span>预览：</span>
            <span class="preview-badge" :style="{ color: newCategoryColor }">
              {{ newCategoryIcon }} {{ newCategoryName || '分类名称' }}
            </span>
          </div>

          <div class="form-actions">
            <button @click="handleSave" class="btn-save">
              {{ editingCategory ? '保存' : '创建' }}
            </button>
            <button @click="cancelEdit" class="btn-cancel">取消</button>
          </div>
        </div>

        <!-- 分类列表 -->
        <div v-else class="categories-list">
          <div class="list-header">
            <h3>已有分类</h3>
            <button @click="openAddForm" class="btn-add-new">
              <span>+</span>
              <span>新建分类</span>
            </button>
          </div>

          <div v-if="categories.length === 0" class="empty-categories">
            <div class="empty-icon">🏷️</div>
            <p>暂无分类</p>
            <p>点击上方"新建分类"开始添加</p>
          </div>

          <div v-else class="category-items">
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-item"
            >
              <div class="category-info">
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
              </div>
              <div class="category-actions">
                <button
                  @click="editCategory(category)"
                  class="btn-edit"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  @click="handleDelete(category.id)"
                  class="btn-delete"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-manager {
  display: inline-block;
}

.btn-manage-categories {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-manage-categories:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 管理面板遮罩 */
.manager-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 1rem;
  margin: 0;
  box-sizing: border-box;
}

.manager-overlay::-webkit-scrollbar {
  width: 0;
}

.manager-panel {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
  position: relative;
}

.manager-panel::-webkit-scrollbar {
  width: 8px;
}

.manager-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.manager-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.manager-panel::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.manager-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #9ca3af;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  line-height: 1;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* 表单样式 */
.add-form-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.input-text {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-text:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.color-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #1f2937;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1f2937;
}

.color-input {
  width: 100%;
  height: 40px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.icon-btn {
  width: 50px;
  height: 50px;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 10px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

.icon-btn.active {
  background: #667eea;
  border-color: #667eea;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #667eea;
}

.form-preview {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.preview-badge {
  font-size: 1.125rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn-save {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-cancel {
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

.btn-cancel:hover {
  background: #e5e7eb;
}

/* 分类列表 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.list-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.btn-add-new {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-add-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.empty-categories {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-categories p {
  margin: 0.5rem 0;
  color: #9ca3af;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  border-left: 4px solid;
}

.category-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.125rem;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0;
}

.category-item:hover .btn-edit,
.category-item:hover .btn-delete {
  opacity: 1;
}

.btn-edit:hover {
  background: #dbeafe;
}

.btn-delete:hover {
  background: #fef2f2;
}

/* 深色主题 */
:global(.dark) .manager-panel {
  background: #1f2937;
}

:global(.dark) .manager-header h2,
:global(.dark) .add-form-section h3,
:global(.dark) .list-header h3,
:global(.dark) .category-name,
:global(.dark) .form-group label {
  color: #f9fafb;
}

:global(.dark) .input-text {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

:global(.dark) .icon-btn {
  background: #374151;
}

:global(.dark) .icon-btn:hover {
  background: #4b5563;
}

:global(.dark) .form-preview,
:global(.dark) .category-item {
  background: #374151;
}

:global(.dark) .category-item:hover {
  background: #4b5563;
}

:global(.dark) .btn-cancel {
  background: #374151;
  color: #d1d5db;
}

:global(.dark) .btn-cancel:hover {
  background: #4b5563;
}
</style>
