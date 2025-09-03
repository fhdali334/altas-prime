"use client"

import { useState, useCallback } from "react"
import { handleApiError, showErrorToast, type ApiError } from "@/lib/error-handler"

interface UseErrorHandlerReturn {
  error: ApiError | null
  isError: boolean
  clearError: () => void
  handleError: (error: any) => ApiError
  executeWithErrorHandling: <T>(
    fn: () => Promise<T>,
    options?: {
      showToast?: boolean
      onError?: (error: ApiError) => void
      onSuccess?: (result: T) => void
    },
  ) => Promise<T | null>
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<ApiError | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((error: any): ApiError => {
    const apiError = handleApiError(error)
    setError(apiError)
    return apiError
  }, [])

  const executeWithErrorHandling = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      options: {
        showToast?: boolean
        onError?: (error: ApiError) => void
        onSuccess?: (result: T) => void
      } = {},
    ): Promise<T | null> => {
      const { showToast = true, onError, onSuccess } = options

      try {
        clearError()
        const result = await fn()

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const apiError = handleError(err)

        if (showToast) {
          showErrorToast(apiError)
        }

        if (onError) {
          onError(apiError)
        }

        return null
      }
    },
    [clearError, handleError],
  )

  return {
    error,
    isError: error !== null,
    clearError,
    handleError,
    executeWithErrorHandling,
  }
}
