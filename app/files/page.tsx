"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import Sidebar from "@/components/layout/Sidebar"
import { fileAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Link, FileText, ImageIcon, Trash2, Eye, Plus, Menu } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"

interface FileItem {
  _id: string
  filename: string
  file_type: string
  file_size: number
  status: string
  upload_time: string
  token_count: number
  estimated_cost: number
  extracted_text?: string
  url?: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
        setViewMode('cards')
      } else {
        setViewMode('table')
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setIsLoading(true)
      const response = await fileAPI.list({ limit: 100 })
      setFiles(response.data.files || [])
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    const maxFiles = 5
    const maxFileSize = 7 * 1024 * 1024 // 7MB in bytes

    if (files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files at once.`)
      return
    }

    try {
      setIsUploading(true)

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (file.size > maxFileSize) {
          alert(`File "${file.name}" is too large. Maximum file size is 7MB.`)
          continue
        }

        await fileAPI.upload(file)
      }

      await fetchFiles()
      setShowUploadDialog(false)
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Error uploading files. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleLinkProcess = async () => {
    if (!linkUrl.trim()) return

    try {
      setIsUploading(true)
      await fileAPI.processLink({
        url: linkUrl,
        max_content_length: 5000,
      })
      await fetchFiles()
      setLinkUrl("")
      setShowUploadDialog(false)
    } catch (error) {
      console.error("Error processing link:", error)
      alert("Error processing link. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileAPI.delete(fileId)
      setFiles((prev) => prev.filter((f) => f._id !== fileId))
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="w-4 h-4 text-green-600" />
      case "pdf":
        return <FileText className="w-4 h-4 text-red-600" />
      case "link":
        return <Link className="w-4 h-4 text-blue-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const FileCard = ({ file }: { file: FileItem }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getFileIcon(file.file_type)}
          <span className="truncate">{file.filename}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant="secondary" className="text-xs capitalize">
            {file.file_type}
          </Badge>
          <Badge variant={file.status === "completed" ? "default" : "secondary"} className="text-xs">
            {file.status}
          </Badge>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Size: {formatFileSize(file.file_size)}</div>
          <div>Tokens: {file.token_count?.toLocaleString() || 0}</div>
          <div>Cost: ${file.estimated_cost?.toFixed(4) || "0.0000"}</div>
          <div>Uploaded: {formatDistanceToNow(new Date(file.upload_time), { addSuffix: true })}</div>
        </div>
        {file.url && (
          <div className="text-xs text-blue-600 truncate">{file.url}</div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedFile(file)}>
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteFile(file._id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} /> */}

        {/* Mobile menu button */}
        {/* <div className="lg:hidden fixed top-4 left-4 z-30">
          <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div> */}

        <div
          className={`flex-1 overflow-hidden transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-16" : "ml-0 "
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className=" p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-lg:ml-12">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Files</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Manage your uploaded files and processed links</p>
                </div>

                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 w-full sm:w-auto">
                      <Plus className="w-4 h-4" />
                      Add File
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New File</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* File Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Files (Max 5 files, 7MB each)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                          <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">Drag and drop files here, or click to select</p>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files
                              if (files) handleFileUpload(files)
                            }}
                            accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.json,.csv"
                            className="hidden"
                            id="file-upload"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="file-upload"
                            className={`inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                              isUploading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {isUploading ? "Uploading..." : "Choose Files"}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">PDF, Images, Text files (Max 7MB each)</p>
                        </div>
                      </div>

                      {/* Link Processing */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Process Link</label>
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="flex-1 text-sm"
                            disabled={isUploading}
                          />
                          <Button onClick={handleLinkProcess} disabled={!linkUrl.trim() || isUploading} size="sm">
                            {isUploading ? "Processing..." : "Process"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Files Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                  <p className="text-gray-500 mb-6 text-sm sm:text-base">Upload files or process links to get started</p>
                  <Button onClick={() => setShowUploadDialog(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First File
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  {isMobile ? (
                    <div className="grid grid-cols-1 gap-4">
                      {files.map((file) => (
                        <FileCard key={file._id} file={file} />
                      ))}
                    </div>
                  ) : (
                    /* Desktop Table View */
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>File</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead>Tokens</TableHead>
                              <TableHead>Cost</TableHead>
                              <TableHead>Uploaded</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {files.map((file) => (
                              <TableRow key={file._id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {getFileIcon(file.file_type)}
                                    <div>
                                      <div className="font-medium text-gray-900 truncate max-w-[200px]">{file.filename}</div>
                                      {file.url && (
                                        <div className="text-xs text-blue-600 truncate max-w-[200px]">{file.url}</div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="capitalize">
                                    {file.file_type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatFileSize(file.file_size)}</TableCell>
                                <TableCell>{file.token_count?.toLocaleString() || 0}</TableCell>
                                <TableCell>${file.estimated_cost?.toFixed(4) || "0.0000"}</TableCell>
                                <TableCell>{formatDistanceToNow(new Date(file.upload_time), { addSuffix: true })}</TableCell>
                                <TableCell>
                                  <Badge variant={file.status === "completed" ? "default" : "secondary"}>{file.status}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(file)}>
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteFile(file._id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Details Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              {selectedFile && getFileIcon(selectedFile.file_type)}
              <span className="truncate">{selectedFile?.filename}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {selectedFile.file_type}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {formatFileSize(selectedFile.file_size)}
                </div>
                <div>
                  <span className="font-medium">Tokens:</span> {selectedFile.token_count?.toLocaleString() || 0}
                </div>
                <div>
                  <span className="font-medium">Cost:</span> ${selectedFile.estimated_cost?.toFixed(4) || "0.0000"}
                </div>
              </div>

              {selectedFile.extracted_text && (
                <div>
                  <h4 className="font-medium mb-2">Extracted Content:</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{selectedFile.extracted_text}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
