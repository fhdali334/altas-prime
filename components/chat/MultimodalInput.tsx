"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Upload, Link, FileText } from "lucide-react"

interface MultimodalInputProps {
  onContentExtracted: (content: string, type: string) => void
  onClose: () => void
}

export default function MultimodalInput({ onContentExtracted, onClose }: MultimodalInputProps) {
  const [activeTab, setActiveTab] = useState<"url" | "file" | "text">("url")
  const [url, setUrl] = useState("")
  const [textContent, setTextContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUrlSubmit = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    try {
      // Simulate URL content extraction
      const content = `Content from URL: ${url}`
      onContentExtracted(content, "url")
      onClose()
    } catch (error) {
      console.error("Error extracting URL content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      onContentExtracted(content, "file")
      onClose()
    }
    reader.readAsText(file)
  }

  const handleTextSubmit = () => {
    if (!textContent.trim()) return
    onContentExtracted(textContent, "text")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Add Content</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveTab("url")}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "url" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Link className="w-4 h-4 inline mr-2" />
              URL
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "file" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              File
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "text" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Text
            </button>
          </div>

          {/* Content */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <Button onClick={handleUrlSubmit} disabled={!url.trim() || isLoading} className="w-full">
                {isLoading ? "Extracting..." : "Extract Content"}
              </Button>
            </div>
          )}

          {activeTab === "file" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Upload File</Label>
                <Input id="file" type="file" onChange={handleFileUpload} accept=".txt,.md,.json,.csv" />
              </div>
              <p className="text-sm text-gray-500">Supported formats: TXT, MD, JSON, CSV</p>
            </div>
          )}

          {activeTab === "text" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="text">Text Content</Label>
                <Textarea
                  id="text"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text content here..."
                  rows={6}
                />
              </div>
              <Button onClick={handleTextSubmit} disabled={!textContent.trim()} className="w-full">
                Add Text
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
