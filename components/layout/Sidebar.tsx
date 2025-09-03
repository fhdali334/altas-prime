"use client"
import { usePathname, useRouter } from "next/navigation"
import {
  MessageSquare,
  Bot,
  Settings,
  FileText,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  Shield,
  Menu,
  Activity,
  Monitor,
  AlertTriangle,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/authContext"

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: MessageSquare },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Files", href: "/files", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Logs", href: "/logs", icon: Activity },
  { name: "Exports", href: "/exports", icon: Download },
  { name: "Settings", href: "/settings", icon: Settings },
]

const adminNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
  { name: "Monitoring", href: "/monitoring", icon: Monitor },
]

export default function Sidebar({ isCollapsed = false, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/auth")
    }
  }

  const handleNavigation = (href: string) => {
    if (isMobile && onToggle) {
      onToggle()
    }
    router.push(href)
  }

  const allNavigation = user?.role === "admin" ? [...navigation, ...adminNavigation] : navigation

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 bg-white shadow-md border border-gray-200 lg:hidden"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </Button>
      )}

      {/* Mobile Overlay */}
      {!isCollapsed && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
        ${isCollapsed && isMobile ? "-translate-x-full" : "translate-x-0"}
        ${!isCollapsed && isMobile ? "translate-x-0" : ""}
        lg:translate-x-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Atlas Prime</span>
                </div>
              )}
              {!isMobile && (
                <Button variant="ghost" size="sm" onClick={onToggle} className="p-1.5">
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {allNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left
                    ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </button>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            {!isCollapsed && user && (
              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    {user.role === "admin" && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <p className="text-xs text-blue-600 font-medium">Administrator</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50
                ${isCollapsed ? "justify-center px-2" : "justify-start"}
              `}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
