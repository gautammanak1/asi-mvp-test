"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DownloadIcon, XIcon, SmartphoneIcon } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
        setIsInstalled(true)
      }
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem("pwa-install-dismissed")
        if (!dismissed && !isInstalled) {
          setShowPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem("pwa-install-dismissed")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
        localStorage.setItem("pwa-install-dismissed", "true")
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error("Error during installation:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!showPrompt || !deferredPrompt || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SmartphoneIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Install ASI:One Edu</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            Install our app for a better experience with offline access and faster loading.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button onClick={handleInstallClick} className="flex-1 gap-2">
              <DownloadIcon className="h-4 w-4" />
              Install App
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
