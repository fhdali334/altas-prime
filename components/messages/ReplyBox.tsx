"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Link, X, Loader2 } from 'lucide-react'
import { fileAPI } from "@/lib/api"
import { toast } from "sonner"

interface ReplyBoxProps {
  onSendMessage: (content: string, fileIds?: string[]) => void
  disabled?: boolean
  placeholder?: string
}

export default function ReplyBox({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
}: ReplyBoxProps) {
  const [message, setMessage] = useState("")
  const [isProcessingUrl, setIsProcessingUrl] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string }>>([])
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && attachedFiles.length === 0) return
    if (disabled) return

    const fileIds = attachedFiles.map((file) => file.id)
    onSendMessage(message.trim(), fileIds.length > 0 ? fileIds : undefined)

    // Clear form
    setMessage("")
    setAttachedFiles([])

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingFile(true)

    for (const file of Array.from(files)) {
      try {
        const response = await fileAPI.upload(file)
        if (response?.data?.file_id) {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: response.data.file_id,
              name: file.name,
            },
          ])
          toast.success(`File "${file.name}" uploaded successfully`)
        } else {
          throw new Error("Invalid response from server")
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        toast.error(`Failed to upload "${file.name}"`)
      }
    }

    setIsUploadingFile(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUrlProcess = async () => {
    if (!urlInput.trim()) return

    setIsProcessingUrl(true)
    try {
      const response = await fileAPI.processLink({
        url: urlInput.trim(),
        max_content_length: 10000,
      })

      if (response?.data?.file_id) {
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: response.data.file_id,
            name: `URL: ${urlInput}`,
          },
        ])

        setUrlInput("")
        setShowUrlInput(false)
        toast.success("URL content processed successfully")
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      console.error("Error processing URL:", error)
      toast.error("Failed to process URL")
    } finally {
      setIsProcessingUrl(false)
    }
  }

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, isMobile ? 100 : 120) + "px"
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3 sm:p-4">
      {/* Attached Files */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
            >
              <span className="truncate max-w-24 sm:max-w-32">{file.name}</span>
              <button
                onClick={() => removeAttachedFile(file.id)}
                className="hover:bg-blue-100 rounded-full p-0.5"
                type="button"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* URL Input */}
      {showUrlInput && (
        <div className="mb-3 flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter URL to process..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            onKeyPress={(e) => e.key === "Enter" && handleUrlProcess()}
            disabled={disabled || isProcessingUrl}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleUrlProcess}
              disabled={!urlInput.trim() || isProcessingUrl || disabled}
              size="sm"
              type="button"
              className="flex-1 sm:flex-none"
            >
              {isProcessingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Processing...
                </>
              ) : (
                "Process"
              )}
            </Button>
            <Button
              onClick={() => {
                setShowUrlInput(false)
                setUrlInput("")
              }}
              variant="outline"
              size="sm"
              type="button"
              disabled={disabled}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "AI is responding..." : placeholder}
            disabled={disabled}
            className={`min-h-[44px] resize-none text-sm sm:text-base ${isMobile ? 'max-h-[100px]' : 'max-h-[120px]'}`}
            rows={1}
          />
        </div>

        <div className="flex gap-1">
          {/* File Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploadingFile}
            className="px-2 sm:px-3"
          >
            {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          </Button>

          {/* URL Process Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={disabled}
            className="px-2 sm:px-3"
          >
            <Link className="w-4 h-4" />
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={disabled || (!message.trim() && attachedFiles.length === 0)}
            size="sm"
            className="px-3 sm:px-4"
          >
            {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.json,.md"
          disabled={disabled}
        />
      </form>
    </div>
  )
}
