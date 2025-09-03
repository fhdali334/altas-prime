"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Database, Archive } from "lucide-react"

export default function ExportsPage() {
  const [isExportingLogs, setIsExportingLogs] = useState(false)
  const [isExportingConversations, setIsExportingConversations] = useState(false)
  const [isExportingAgents, setIsExportingAgents] = useState(false)

  const exportLogs = async () => {
    setIsExportingLogs(true)
    try {
      const response = await api.get("/log-exports", {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `system-logs-${new Date().toISOString().split("T")[0]}.txt`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting logs:", error)
    } finally {
      setIsExportingLogs(false)
    }
  }

  const exportConversations = async (format: "csv" | "json") => {
    setIsExportingConversations(true)
    try {
      const response = await api.get(`/export-conversations?format=${format}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `conversations-${new Date().toISOString().split("T")[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting conversations:", error)
    } finally {
      setIsExportingConversations(false)
    }
  }

  const exportAgents = async (format: "json" | "zip") => {
    setIsExportingAgents(true)
    try {
      const response = await api.get(`/export-agents?format=${format}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `agents-${new Date().toISOString().split("T")[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting agents:", error)
    } finally {
      setIsExportingAgents(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar /> */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Export Data</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {/* Export Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                System Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Download system logs and activity history</p>
              <Button onClick={exportLogs} disabled={isExportingLogs} className="w-full flex items-center gap-2">
                {isExportingLogs ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Logs (TXT)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Download your conversation history with agents</p>
              <div className="space-y-2">
                <Button
                  onClick={() => exportConversations("csv")}
                  disabled={isExportingConversations}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  {isExportingConversations ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export CSV
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => exportConversations("json")}
                  disabled={isExportingConversations}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  {isExportingConversations ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export JSON
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Agent Configurations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Download agent configurations and settings</p>
              <div className="space-y-2">
                <Button
                  onClick={() => exportAgents("json")}
                  disabled={isExportingAgents}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  {isExportingAgents ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export JSON
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => exportAgents("zip")}
                  disabled={isExportingAgents}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  {isExportingAgents ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export ZIP
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Information */}
        <Card className="mt-8 max-w-4xl">
          <CardHeader>
            <CardTitle>Export Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">System Logs</h4>
                <p>Contains application logs, error messages, and system activity. Exported as plain text file.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Conversations</h4>
                <p>
                  Your chat history with agents including messages, timestamps, and metadata. Available in CSV for
                  spreadsheet analysis or JSON for programmatic use.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Agent Configurations</h4>
                <p>
                  Agent settings, instructions, and tool configurations. JSON format for individual agents or ZIP
                  archive for bulk export.
                </p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  💡 All exports are generated in real-time and include data up to the current moment. Large datasets
                  may take a few moments to process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
