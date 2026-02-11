// API 配置
// 生产环境使用 VITE_API_BASE_URL，开发环境使用 VITE_API_PORT

const getApiBaseUrl = (): string => {
  // 生产环境：使用完整的 API URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 开发环境：使用端口号
  const port = import.meta.env.VITE_API_PORT || '3000';
  return `http://localhost:${port}`;
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  todos: `${API_BASE_URL}/todos`,
  categories: `${API_BASE_URL}/categories`,
  health: `${API_BASE_URL}/health`
};

/**
 * Get current backend name based on port
 */
export function getBackendName(): string {
  const port = import.meta.env.VITE_API_PORT || '3000';
  switch (port) {
    case '3000':
      return 'NestJS (TypeScript)';
    case '3001':
      return 'FastAPI (Python)';
    case '3002':
      return 'Spring Boot (Java)';
    default:
      return 'Unknown';
  }
}

export default {
  baseURL: API_BASE_URL,
};
