import axios from "axios"

// Create an axios instance for authentication
const authAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.atlasprimebr.com",
  headers: {
    "Content-Type": "application/json",
  },
})

// Token management utilities
export const tokenManager = {
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token")
    }
    return null
  },
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  },
  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
    }
  },
  getUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    }
    return null
  },
  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }
  },
}

// Add a request interceptor for authentication
authAPI.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor for error handling
authAPI.interceptors.response.use(
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

// Authentication API functions
export const authService = {
  // Register user
  register: (data: { email: string; password: string; username: string }) => authAPI.post("/auth/register", data),

  // Verify email
  verifyEmail: (token: string) => authAPI.post("/auth/verify-email", { token }),

  // Login user
  login: (data: { email: string; password: string }) => authAPI.post("/auth/login", data),

  // Get current user info
  getMe: () => authAPI.get("/auth/me"),

  // Forgot password
  forgotPassword: (email: string) => authAPI.post("/auth/forgot-password", { email }),

  // Reset password
  resetPassword: (data: { token: string; new_password: string }) => authAPI.post("/auth/reset-password", data),

  // Resend verification email
  resendVerification: (email: string) => authAPI.post("/auth/resend-verification", { email }),

  // Logout
  logout: () => authAPI.post("/auth/logout"),
}
