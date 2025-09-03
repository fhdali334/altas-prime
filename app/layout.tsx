import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/authContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import AppLayout from "@/components/layout/AppLayout"
import ErrorBoundary from "@/components/ErrorBoundary"
import NetworkErrorHandler from "@/components/NetworkErrorHandler"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Atlas Prime - AI Chat Platform",
  description: "Advanced AI chat platform with file processing and agent management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <div className="relative">
                <NetworkErrorHandler className="fixed top-0 left-0 right-0 z-50" />
                <AppLayout>{children}</AppLayout>
              </div>
              <Toaster />
              <SonnerToaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "white",
                    border: "1px solid #e5e7eb",
                    color: "#374151",
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
