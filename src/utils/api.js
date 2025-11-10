import axios from 'axios'

// Базовый URL API (в реальном приложении - из переменных окружения)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Интерцептор для добавления токена (если нужна авторизация)
api.interceptors.request.use(
  (config) => {
    // Здесь можно добавить токен из localStorage или MAX Bridge
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// API методы
export const requestsAPI = {
  getAll: (filters = {}) => api.get('/requests', { params: filters }),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  update: (id, data) => api.put(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
  respond: (id, data) => api.post(`/requests/${id}/respond`, data)
}

export const organizationsAPI = {
  register: (data) => api.post('/organizations/register', data),
  getById: (id) => api.get(`/organizations/${id}`),
  update: (id, data) => api.put(`/organizations/${id}`, data)
}

export const chatAPI = {
  getMessages: (chatId) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (chatId, message) => api.post(`/chats/${chatId}/messages`, { text: message }),
  createChat: (requestId, userId) => api.post('/chats', { requestId, userId })
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getRequests: () => api.get('/users/requests'),
  getResponses: () => api.get('/users/responses')
}

export default api

