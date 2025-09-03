import { toast } from "sonner"

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export class AppError extends Error {
  public status: number
  public code: string
  public details: any

  constructor(message: string, status = 500, code = "UNKNOWN_ERROR", details?: any) {
    super(message)
    this.name = "AppError"
    this.status = status
    this.code = code
    this.details = details
  }
}

export const handleApiError = (error: any): ApiError => {
  console.error("API Error:", error)

  if (!error.response) {
    return {
      message: "Network error. Please check your internet connection and try again.",
      status: 0,
      code: "NETWORK_ERROR",
    }
  }

  const { status, data } = error.response

  switch (status) {
    case 400:
      return {
        message: data?.message || "Invalid request. Please check your input and try again.",
        status,
        code: "BAD_REQUEST",
        details: data,
      }
    case 401:
      return {
        message: "Authentication required. Please log in and try again.",
        status,
        code: "UNAUTHORIZED",
      }
    case 403:
      return {
        message: "Access denied. You don't have permission to perform this action.",
        status,
        code: "FORBIDDEN",
      }
    case 404:
      return {
        message: "The requested resource was not found.",
        status,
        code: "NOT_FOUND",
      }
    case 409:
      return {
        message: data?.message || "Conflict. The resource already exists or is in use.",
        status,
        code: "CONFLICT",
        details: data,
      }
    case 422:
      return {
        message: data?.message || "Validation error. Please check your input.",
        status,
        code: "VALIDATION_ERROR",
        details: data,
      }
    case 429:
      return {
        message: "Too many requests. Please wait a moment and try again.",
        status,
        code: "RATE_LIMIT",
      }
    case 500:
      return {
        message: "Internal server error. Please try again later.",
        status,
        code: "SERVER_ERROR",
      }
    case 502:
    case 503:
    case 504:
      return {
        message: "Service temporarily unavailable. Please try again later.",
        status,
        code: "SERVICE_UNAVAILABLE",
      }
    default:
      return {
        message: data?.message || "An unexpected error occurred. Please try again.",
        status,
        code: "UNKNOWN_ERROR",
        details: data,
      }
  }
}

export const showErrorToast = (error: ApiError | Error | string) => {
  let message: string
  let description: string | undefined

  if (typeof error === "string") {
    message = error
  } else if (error instanceof AppError) {
    message = error.message
    description = error.details ? `Error code: ${error.code}` : undefined
  } else if ("status" in error) {
    message = error.message
    description = error.status ? `Status: ${error.status}` : undefined
  } else {
    message = error.message || "An unexpected error occurred"
  }

  toast.error(message, {
    description,
    duration: 5000,
  })
}

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  })
}

export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 4000,
  })
}

export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 3000,
  })
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: any

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error:any) {
      lastError = error

      if (i === maxRetries) {
        throw error
      }

      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }

  throw lastError
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
