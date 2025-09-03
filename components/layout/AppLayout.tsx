"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/authContext"
import Sidebar from "./Sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useIsMobile()

  // Pages that should not show sidebar
  const noSidebarPages = ["/login", "/register", "/", "/verify-email", "/auth"]
  const shouldShowSidebar = user && !noSidebarPages.includes(pathname)

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true)
    }
  }, [isMobile])

  if (!shouldShowSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "ml-0 lg:ml-64"
        } ${isMobile ? "ml-0" : ""}`}
      >
        {children}
      </main>
    </div>
  )
}
