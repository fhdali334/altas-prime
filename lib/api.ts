import axios from "axios"
import { tokenManager } from "./auth-api"

// Create an axios instance with default config
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.atlasprimebr.com",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken()
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
    if (error.response?.status === 401) {
      tokenManager.removeToken()
      if (typeof window !== "undefined") {
        window.location.href = "/auth"
      }
    }
    return Promise.reject(error)
  },
)

// Chat API functions
export const chatAPI = {
  // Create new chat
  create: (data: { agent_id?: string; title?: string }) => api.post("/chats", data),

  // Get all user chats
  getAll: (params?: { limit?: number; skip?: number; agent_id?: string; status?: string }) =>
    api.get("/chats", { params }),

  // Get agent-specific chats
  getByAgent: (agentId: string, params?: { limit?: number }) => api.get(`/chats/agent/${agentId}`, { params }),

  // Get general chats
  getGeneral: (params?: { limit?: number }) => api.get("/chats/general", { params }),

  // Get chat details with messages
  getById: (chatId: string, params?: { limit?: number; skip?: number }) => api.get(`/chats/${chatId}`, { params }),

  // Send message to chat
  sendMessage: (
    chatId: string,
    data: {
      content: string
      file_ids?: string[]
      include_file_content?: boolean
      max_file_tokens?: number
    },
  ) => api.post(`/chats/${chatId}/message`, data),

  // Delete chat
  delete: (chatId: string) => api.delete(`/chats/${chatId}`),

  // Update chat title
  updateTitle: (chatId: string, title: string) => api.patch(`/chats/${chatId}/title`, { title }),
}

// Agent API functions
export const agentAPI = {
  getAll: () => api.get("/agents"),
  getById: (id: string) => api.get(`/agents/${id}`),
  create: (data: {
    name: string
    instructions: string
    tools?: string[]
    icon_name?: string
  }) => {
    // Ensure tools is always an array
    const payload = {
      ...data,
      tools: data.tools || [],
    }
    console.log("API call payload:", payload)
    return api.post("/agents", payload)
  },
  update: (
    id: string,
    data: {
      name: string
      instructions: string
      tools?: string[]
      icon_name?: string
    },
  ) => {
    // Ensure tools is always an array
    const payload = {
      ...data,
      tools: data.tools || [],
    }
    return api.put(`/agents/${id}`, payload)
  },
  delete: (id: string) => api.delete(`/agents/${id}`),
}

// File API functions
export const fileAPI = {
  // Upload file
  upload: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  // Process link
  processLink: (data: { url: string; max_content_length?: number }) => api.post("/files/process-link", data),

  // List user files
  list: (params?: { limit?: number; skip?: number }) => api.get("/files/list", { params }),

  // Get file details
  getById: (fileId: string) => api.get(`/files/${fileId}`),

  // Delete file
  delete: (fileId: string) => api.delete(`/files/${fileId}`),

  // Get usage summary
  getUsageSummary: (days?: number) => api.get("/files/usage/summary", { params: { days } }),
}

// Tool API functions
export const toolAPI = {
  getAll: () =>
    api.get("/tools").then((response) => {
      // Handle both old format (direct array) and new format ({tools: [], total: number})
      if (response.data && Array.isArray(response.data.tools)) {
        return { ...response, data: response.data.tools }
      }
      return response
    }),
}

// Legacy endpoints (deprecated but kept for compatibility)
export const messageAPI = {
  send: (data: {
    content: string
    file_ids?: string[]
  }) => api.post("/message", data),

  sendToAgent: (data: {
    content: string
    agent_id: string
    file_ids?: string[]
  }) => api.post("/agents/message", data),
}

// System API functions
export const systemAPI = {
  getStatus: () => api.get("/status"),
  getLogs: (params?: {
    action?: string
    limit?: number
    start_date?: string
    end_date?: string
  }) => api.get("/logs", { params }),
}

// History API (legacy)
export const historyAPI = {
  getPromptHistory: () => api.get("/prompt-history"),
}

// Settings API (if exists)
export const settingsAPI = {
  get: () => api.get("/settings"),
  update: (data: any) => api.patch("/settings", data),
}

// Status API (if exists)
export const statusAPI = {
  get: () => api.get("/status"),
  getLogs: () => api.get("/logs"),
  exportLogs: () => api.get("/log-exports", { responseType: "blob" }),
}
