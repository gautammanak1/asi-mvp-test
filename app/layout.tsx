import type React from "react"
import './globals.css';

import { Lexend } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ChatProvider } from "@/contexts/chat-context"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"

const lexend = Lexend({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a1a1a" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning className={lexend.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          storageKey="asimov-theme"
          disableTransitionOnChange={false}
        >
          <ChatProvider>
            {children}
            <PWAInstallPrompt />
            <OfflineIndicator />
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
