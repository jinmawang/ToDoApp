/**
 * API Configuration
 * Reads the API port from environment variable
 */

const API_PORT = import.meta.env.VITE_API_PORT || '3000'

export const API_BASE_URL = `http://localhost:${API_PORT}`

export const API_ENDPOINTS = {
  todos: `${API_BASE_URL}/todos`,
  categories: `${API_BASE_URL}/categories`,
  health: `${API_BASE_URL}/health`
}

/**
 * Get current backend name based on port
 */
export function getBackendName(): string {
  const port = API_PORT
  switch (port) {
    case '3000':
      return 'NestJS (TypeScript)'
    case '3001':
      return 'FastAPI (Python)'
    case '3002':
      return 'Spring Boot (Java)'
    default:
      return 'Unknown'
  }
}
