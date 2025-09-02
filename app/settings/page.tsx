"use client"

import { useState, useEffect } from "react"
import { settingsAPI } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Trash2, Menu } from "lucide-react"

interface Settings {
  model_settings: {
    model_name: string
    temperature: number
    max_tokens: number
  }
  log_settings: {
    retention_period_days: number
    auto_delete_expired_logs: boolean
  }
  profile_settings: {
    email: string
    username: string
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.get()
        setSettings(response.data)
      } catch (err) {
        setError("Failed to load settings")
        console.error("Error fetching settings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const saveSettings = async (section: keyof Settings, data: any) => {
    setSaving(true)
    try {
      await settingsAPI.update({ [section]: data })
      setError(null)
      // Refresh settings after save
      const response = await settingsAPI.get()
      setSettings(response.data)
    } catch (err) {
      setError("Failed to save settings")
      console.error("Error saving settings:", err)
    } finally {
      setSaving(false)
    }
  }

  const deleteAllLogs = async () => {
    if (!confirm("Are you sure you want to delete all logs? This action cannot be undone.")) return

    try {
      // This would need to be implemented in your backend
      // await api.delete("/logs")
      console.log("Delete all logs - to be implemented")
      setError(null)
    } catch (err) {
      setError("Failed to delete logs")
      console.error("Error deleting logs:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        {isMobile && (
          <div className="fixed top-4 left-4 z-40">
            <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div
          className={`flex-1 flex items-center justify-center transition-all duration-300 ${
            sidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-64"
          } ${isMobile ? "pt-16" : ""}`}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        {isMobile && (
          <div className="fixed top-4 left-4 z-40">
            <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div
          className={`flex-1 p-4 sm:p-6 transition-all duration-300 ${
            sidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-64"
          } ${isMobile ? "pt-16" : ""}`}
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error || "Failed to load settings"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {isMobile && (
        <div className="fixed top-4 left-4 z-40">
          <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div
        className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300 ${
          sidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-64"
        } ${isMobile ? "pt-16" : ""}`}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Settings</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6 sm:space-y-8 max-w-4xl">
          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="model" className="text-sm sm:text-base">
                  Model Name
                </Label>
                <select
                  id="model"
                  value={settings.model_settings.model_name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      model_settings: { ...settings.model_settings, model_name: e.target.value },
                    })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </select>
              </div>

              <div>
                <Label htmlFor="temperature" className="text-sm sm:text-base">
                  Temperature: {settings.model_settings.temperature}
                </Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.model_settings.temperature}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      model_settings: { ...settings.model_settings, temperature: Number.parseFloat(e.target.value) },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
                  <span>More Focused</span>
                  <span>More Creative</span>
                </div>
              </div>

              <div>
                <Label htmlFor="maxTokens" className="text-sm sm:text-base">
                  Max Tokens
                </Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={settings.model_settings.max_tokens}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      model_settings: { ...settings.model_settings, max_tokens: Number.parseInt(e.target.value) },
                    })
                  }
                  placeholder="e.g. 2000"
                  className="text-sm sm:text-base"
                />
              </div>

              <Button
                onClick={() => saveSettings("model_settings", settings.model_settings)}
                disabled={saving}
                className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Log Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Log Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="retention" className="text-sm sm:text-base">
                  Log Retention Period
                </Label>
                <select
                  id="retention"
                  value={settings.log_settings.retention_period_days}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      log_settings: {
                        ...settings.log_settings,
                        retention_period_days: Number.parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Auto-delete Expired Logs</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Automatically remove logs older than the retention period
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.log_settings.auto_delete_expired_logs}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        log_settings: { ...settings.log_settings, auto_delete_expired_logs: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => saveSettings("log_settings", settings.log_settings)}
                  disabled={saving}
                  className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={deleteAllLogs}
                  variant="destructive"
                  className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile_settings.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile_settings: { ...settings.profile_settings, email: e.target.value },
                    })
                  }
                  placeholder="your@email.com"
                  className="text-sm sm:text-base"
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-sm sm:text-base">
                  Display Name
                </Label>
                <Input
                  id="username"
                  value={settings.profile_settings.username}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile_settings: { ...settings.profile_settings, username: e.target.value },
                    })
                  }
                  placeholder="Your Name"
                  className="text-sm sm:text-base"
                />
              </div>

              <Button
                onClick={() => saveSettings("profile_settings", settings.profile_settings)}
                disabled={saving}
                className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
