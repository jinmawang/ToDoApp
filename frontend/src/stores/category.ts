import { defineStore } from 'pinia'
import axios from 'axios'
import type { Ref } from 'vue'
import { ref } from 'vue'
import type { Category } from './todo'
import { API_ENDPOINTS } from '@/config/api'

export const useCategoryStore = defineStore('category', () => {
  const categories: Ref<Category[]> = ref([])
  const loading = ref(false)
  const error = ref('')

  const API_URL = API_ENDPOINTS.categories

  async function fetchCategories() {
    loading.value = true
    try {
      const response = await axios.get(API_URL)
      categories.value = response.data
    } catch (e) {
      error.value = 'Failed to fetch categories'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addCategory(categoryData: Partial<Category>) {
    try {
      const response = await axios.post(API_URL, categoryData)
      categories.value.push(response.data)
    } catch (e) {
      error.value = 'Failed to add category'
      console.error(e)
    }
  }

  async function updateCategory(id: number, categoryData: Partial<Category>) {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, categoryData)
      const index = categories.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
    } catch (e) {
      error.value = 'Failed to update category'
      console.error(e)
    }
  }

  async function deleteCategory(id: number) {
    try {
      await axios.delete(`${API_URL}/${id}`)
      categories.value = categories.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = 'Failed to delete category'
      console.error(e)
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  }
})
