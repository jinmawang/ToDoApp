<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTodoStore } from '../stores/todo'
import { storeToRefs } from 'pinia'
import type { Statistics } from '../stores/todo'

const todoStore = useTodoStore()
const { statistics } = storeToRefs(todoStore)

onMounted(() => {
  todoStore.fetchStatistics()
})

const priorityColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e'
}

const circumference = 2 * Math.PI * 45
const completionDashArray = computed(() => {
  if (!statistics.value) return '0 251.2'
  const percentage = statistics.value.completionRate / 100
  const dashArray = percentage * circumference
  return `${dashArray} ${circumference}`
})
</script>

<template>
  <div class="statistics-dashboard">
    <h2>📊 ��计仪表板</h2>

    <div v-if="!statistics" class="loading">加载中...</div>

    <div v-else class="stats-container">
      <!-- 总览卡片 -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.total }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>

        <div class="stat-card overdue" v-if="statistics.overdueCount > 0">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.overdueCount }}</div>
            <div class="stat-label">已逾期</div>
          </div>
        </div>
      </div>

      <!-- 完成率圆环图 -->
      <div class="completion-rate">
        <h3>完成率</h3>
        <div class="progress-ring">
          <svg width="120" height="120">
            <circle
              class="progress-ring-circle-bg"
              stroke-width="10"
              fill="transparent"
              r="45"
              cx="60"
              cy="60"
            />
            <circle
              class="progress-ring-circle"
              :stroke-dasharray="completionDashArray"
              stroke-width="10"
              fill="transparent"
              r="45"
              cx="60"
              cy="60"
            />
          </svg>
          <div class="progress-text">{{ statistics.completionRate }}%</div>
        </div>
      </div>

      <!-- 优先级分布 -->
      <div class="priority-distribution">
        <h3>优先级分布</h3>
        <div class="priority-bars">
          <div class="priority-bar">
            <div class="priority-label">高优先级</div>
            <div class="bar-container">
              <div
                class="bar high"
                :style="{ width: (statistics.priorityStats.high / statistics.total * 100) + '%' }"
              ></div>
            </div>
            <div class="priority-count">{{ statistics.priorityStats.high }}</div>
          </div>

          <div class="priority-bar">
            <div class="priority-label">中优先级</div>
            <div class="bar-container">
              <div
                class="bar medium"
                :style="{ width: (statistics.priorityStats.medium / statistics.total * 100) + '%' }"
              ></div>
            </div>
            <div class="priority-count">{{ statistics.priorityStats.medium }}</div>
          </div>

          <div class="priority-bar">
            <div class="priority-label">低优先级</div>
            <div class="bar-container">
              <div
                class="bar low"
                :style="{ width: (statistics.priorityStats.low / statistics.total * 100) + '%' }"
              ></div>
            </div>
            <div class="priority-count">{{ statistics.priorityStats.low }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-dashboard {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.statistics-dashboard h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.stats-container {
  display: grid;
  gap: 1.5rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-card.overdue {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.completion-rate {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.completion-rate h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #374151;
}

.progress-ring {
  position: relative;
  display: inline-block;
}

.progress-ring-circle-bg {
  stroke: #e5e7eb;
  transition: stroke-dasharray 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.progress-ring-circle {
  stroke: #667eea;
  transition: stroke-dasharray 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: #374151;
}

.priority-distribution {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
}

.priority-distribution h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #374151;
}

.priority-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.priority-bar {
  display: grid;
  grid-template-columns: 80px 1fr 40px;
  align-items: center;
  gap: 1rem;
}

.priority-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.bar-container {
  background: #e5e7eb;
  border-radius: 4px;
  height: 24px;
  overflow: hidden;
}

.bar {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.bar.high {
  background: #ef4444;
}

.bar.medium {
  background: #f59e0b;
}

.bar.low {
  background: #22c55e;
}

.priority-count {
  text-align: right;
  font-weight: bold;
  color: #374151;
}

/* 深色主题支持 */
:global(.dark) .statistics-dashboard {
  background: #1f2937;
}

:global(.dark) .statistics-dashboard h2,
:global(.dark) .completion-rate h3,
:global(.dark) .priority-distribution h3,
:global(.dark) .progress-text,
:global(.dark) .priority-count {
  color: #f9fafb;
}

:global(.dark) .completion-rate,
:global(.dark) .priority-distribution {
  background: #374151;
}

:global(.dark) .progress-ring-circle-bg {
  stroke: #4b5563;
}

:global(.dark) .bar-container {
  background: #4b5563;
}
</style>
