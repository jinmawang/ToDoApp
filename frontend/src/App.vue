<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastNotification from './components/ToastNotification.vue'
import { useToast } from './composables/useToast'

const { toasts } = useToast()
const remove = (id: number) => {
  const { remove } = useToast()
  remove(id)
}
</script>

<template>
  <div class="app-container">
    <RouterView />
    <ToastNotification :toasts="toasts" @remove="remove" />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
