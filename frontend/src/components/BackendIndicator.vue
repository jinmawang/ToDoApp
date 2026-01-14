<script setup lang="ts">
import { computed } from 'vue'
import { API_BASE_URL, getBackendName } from '../config/api'

const backendName = computed(() => getBackendName())
const apiPort = computed(() => {
  const match = API_BASE_URL.match(/:(\d+)$/)
  return match ? match[1] : 'unknown'
})

const backendInfo = computed(() => {
  const name = backendName.value
  if (name.includes('NestJS')) {
    return {
      language: 'TypeScript',
      framework: 'NestJS',
      color: '#3178c6',
      icon: '⚡',
      description: 'Node.js Enterprise Framework'
    }
  } else if (name.includes('FastAPI')) {
    return {
      language: 'Python',
      framework: 'FastAPI',
      color: '#009688',
      icon: '🐍',
      description: 'Modern Python Web Framework'
    }
  } else if (name.includes('Spring Boot')) {
    return {
      language: 'Java',
      framework: 'Spring Boot',
      color: '#6db33f',
      icon: '☕',
      description: 'Enterprise Java Framework'
    }
  }
  return {
    language: 'Unknown',
    framework: 'Unknown',
    color: '#666',
    icon: '❓',
    description: 'Unknown Backend'
  }
})
</script>

<template>
  <div class="backend-indicator">
    <div class="indicator-content">
      <div class="backend-icon" :style="{ backgroundColor: backendInfo.color }">
        {{ backendInfo.icon }}
      </div>
      <div class="backend-details">
        <div class="backend-title">Backend Service</div>
        <div class="backend-info">
          <span class="backend-language">{{ backendInfo.language }}</span>
          <span class="separator">·</span>
          <span class="backend-framework">{{ backendInfo.framework }}</span>
          <span class="separator">·</span>
          <span class="backend-port">Port {{ apiPort }}</span>
        </div>
        <div class="backend-description">{{ backendInfo.description }}</div>
      </div>
      <div class="connection-status">
        <div class="status-dot"></div>
        <span class="status-text">Connected</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backend-indicator {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.backend-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.backend-details {
  flex: 1;
  color: white;
}

.backend-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.backend-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}

.backend-language {
  color: #ffd700;
}

.backend-framework {
  color: white;
}

.backend-port {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

.separator {
  opacity: 0.6;
}

.backend-description {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .backend-indicator {
    padding: 12px 16px;
    margin-bottom: 16px;
  }

  .indicator-content {
    gap: 12px;
  }

  .backend-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .backend-info {
    font-size: 14px;
  }

  .backend-port {
    font-size: 12px;
  }
}
</style>
