"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { WifiOffIcon, WifiIcon } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }
    updateOnlineStatus()
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (!showIndicator) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <Badge variant={isOnline ? "default" : "destructive"} className="gap-2 px-3 py-1">
        {isOnline ? (
          <>
            <WifiIcon className="h-3 w-3" />
            Back Online
          </>
        ) : (
          <>
            <WifiOffIcon className="h-3 w-3" />
            You're Offline
          </>
        )}
      </Badge>
    </div>
  )
}
