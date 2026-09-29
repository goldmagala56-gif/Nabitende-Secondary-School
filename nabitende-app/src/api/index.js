import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('Nabitende SS_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401){
      localStorage.removeItem('Nabitende SS_token')
      localStorage.removeItem('Nabitende SS_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
