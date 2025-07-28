import axios from "axios"

// Create an axios instance with default config
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://angulus-be.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors here
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem("token")
      if (typeof window !== "undefined") {
        window.location.href = "/auth"
      }
    }
    return Promise.reject(error)
  },
)

// API functions that match your Vue.js implementation
export const agentAPI = {
  getAll: () => api.get("/agents"),
  getById: (id: string) => api.get(`/agents/${id}`),
  create: (data: any) => api.post("/agents", data),
  update: (id: string, data: any) => api.put(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
}

export const messageAPI = {
  send: (data: { content: string; agent_id: string; session_id?: string | null }) => api.post("/message", data),
}

export const toolAPI = {
  getAll: () => api.get("/tools"),
}

export const historyAPI = {
  getPromptHistory: () => api.get("/prompt-history"),
}

export const settingsAPI = {
  get: () => api.get("/settings"),
  update: (data: any) => api.patch("/settings", data),
}

export const statusAPI = {
  get: () => api.get("/status"),
  getLogs: () => api.get("/logs"),
  exportLogs: () => api.get("/log-exports", { responseType: "blob" }),
}
