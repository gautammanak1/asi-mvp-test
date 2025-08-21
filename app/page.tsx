"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { Dashboard } from "@/components/dashboard"
import { useChat } from "@/contexts/chat-context"
import { registerServiceWorker } from "@/lib/pwa-utils"

export default function Home() {
  const { sidebarOpen, setSidebarOpen, dashboardView } = useChat()
  useEffect(() => {
    if (typeof window !== "undefined") {
      registerServiceWorker()
    }
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        fixed inset-y-0 left-0 z-50 w-80 transition-transform duration-300 ease-in-out
        lg:relative lg:z-auto lg:w-80 lg:translate-x-0
      `}
      >
        <Sidebar />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">{dashboardView ? <Dashboard /> : <ChatInterface />}</div>
    </div>
  )
}
